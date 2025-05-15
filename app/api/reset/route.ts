import { supabase } from '../../lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Delete all players
    const { error: playerError } = await supabase
      .from('Player')
      .delete()
      .neq('id', '0'); // Workaround to delete all rows, as Supabase requires a filter

    if (playerError) {
      console.error('Error deleting players:', playerError);
      return NextResponse.json({ error: 'Failed to delete players', details: playerError.message }, { status: 500 });
    }

    // Delete all games
    const { error: gameError } = await supabase
      .from('Game')
      .delete()
      .neq('id', '0'); // Workaround to delete all rows

    if (gameError) {
      console.error('Error deleting games:', gameError);
      return NextResponse.json({ error: 'Failed to delete games', details: gameError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Successfully deleted all players and games' });
  } catch (error) {
    console.error('Unhandled error in reset route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'An unexpected error occurred', details: errorMessage }, { status: 500 });
  }
} 