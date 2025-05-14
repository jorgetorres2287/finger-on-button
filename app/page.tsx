'use client';

import { useEffect, useState } from 'react';
import GameShell from './components/GameShell';
import { supabase } from './lib/supabase';
import type { Game } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

export default function Home() {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const { setFrameReady, isFrameReady, context } = useMiniKit();

  console.log({ context });

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    async function fetchOrCreateGame() {
      try {
        // Get today's date bounds in Eastern Time
        const now = new Date();
        console.log('Current date/time:', now.toISOString());
        
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        console.log('Today bounds:', {
          start: today.toISOString(),
          end: tomorrow.toISOString()
        });

        // First try to fetch today's game
        console.log('Querying for games between', today.toISOString(), 'and', tomorrow.toISOString());
        
        const { data: games, error } = await supabase
          .from('Game')
          .select('*')
          .gte('scheduledAt', today.toISOString())
          .lt('scheduledAt', tomorrow.toISOString())
          .order('scheduledAt', { ascending: true });  // Removed limit to see all games
          
        // If we don't find any games for today, try to find any game in RUNNING state
        if (!games || games.length === 0) {
          console.log('No games found for today. Checking for any RUNNING game...');
          
          const { data: runningGames, error: runningError } = await supabase
            .from('Game')
            .select('*')
            .eq('state', 'RUNNING');
            
          if (runningError) {
            console.error('Error fetching running games:', runningError);
          } else if (runningGames && runningGames.length > 0) {
            console.log('Found running game:', runningGames[0]);
            setGame(runningGames[0] as unknown as Game);
            setLoading(false);
            return;
          }
        }

        console.log('Games found:', games);

        if (error) {
          console.error('Error fetching game:', error);
          setLoading(false);
          return;
        }

        if (games && games.length > 0) {
          console.log('Using game:', games[0]);
          setGame(games[0] as unknown as Game);
        } else {
          console.log('No game found, creating a new one');
          // Create a new game for today at noon ET
          const noon = new Date(today);
          noon.setHours(12, 0, 0, 0);

          const { data: newGame, error: createError } = await supabase
            .from('Game')
            .insert([
              { 
                id: uuidv4(),
                scheduledAt: noon.toISOString(),
                state: 'WAITING',
                createdAt: now.toISOString(),
                updatedAt: now.toISOString()
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error('Error creating game:', createError);
            setLoading(false);
            return;
          }

          console.log('Created new game:', newGame);
          setGame(newGame as unknown as Game);
        }
      } catch (error) {
        console.error('Unhandled error in fetchOrCreateGame:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrCreateGame();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading game... (Check console for debug info)</div>;
  }

  if (!game) {
    return <div className="min-h-screen flex items-center justify-center">Could not load the game. Please check console logs and try again.</div>;
  }
  
  return (
    <div className="flex flex-col gap-2">
      <GameShell game={game} />
    </div>
  );
}
