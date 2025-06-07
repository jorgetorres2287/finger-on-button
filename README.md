# Finger on the Button Game

A multiplayer web3 game where the last player to keep their finger on a button wins all entry fees. Built as a Farcaster mini-app.

## Game Rules

1. Players pay an entry fee of 0.0001 ETH to join
2. A countdown timer shows time until the game starts
3. When the game starts, all players must keep their finger on the button
4. The last player to release their finger wins all collected entry fees!

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Blockchain**: Base network, smart contracts, Thirdweb
- **Wallet/Auth**: OnchainKit, MiniKit (Coinbase)
- **ORM**: Prisma

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Thirdweb account and API key
- OnchainKit API key
- Deployed smart contract on Base network

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > Database** to get your connection details
3. Go to **Settings > API** to get your project URL and anon key
4. In the **SQL Editor**, run this SQL to create the required tables:

```sql
-- Create the enums first
CREATE TYPE "GameState" AS ENUM ('WAITING', 'RUNNING', 'FINISHED');
CREATE TYPE "PlayerStatus" AS ENUM ('IDLE', 'HOLDING', 'ELIMINATED', 'WINNER');

-- Create the Game table
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "state" "GameState" NOT NULL DEFAULT 'WAITING',
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- Create the Player table
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminatedAt" TIMESTAMP(3),
    "status" "PlayerStatus" NOT NULL DEFAULT 'IDLE',
    "address" TEXT NOT NULL,
    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

### 2. Smart Contract Deployment

1. Deploy the `contracts/src/FingerOnButton.sol` contract to Base network
2. Note the deployed contract address
3. Update `FINGER_ON_BUTTON_CONTRACT_ADDRESS` in `app/constants/index.ts`

### 3. Thirdweb Setup

1. Create account at [thirdweb.com](https://thirdweb.com)
2. Create a new project and get your Client ID
3. Import your deployed contract into Thirdweb
4. Set up Thirdweb Engine (optional, for automated withdrawals)

### 4. OnchainKit Setup

1. Get API key from [OnchainKit](https://portal.cdp.coinbase.com/)
2. This enables Coinbase wallet integration and MiniKit functionality

### 5. Environment Variables

Create a `.env` or `.env.local` file in the root directory:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
POSTGRES_URL_NON_POOLING="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Thirdweb (Required)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID="your-thirdweb-client-id"

# OnchainKit/Coinbase (Required)
NEXT_PUBLIC_ONCHAINKIT_API_KEY="your-onchainkit-api-key"
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME="Finger on the Button"

# App Configuration
NEXT_PUBLIC_URL="http://localhost:3000"
NEXT_PUBLIC_APP_SUBTITLE="Last player to lift finger wins!"
NEXT_PUBLIC_APP_DESCRIPTION="Multiplayer web3 game with ETH prizes"

# Thirdweb Engine (Optional - for automated prize distribution)
THIRDWEB_ENGINE_URL="https://your-engine-url"
THIRDWEB_ACCESS_TOKEN="your-engine-access-token"

# Farcaster Integration (Optional)
FARCASTER_HEADER="your-header"
FARCASTER_PAYLOAD="your-payload" 
FARCASTER_SIGNATURE="your-signature"

# Additional App Branding (Optional)
NEXT_PUBLIC_APP_ICON="https://your-icon-url"
NEXT_PUBLIC_APP_HERO_IMAGE="https://your-hero-image-url"
NEXT_PUBLIC_SPLASH_IMAGE="https://your-splash-image-url"
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR="#000000"
NEXT_PUBLIC_APP_PRIMARY_CATEGORY="games"
NEXT_PUBLIC_APP_TAGLINE="Win ETH by keeping your finger down!"
NEXT_PUBLIC_APP_OG_TITLE="Finger on the Button"
NEXT_PUBLIC_APP_OG_DESCRIPTION="Multiplayer web3 game - last to lift finger wins!"
NEXT_PUBLIC_APP_OG_IMAGE="https://your-og-image-url"
```

### 6. Installation and Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the app.

### 7. Production Build

```bash
npm run build
npm start
```

## Deployment

### Manual Deployment

Ensure all environment variables are set in your hosting platform. The app requires:
- Node.js 18+ runtime
- Internet connection for Supabase, Thirdweb, and OnchainKit APIs

## Game Architecture

1. **Database**: Games and Players stored in Supabase with real-time subscriptions
2. **Smart Contract**: Handles ETH entry fees and prize distribution on Base network
3. **Real-time**: Supabase real-time subscriptions for live game state
4. **Wallet Integration**: OnchainKit/MiniKit for seamless Coinbase wallet connection
5. **Game Logic**: Automatic game creation, player tracking, winner determination
