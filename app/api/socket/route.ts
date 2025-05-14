import { Server as ServerIO } from 'socket.io';
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

// Global instance of Socket.io server
let io: ServerIO;

export async function GET() {
  if (!io) {
    console.log('Initializing Socket.io server...');
    
    // Create a new Socket.io server
    io = new ServerIO({
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected, socket ID:', socket.id);

      socket.on('join', async ({ gameId, userId }) => {
        try {
          console.log(`Player ${userId} joining game ${gameId}`);
          
          // Join the game room
          socket.join(gameId);

          // Upsert player record
          await prisma.player.upsert({
            where: {
              id: `${gameId}-${userId}`,
            },
            update: {
              status: 'HOLDING',
              eliminatedAt: null,
            },
            create: {
              id: `${gameId}-${userId}`,
              gameId,
              userId,
              status: 'HOLDING',
            },
          });

          // Notify everyone about the new player
          const playerCount = await prisma.player.count({
            where: { gameId, status: 'HOLDING' },
          });
          
          console.log(`Game ${gameId} now has ${playerCount} active players`);
          io.to(gameId).emit('playerUpdate', { count: playerCount });
        } catch (error) {
          console.error('Error joining game:', error);
          socket.emit('error', { message: 'Failed to join game' });
        }
      });

      socket.on('pointerUp', async ({ gameId, userId }) => {
        try {
          console.log(`Player ${userId} lifted finger in game ${gameId}`);
          const playerId = `${gameId}-${userId}`;
          
          // Mark player as eliminated
          await prisma.player.update({
            where: { id: playerId },
            data: { 
              status: 'ELIMINATED', 
              eliminatedAt: new Date() 
            },
          });

          console.log(`Player ${userId} is now eliminated`);

          // Check remaining players
          const remainingPlayers = await prisma.player.findMany({
            where: {
              gameId,
              status: 'HOLDING',
            },
          });

          console.log(`Remaining players in game ${gameId}: ${remainingPlayers.length}`);

          // Get total player count (including eliminated) to verify at least 2 players participated
          const totalPlayers = await prisma.player.count({
            where: { gameId },
          });

          console.log(`Total players in game ${gameId}: ${totalPlayers}`);

          // Emit player update
          io.to(gameId).emit('playerUpdate', {
            count: remainingPlayers.length,
          });

          // If only one player left AND at least 2 total players in the game, we have a winner
          if (remainingPlayers.length === 1 && totalPlayers >= 2) {
            const winner = remainingPlayers[0];
            console.log(`We have a winner! Player ${winner.userId}`);
            
            // Update game and player status
            await prisma.$transaction([
              prisma.game.update({
                where: { id: gameId },
                data: { 
                  state: 'FINISHED', 
                  winnerId: winner.id 
                },
              }),
              prisma.player.update({
                where: { id: winner.id },
                data: { status: 'WINNER' },
              }),
            ]);

            // Emit game over event
            io.to(gameId).emit('gameOver', { 
              winnerId: winner.id,
              winnerUserId: winner.userId 
            });
            
            console.log(`Game over event sent for ${gameId}`);
          } else if (remainingPlayers.length === 0) {
            console.log(`All players eliminated in game ${gameId}`);
            
            // Everyone is eliminated, no winner
            await prisma.game.update({
              where: { id: gameId },
              data: { 
                state: 'FINISHED',
                winnerId: null
              },
            });
            
            io.to(gameId).emit('gameOver', { 
              winnerId: null,
              winnerUserId: null
            });
            
            console.log(`Game over event sent for ${gameId} (no winner)`);
          }
        } catch (error) {
          console.error('Error processing pointer up:', error);
          socket.emit('error', { message: 'Failed to process move' });
        }
      });

      // Handle game start event
      socket.on('startGame', async ({ gameId }) => {
        try {
          console.log(`Starting game ${gameId}`);
          await prisma.game.update({
            where: { id: gameId },
            data: { state: 'RUNNING' },
          });
          
          io.to(gameId).emit('gameStart');
          console.log(`Game start event sent for ${gameId}`);
        } catch (error) {
          console.error('Error starting game:', error);
          socket.emit('error', { message: 'Failed to start game' });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
      
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  return new NextResponse('Socket is running', {
    status: 200,
  });
} 