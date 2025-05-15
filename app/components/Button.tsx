'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { isPlayerInGame } from '@/thirdweb/84532/0xe94e6b6978298b7542d9e316772fb365a4bdb1cc';
import { useAccount } from 'wagmi';
import { defineChain, getContract } from 'thirdweb';
import { CHAIN, client, FINGER_ON_BUTTON_CONTRACT_ADDRESS } from '../constants';
import { PayToPlay } from './PayToPlay';

interface ButtonProps {
  gameId: string;
  userId: string;
  gameState: 'WAITING' | 'RUNNING' | 'FINISHED';
  winnerId: string | null;
}

export default function Button({ gameId, userId, gameState, winnerId }: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const [didPlayerPayToEnterGame, setDidPlayerPayToEnterGame] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    const checkIfPlayerPaidToEnterGame = async () => {
      if (!address || didPlayerPayToEnterGame) return;
      const didPlayerPay = await isPlayerInGame({
        gameId,
        user: address,
        contract: getContract({
          address: FINGER_ON_BUTTON_CONTRACT_ADDRESS,
          chain: defineChain(CHAIN.id),
          client,
        })
      });
      console.log('didPlayerPay', didPlayerPay);
      setDidPlayerPayToEnterGame(didPlayerPay);
    }
    checkIfPlayerPaidToEnterGame();
  }, [address, gameId, didPlayerPayToEnterGame]);
  
  // Check if this player is the winner when winnerId changes
  useEffect(() => {
    if (winnerId && winnerId === `${gameId}-${userId}`) {
      setIsWinner(true);
    }
  }, [winnerId, gameId, userId]);
  
  // Initialize Supabase Realtime channel
  useEffect(() => {
    // Setup channel for game updates
    const gameChannel = supabase
      .channel(`game-${gameId}`)
      // Listen for player status changes
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Player',
        filter: `id=eq.${gameId}-${userId}`,
      }, (payload) => {
        // Check if player status was updated to WINNER
        if (payload.new.status === 'WINNER') {
          setIsWinner(true);
        } else if (payload.new.status === 'ELIMINATED') {
          setIsEliminated(true);
          setIsPressed(false);
        }
      })
      .subscribe();
    
    return () => {
      gameChannel.unsubscribe();
    };
  }, [gameId, userId]);
  
  // Handle button press logic
  const handlePointerUp = useCallback(async () => {
    if (gameState !== 'RUNNING' || !isPressed || isEliminated) return;
    
    setIsPressed(false);
    setIsEliminated(true);
    
    try {
      // Update player status through Supabase API
      await supabase
        .from('Player')
        .update({ 
          status: 'ELIMINATED',
          eliminatedAt: new Date().toISOString()
        })
        .eq('id', `${gameId}-${userId}`);
      
      // Call the check-winner API to determine if a winner should be declared
      const response = await fetch('/api/game/check-winner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId }),
      });
      
      const result = await response.json();
      
      console.log('Check winner result:', result);
      
      // No need to handle the result here as the Game update will trigger the realtime subscription
    } catch (error) {
      console.error('Error during player elimination:', error);
    }
  }, [gameState, isPressed, isEliminated, gameId, userId]);
  
  // Handle visibility change (tab switching/minimizing)
  useEffect(() => {
    if (gameState !== 'RUNNING' || isEliminated) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isPressed) {
        handlePointerUp();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameState, isPressed, isEliminated, handlePointerUp]);
  
  // Prevent context menu on button
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    button.addEventListener('contextmenu', preventContextMenu);
    
    return () => {
      button.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);
  
  const handlePointerDown = useCallback(async () => {
    if (gameState !== 'RUNNING' || isEliminated) return;
    setIsPressed(true);
    
    try {
      // Update player status to HOLDING when button is pressed
      await supabase
        .from('Player')
        .update({ 
          status: 'HOLDING'
        })
        .eq('id', `${gameId}-${userId}`);
    } catch (error) {
      console.error('Error updating player status to HOLDING:', error);
    }
  }, [gameState, isEliminated, gameId, userId]);
  
  // Handle pointer leaving button area
  const handlePointerLeave = () => {
    if (gameState !== 'RUNNING' || !isPressed || isEliminated) return;
    handlePointerUp();
  };
  
  if (gameState === 'FINISHED') {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          {isWinner ? 'You won! 🎉' : 'Game over'}
        </h2>
        <div 
          className="w-40 h-40 mx-auto rounded-full bg-gray-400"
        ></div>
      </div>
    );
  }
  
  if (isEliminated) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">You&apos;re eliminated!</h2>
        <div
          className="w-40 h-40 mx-auto rounded-full bg-gray-400"
        ></div>
      </div>
    );
  }
  
  const buttonColor = isPressed ? 'bg-red-800' : 'bg-red-600';

  if (!didPlayerPayToEnterGame) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Please pay to enter the game</h2>
        <PayToPlay gameId={gameId} onSuccess={() => setDidPlayerPayToEnterGame(true)} />
      </div>
    );
  }
  
  return (
    <div className="text-center">
      {gameState === 'RUNNING' && (
        <h2 className="text-2xl font-bold mb-4">
          {isPressed ? 'Keep holding!' : 'Press and hold the button!'}
        </h2>
      )}
      
      <div
        ref={buttonRef}
        className={`w-40 h-40 mx-auto rounded-full ${buttonColor} select-none touch-none cursor-pointer transition-colors`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerUp}
      ></div>
      
      <p className="mt-4 italic">
        {gameState === 'RUNNING' 
          ? 'Last finger on the button wins!' 
          : 'The game will start soon...'}
      </p>
    </div>
  );
} 