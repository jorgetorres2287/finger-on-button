# Finger on the Button Game

A multiplayer web game where the last player to keep their finger on a button wins.

## Game Rules

1. A countdown timer shows time until 12pm ET when the game starts
2. When the game starts, all players must keep their finger on the button
3. The last player to release their finger wins!

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Socket.io for real-time communication
- Prisma with PostgreSQL for data persistence
- TailwindCSS for styling

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Environment Setup

Create a `.env` file in the root directory with the following:

```
# Database connection string
POSTGRES_URL_NON_POOLING="postgresql://jorgetorres:your_password@localhost:5432/finger_on_button"
```

### Installation

```bash
# Install dependencies
npm install

# Set up the database
npx prisma migrate dev --name init
```

### Development

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## Deployment

This application is designed to be deployed on Vercel. Make sure to set up the PostgreSQL database and add the `DATABASE_URL` environment variable in your Vercel project settings.

## Game Architecture

1. **Database Schema**: Games and Players are stored in PostgreSQL using Prisma ORM
2. **Real-time Communication**: Socket.io handles player interactions and game state changes
3. **Game Scheduling**: Games start automatically at 12pm ET each day
4. **Anti-Cheating**: Measures prevent players from switching tabs or leaving the window
