'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Countdown from './Countdown';
import Button from './Button';
import { getOrCreateUserIdClient, signInAnonymously } from '../lib/auth';
import type { Game } from '@prisma/client';

interface GameShellProps {
  game: Game;
}

export default function GameShell({ game }: GameShellProps) {
  // Debug: Log game details
  console.log('GameShell received game:', {
    id: game.id,
    scheduledAt: game.scheduledAt,
    state: game.state
  });

  const [gameState, setGameState] = useState<'WAITING' | 'RUNNING' | 'FINISHED'>(
    game.state as 'WAITING' | 'RUNNING' | 'FINISHED'
  );
  const [playerCount, setPlayerCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket>();
  
  // Initialize user authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to sign in anonymously with Supabase
        try {
          const id = await signInAnonymously();
          if (id) {
            setUserId(id);
            return;
          }
        } catch (_) {
          console.warn('Anonymous auth disabled or failed, using local ID instead');
          // Continue to fallback
        }
        
        // If Supabase anonymous auth fails, fall back to local ID
        const localId = await getOrCreateUserIdClient();
        setUserId(localId);
      } catch (error) {
        console.error('Auth error:', error);
        // Fallback to generated UUID if all auth methods fail
        const fallbackId = crypto.randomUUID();
        setUserId(fallbackId);
      }
    };
    
    initAuth();
  }, []);
  
  // Initialize socket connection once we have a userId
  useEffect(() => {
    if (!userId) return;
    
    // Create socket connection
    const socket = io({
      path: '/api/socket',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socketRef.current = socket;
    
    // Connect to the game
    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('join', {
        gameId: game.id,
        userId,
      });
    });
    
    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    // Listen for game events
    socket.on('gameStart', () => {
      setGameState('RUNNING');
    });
    
    socket.on('playerUpdate', ({ count }) => {
      setPlayerCount(count);
      console.log(`Player count updated: ${count}`);
    });
    
    socket.on('gameOver', ({ winnerUserId }) => {
      console.log(`Game over event received. Winner: ${winnerUserId || 'None'}`);
      setGameState('FINISHED');
      
      if (winnerUserId) {
        console.log(`Game over! Winner: ${winnerUserId === userId ? 'You' : 'Another player'}`);
      } else {
        console.log('Game over! No winners, all players eliminated.');
      }
    });
    
    // Handle socket errors
    socket.on('error', (error) => {
      console.error('Socket event error:', error);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [game.id, userId]);
  
  // Handle game start
  const handleGameStart = () => {
    if (!socketRef.current || !userId) return;
    
    setGameState('RUNNING');
    socketRef.current.emit('startGame', {
      gameId: game.id,
    });
  };
  
  if (!userId) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
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
            userId={userId}
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