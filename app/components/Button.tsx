'use client';

import { useRef, useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface ButtonProps {
  gameId: string;
  userId: string;
  socket: Socket;
  gameState: 'WAITING' | 'RUNNING' | 'FINISHED';
}

export default function Button({ gameId, userId, socket, gameState }: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  // Setup socket event listeners
  useEffect(() => {
    socket.on('gameOver', ({ winnerUserId }) => {
      if (winnerUserId === userId) {
        setIsWinner(true);
      }
    });
    
    return () => {
      socket.off('gameOver');
    };
  }, [socket, userId]);
  
  // Handle visibility change (tab switching/minimizing)
  useEffect(() => {
    if (gameState !== 'RUNNING' || isEliminated) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isPressed) {
        handlePointerUp();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameState, isPressed, isEliminated]);
  
  // Prevent context menu on button
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    button.addEventListener('contextmenu', preventContextMenu);
    
    return () => {
      button.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);
  
  const handlePointerDown = () => {
    if (gameState !== 'RUNNING' || isEliminated) return;
    setIsPressed(true);
  };
  
  const handlePointerUp = () => {
    if (gameState !== 'RUNNING' || !isPressed || isEliminated) return;
    
    setIsPressed(false);
    setIsEliminated(true);
    
    // Notify server
    socket.emit('pointerUp', { gameId, userId });
  };
  
  // Handle pointer leaving button area
  const handlePointerLeave = () => {
    if (gameState !== 'RUNNING' || !isPressed || isEliminated) return;
    handlePointerUp();
  };
  
  if (gameState === 'FINISHED') {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          {isWinner ? 'You won! 🎉' : 'Game over'}
        </h2>
        <div 
          className="w-40 h-40 mx-auto rounded-full bg-gray-400"
        ></div>
      </div>
    );
  }
  
  if (isEliminated) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">You&apos;re eliminated!</h2>
        <div
          className="w-40 h-40 mx-auto rounded-full bg-gray-400"
        ></div>
      </div>
    );
  }
  
  const buttonColor = isPressed ? 'bg-red-800' : 'bg-red-600';
  
  return (
    <div className="text-center">
      {gameState === 'RUNNING' && (
        <h2 className="text-2xl font-bold mb-4">
          {isPressed ? 'Keep holding!' : 'Press and hold the button!'}
        </h2>
      )}
      
      <div
        ref={buttonRef}
        className={`w-40 h-40 mx-auto rounded-full ${buttonColor} select-none touch-none cursor-pointer transition-colors`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerUp}
      ></div>
      
      <p className="mt-4 italic">
        {gameState === 'RUNNING' 
          ? 'Last finger on the button wins!' 
          : 'The game will start soon...'}
      </p>
    </div>
  );
} 