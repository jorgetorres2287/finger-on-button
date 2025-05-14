import { Suspense } from 'react';
import GameShell from './components/GameShell';
import prisma from './lib/db';
import { getNoonET, startOfTodayET, endOfTodayET } from './lib/time';

async function getTodayGame() {
  // Try to find today's game
  let todayGame = await prisma.game.findFirst({
    where: {
      scheduledAt: {
        gte: startOfTodayET(),
        lt: endOfTodayET(),
      },
    },
  });
  
  // If no game exists for today, create one
  if (!todayGame) {
    todayGame = await prisma.game.create({
      data: {
        scheduledAt: getNoonET(),
        state: 'WAITING',
      },
    });
  }
  
  return todayGame;
}

export default async function Home() {
  const game = await getTodayGame();
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading game...</div>}>
      <GameShell game={game} />
    </Suspense>
  );
}
