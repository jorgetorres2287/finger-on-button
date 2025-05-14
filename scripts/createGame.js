// scripts/create-test-game.js
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

async function createTestGame() {
  // Create a game scheduled 5 minutes from now
  const scheduledTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('Game')
    .insert([
      {
        id: uuidv4(),
        scheduledAt: scheduledTime,
        state: 'WAITING',
        createdAt: now,
        updatedAt: now
      }
    ])
    .select();
    
  if (error) {
    console.error('Error creating test game:', error);
    return;
  }
  
  console.log('Test game created successfully:', data);
}

createTestGame();