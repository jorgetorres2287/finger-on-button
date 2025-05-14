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

async function checkAndCreatePlayers() {
  try {
    // First get all games
    const { data: games, error: gameError } = await supabase
      .from('Game')
      .select('*');
      
    if (gameError) {
      console.error('Error fetching games:', gameError);
      return;
    }
    
    console.log(`Found ${games.length} games`);
    
    if (games.length === 0) {
      console.log('No games found. Create a game first.');
      return;
    }
    
    // For each game, check if there are players
    for (const game of games) {
      console.log(`Checking game ${game.id}...`);
      
      const { data: players, error: playerError } = await supabase
        .from('Player')
        .select('*')
        .eq('gameId', game.id);
        
      if (playerError) {
        console.error(`Error fetching players for game ${game.id}:`, playerError);
        continue;
      }
      
      console.log(`Game ${game.id} has ${players ? players.length : 0} players`);
      
      // If no players or fewer than 2 players, create test players
      if (!players || players.length < 2) {
        console.log(`Creating test players for game ${game.id}...`);
        
        const now = new Date();
        
        // Create 3 players
        const testPlayers = [];
        for (let i = 0; i < 3; i++) {
          const userId = `test-user-${i + 1}-${Date.now()}`;
          const playerId = `${game.id}-${userId}`;
          
          testPlayers.push({
            id: playerId,
            gameId: game.id,
            userId: userId,
            status: 'HOLDING',
            joinedAt: now.toISOString()
          });
        }
        
        const { data: newPlayers, error: createError } = await supabase
          .from('Player')
          .insert(testPlayers)
          .select();
          
        if (createError) {
          console.error(`Error creating players for game ${game.id}:`, createError);
        } else {
          console.log(`Successfully created ${newPlayers.length} players for game ${game.id}`);
          console.log('Player IDs:', newPlayers.map(p => p.id).join(', '));
        }
      }
    }
    
    console.log('Done checking and creating players');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAndCreatePlayers(); 