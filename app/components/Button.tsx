'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface ButtonProps {
  gameId: string;
  userId: string;
  gameState: 'WAITING' | 'RUNNING' | 'FINISHED';
}

export default function Button({ gameId, userId, gameState }: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  // Initialize Supabase Realtime channel
  useEffect(() => {
    // Setup channel for game updates
    const gameChannel = supabase
      .channel(`game-${gameId}`)
      // Listen for game state changes
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Game',
        filter: `id=eq.${gameId}`,
      }, (payload) => {
        // Check if game is finished
        if (payload.new.state === 'FINISHED') {
          // Check if this player is the winner
          if (payload.new.winnerId === `${gameId}-${userId}`) {
            setIsWinner(true);
          }
        }
      })
      // Listen for player status changes
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Player',
        filter: `id=eq.${gameId}-${userId}`,
      }, (payload) => {
        // Check if player status was updated to WINNER
        if (payload.new.status === 'WINNER') {
          setIsWinner(true);
        }
      })
      .subscribe();
    
    return () => {
      gameChannel.unsubscribe();
    };
  }, [gameId, userId]);
  
  // Handle button press logic
  const handlePointerUp = useCallback(async () => {
    if (gameState !== 'RUNNING' || !isPressed || isEliminated) return;
    
    setIsPressed(false);
    setIsEliminated(true);
    
    // Update player status through Supabase API
    await supabase
      .from('Player')
      .update({ 
        status: 'ELIMINATED',
        eliminatedAt: new Date().toISOString()
      })
      .eq('id', `${gameId}-${userId}`);
      
  }, [gameState, isPressed, isEliminated, gameId, userId]);
  
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
  }, [gameState, isPressed, isEliminated, handlePointerUp]);
  
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