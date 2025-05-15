import { CHAIN, FINGER_ON_BUTTON_CONTRACT_ADDRESS, THIRDWEB_BACKEND_WALLET } from '@/app/constants';
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

      // ---- START: Thirdweb Engine API Call ----
      const thirdwebEngineUrl = process.env.THIRDWEB_ENGINE_URL;
      const chainId = CHAIN.id; // TODO: Ensure this ENV VAR is set with your contract's chain ID (e.g., "80002")
      const gameContractAddress = FINGER_ON_BUTTON_CONTRACT_ADDRESS; // TODO: Ensure this ENV VAR is set with your game contract's address
      const accessToken = process.env.THIRDWEB_ACCESS_TOKEN; // Bearer token for Engine API
      const backendWalletAddress = THIRDWEB_BACKEND_WALLET; // Wallet to execute from

      // TODO: Replace with your actual function signature
      const functionSignature = "withdrawGameFunds(string gameId, address winnerAddress)"; 
      // TODO: Ensure arguments match the types and order in functionSignature.
      // For uint256, ensure it's passed as a string if it's a BigInt.
      const functionArgs = [gameId.toString(), lastPlayer.address]; 

      // TODO: Provide the ABI fragment for your 'withdrawGameFunds' function.
      // Example:
      // const contractAbiFragment = [
      //   {
      //     "type": "function",
      //     "name": "withdrawGameFunds",
      //     "inputs": [
      //       { "name": "gameId", "type": "uint256" },
      //       { "name": "winnerAddress", "type": "address" }
      //     ],
      //     "outputs": [],
      //     "stateMutability": "nonpayable"
      //   }
      // ];

      if (!thirdwebEngineUrl || !chainId || !gameContractAddress || !accessToken || !backendWalletAddress) {
        console.error("Thirdweb Engine API configuration missing in environment variables. Skipping withdrawGameFunds call.");
      } else {
        const engineApiUrl = `${thirdwebEngineUrl}/contract/${chainId}/${gameContractAddress}/write`;
        
        const payload = {
          functionName: functionSignature,
          args: functionArgs,
          // txOverrides: { // Optional: uncomment and configure if needed
          //   // "gas": "530000", // Example gas limit
          //   // "value": "0" // Example value in wei (if function is not payable, typically "0")
          // }
        };

        try {
          console.log(`Calling Thirdweb Engine API: POST ${engineApiUrl} by wallet ${backendWalletAddress}`);
          const response = await fetch(engineApiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-Backend-Wallet-Address': backendWalletAddress,
            },
            body: JSON.stringify(payload),
          });

          const responseData = await response.json();

          if (response.ok) {
            console.log('Successfully called withdrawGameFunds via Thirdweb Engine API. Response:', responseData);
            // Expected response might be like: { "result": { "queueId": "..." } }
          } else {
            console.error('Error calling Thirdweb Engine API:', response.status, responseData);
            // Expected error might be like: { "error": { "message": "...", "reason": "...", "stack": "..."} }
            // Consider how this error should affect the overall API response to your client.
          }
        } catch (engineFetchError) {
          console.error('Network or other unexpected error calling Thirdweb Engine API:', engineFetchError);
        }
      }
      // ---- END: Thirdweb Engine API Call ----
      
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