'use client';

import { useEffect, useState } from 'react';
import GameShell from './components/GameShell';
import { supabase } from './lib/supabase';
import type { Game } from '@prisma/client';

export default function Home() {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrCreateGame() {
      try {
        // Get today's date bounds in Eastern Time
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // First try to fetch today's game
        const { data: games, error } = await supabase
          .from('games')
          .select('*')
          .gte('scheduledAt', today.toISOString())
          .lt('scheduledAt', tomorrow.toISOString())
          .order('scheduledAt', { ascending: true })
          .limit(1);

        if (error) {
          console.error('Error fetching game:', error);
          return;
        }

        if (games && games.length > 0) {
          setGame(games[0] as unknown as Game);
        } else {
          // Create a new game for today at noon ET
          const noon = new Date(today);
          noon.setHours(12, 0, 0, 0);

          const { data: newGame, error: createError } = await supabase
            .from('games')
            .insert([
              { 
                scheduledAt: noon.toISOString(),
                state: 'WAITING' 
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error('Error creating game:', createError);
            return;
          }

          setGame(newGame as unknown as Game);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrCreateGame();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading game...</div>;
  }

  if (!game) {
    return <div className="min-h-screen flex items-center justify-center">Could not load the game. Please try again.</div>;
  }
  
  return <GameShell game={game} />;
}
