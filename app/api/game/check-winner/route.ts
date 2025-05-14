import { supabase } from '@/app/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get game ID and player ID from request
    const { gameId } = await request.json();
    
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
    // Check the count of players still holding
    const { count, error: countError } = await supabase
      .from('Player')
      .select('*', { count: 'exact', head: true })
      .eq('gameId', gameId)
      .eq('status', 'HOLDING');
      
    if (countError) {
      console.error('Error counting players:', countError);
      return NextResponse.json({ error: 'Failed to count players' }, { status: 500 });
    }
    
    // If only one player remains, they are the winner
    if (count === 1) {
      // Find the last remaining player
      const { data: lastPlayer, error: playerError } = await supabase
        .from('Player')
        .select('*')
        .eq('gameId', gameId)
        .eq('status', 'HOLDING')
        .single();
        
      if (playerError) {
        console.error('Error finding last player:', playerError);
        return NextResponse.json({ error: 'Failed to find the last player' }, { status: 500 });
      }
      
      // Update the game state and set the winner
      const { error: updateGameError } = await supabase
        .from('Game')
        .update({
          state: 'FINISHED',
          winnerId: lastPlayer.id,
          updatedAt: new Date().toISOString()
        })
        .eq('id', gameId);
        
      if (updateGameError) {
        console.error('Error updating game:', updateGameError);
        return NextResponse.json({ error: 'Failed to update game state' }, { status: 500 });
      }
      
      // Update the player status to WINNER
      const { error: updatePlayerError } = await supabase
        .from('Player')
        .update({
          status: 'WINNER'
        })
        .eq('id', lastPlayer.id);
        
      if (updatePlayerError) {
        console.error('Error updating player status:', updatePlayerError);
        return NextResponse.json({ error: 'Failed to update player status' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        winner: lastPlayer,
        gameFinished: true 
      });
    }
    
    // If more than one player remains, the game continues
    return NextResponse.json({ 
      gameFinished: false,
      remainingPlayers: count 
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 