import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables!');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Exists' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixExistingGame() {
  try {
    // First get all games to see what we're working with
    const { data: allGames, error: listError } = await supabase
      .from('Game')
      .select('*');
      
    if (listError) {
      console.error('Error fetching games:', listError);
      return;
    }
    
    console.log('Found games:', allGames);
    
    if (!allGames || allGames.length === 0) {
      console.log('No games found to fix.');
      return;
    }
    
    // Get the current date
    const now = new Date();
    console.log('Current date:', now.toISOString());
    
    // Update all games to run today
    for (const game of allGames) {
      const { data, error } = await supabase
        .from('Game')
        .update({
          scheduledAt: now.toISOString(),
          state: 'RUNNING', // Set to running state
          updatedAt: now.toISOString()
        })
        .eq('id', game.id)
        .select();
        
      if (error) {
        console.error(`Error updating game ${game.id}:`, error);
      } else {
        console.log(`Successfully updated game ${game.id}:`, data);
      }
    }
    
    console.log('All games have been updated to today and set to RUNNING state!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixExistingGame(); 