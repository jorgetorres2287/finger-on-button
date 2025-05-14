'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Countdown from './Countdown';
import Button from './Button';
import { getOrCreateUserIdClient } from '../lib/auth';
import type { Game } from '@prisma/client';

interface GameShellProps {
  game: Game;
}

export default function GameShell({ game }: GameShellProps) {
  const [gameState, setGameState] = useState<'WAITING' | 'RUNNING' | 'FINISHED'>(
    game.state as 'WAITING' | 'RUNNING' | 'FINISHED'
  );
  const [playerCount, setPlayerCount] = useState(0);
  const socketRef = useRef<Socket>();
  const userId = useRef<string>(getOrCreateUserIdClient());
  
  // Initialize socket connection
  useEffect(() => {
    const socket = io({
      path: '/api/socket',
    });
    socketRef.current = socket;
    
    // Connect to the game
    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('join', {
        gameId: game.id,
        userId: userId.current,
      });
    });
    
    // Listen for game events
    socket.on('gameStart', () => {
      setGameState('RUNNING');
    });
    
    socket.on('playerUpdate', ({ count }) => {
      setPlayerCount(count);
    });
    
    socket.on('gameOver', () => {
      setGameState('FINISHED');
    });
    
    return () => {
      socket.disconnect();
    };
  }, [game.id]);
  
  // Handle game start
  const handleGameStart = () => {
    if (!socketRef.current) return;
    
    setGameState('RUNNING');
    socketRef.current.emit('startGame', {
      gameId: game.id,
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Finger on the Button</h1>
        <p className="text-xl mt-2">Last one to hold wins!</p>
      </header>
      
      <main className="w-full max-w-md mx-auto">
        {gameState === 'WAITING' ? (
          <Countdown 
            targetTime={new Date(game.scheduledAt)} 
            onComplete={handleGameStart}
          />
        ) : (
          <Button
            gameId={game.id}
            userId={userId.current}
            socket={socketRef.current!}
            gameState={gameState}
          />
        )}
        
        <div className="mt-8 text-center">
          <p className="text-lg">
            {playerCount > 0 && `${playerCount} player${playerCount !== 1 ? 's' : ''} in the game`}
          </p>
        </div>
      </main>
      
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>Keep your finger on the button! Last player to lift their finger wins.</p>
      </footer>
    </div>
  );
} 