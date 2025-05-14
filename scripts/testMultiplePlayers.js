import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
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

async function createGameWithMultiplePlayers() {
  try {
    // Create a game scheduled for now (not future date)
    const now = new Date();
    const scheduledTime = now.toISOString();  // Use current time
    
    console.log('Creating a new game...');
    
    // Create the game
    const { data: gameData, error: gameError } = await supabase
      .from('Game')
      .insert([
        {
          id: uuidv4(),
          scheduledAt: scheduledTime,
          state: 'RUNNING',  // Set to RUNNING so it's immediately playable
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        }
      ])
      .select();
      
    if (gameError) {
      console.error('Error creating game:', gameError);
      return;
    }
    
    const game = gameData[0];
    console.log('Game created successfully:', game);
    
    // Create multiple players
    const playerCount = 3;
    console.log(`Adding ${playerCount} players to the game...`);
    
    const players = [];
    for (let i = 0; i < playerCount; i++) {
      const userId = `test-user-${i + 1}`;
      const playerId = `${game.id}-${userId}`;
      
      players.push({
        id: playerId,
        gameId: game.id,
        userId: userId,
        status: 'HOLDING',
        joinedAt: now.toISOString()
      });
    }
    
    const { data: playerData, error: playerError } = await supabase
      .from('Player')
      .insert(players)
      .select();
      
    if (playerError) {
      console.error('Error creating players:', playerError);
      return;
    }
    
    console.log('Players created successfully:', playerData);
    console.log('\nTest your game by:');
    console.log(`1. Opening your app and going to the game page`);
    console.log(`2. The game with ID ${game.id} should be running`);
    console.log(`3. Try the winning scenario by having multiple browser windows open and letting players drop out`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createGameWithMultiplePlayers(); 