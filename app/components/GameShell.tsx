'use client';

import { useEffect, useState } from 'react';
import Countdown from './Countdown';
import Button from './Button';
import { getOrCreateUserIdClient, signInAnonymously } from '../lib/auth';
import type { Game } from '@prisma/client';
import { supabase } from '../lib/supabase';

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
  const [winnerId, setWinnerId] = useState<string | null>(game.winnerId || null);
  
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
        } catch (err) {
          console.warn('Anonymous auth disabled or failed, using local ID instead', err);
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
  
  // Subscribe to game changes
  useEffect(() => {
    if (!userId) return;
    
    const gameChannel = supabase
      .channel(`game-state-${game.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Game',
        filter: `id=eq.${game.id}`,
      }, (payload) => {
        console.log('Game updated:', payload.new);
        
        // Update game state
        setGameState(payload.new.state as 'WAITING' | 'RUNNING' | 'FINISHED');
        
        // Update winner ID if available
        if (payload.new.winnerId) {
          setWinnerId(payload.new.winnerId);
        }
      })
      .subscribe();
      
    return () => {
      gameChannel.unsubscribe();
    };
  }, [game.id, userId]);
  
  // Initialize realtime connection once we have a userId
  useEffect(() => {
    if (!userId) return;
    
    // Join or create player in the game
    const joinGame = async () => {
      // Don't join if the game is already finished
      if (gameState === 'FINISHED') {
        return;
      }
      
      await supabase
        .from('Player')
        .upsert({
          id: `${game.id}-${userId}`,
          gameId: game.id,
          userId: userId,
          status: 'HOLDING',
          joinedAt: new Date().toISOString()
        });
    };
    
    joinGame();
    
    // Listen for player count changes
    const channel = supabase
      .channel(`game:${game.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Player',
        filter: `gameId=eq.${game.id}`
      }, async () => {
        // Get updated player count
        const { count } = await supabase
          .from('Player')
          .select('*', { count: 'exact', head: true })
          .eq('gameId', game.id)
          .eq('status', 'HOLDING');
          
        setPlayerCount(count || 0);
      })
      .subscribe();
      
    return () => {
      channel.unsubscribe();
    };
  }, [game.id, userId]);
  
  // Handle game start
  const handleGameStart = async () => {
    if (!userId) return;
    
    setGameState('RUNNING');
    
    // Update game state in database
    await supabase
      .from('Game')
      .update({ 
        state: 'RUNNING',
        updatedAt: new Date().toISOString()
      })
      .eq('id', game.id);
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
            gameState={gameState}
            winnerId={winnerId}
          />
        )}
        
        <div className="mt-8 text-center">
          {gameState !== 'FINISHED' && (
            <p className="text-lg">
              {playerCount > 0 && `${playerCount} player${playerCount !== 1 ? 's' : ''} in the game`}
            </p>
          )}
        </div>
      </main>
      
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>Keep your finger on the button! Last player to lift their finger wins.</p>
      </footer>
    </div>
  );
} 