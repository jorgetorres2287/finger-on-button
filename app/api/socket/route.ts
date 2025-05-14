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
      console.log('Client connected, yay!:', socket.id);

      socket.on('join', async ({ gameId, userId }) => {
        try {
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
          
          io.to(gameId).emit('playerUpdate', { count: playerCount });
        } catch (error) {
          console.error('Error joining game:', error);
        }
      });

      socket.on('pointerUp', async ({ gameId, userId }) => {
        try {
          const playerId = `${gameId}-${userId}`;
          
          // Mark player as eliminated
          await prisma.player.update({
            where: { id: playerId },
            data: { 
              status: 'ELIMINATED', 
              eliminatedAt: new Date() 
            },
          });

          // Check remaining players
          const remainingPlayers = await prisma.player.findMany({
            where: {
              gameId,
              status: 'HOLDING',
            },
          });

          // Emit player update
          io.to(gameId).emit('playerUpdate', {
            count: remainingPlayers.length,
          });

          // If only one player left, we have a winner
          if (remainingPlayers.length === 1) {
            const winner = remainingPlayers[0];
            
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
          }
        } catch (error) {
          console.error('Error processing pointer up:', error);
        }
      });

      // Handle game start event
      socket.on('startGame', async ({ gameId }) => {
        try {
          await prisma.game.update({
            where: { id: gameId },
            data: { state: 'RUNNING' },
          });
          
          io.to(gameId).emit('gameStart');
        } catch (error) {
          console.error('Error starting game:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  return new NextResponse('Socket is running', {
    status: 200,
  });
} 