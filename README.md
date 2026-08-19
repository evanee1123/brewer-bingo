# Brewers Jersey Bingo

Room-based bingo for a Brewers game. Spot a player's jersey, stamp the square, race your friends to a bingo. Rooms live in Upstash Redis and expire 24 hours after creation.

## Local development

1. Copy `.env.local.example` to `.env.local` and fill in your Upstash Redis REST credentials (Upstash dashboard → your database → REST API).
2. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Open http://localhost:3000.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it into Vercel.
3. In the Vercel project settings, add the environment variables `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (same values as `.env.local`).
4. Deploy — no other configuration needed.

## How it works

- Each room is a single JSON blob at Redis key `room:<CODE>` with a 24-hour TTL.
- `POST /api/room` creates a room and returns a 4-letter code.
- `POST /api/room/[code]/join` assigns a new visitor a randomized 5x5 board (center is FREE) and saves it.
- `POST /api/room/[code]/toggle` flips a square and recalculates bingo lines and `firstBingoAt` server-side, so the leaderboard is authoritative.
- The room page polls `GET /api/room/[code]` every 4 seconds to keep the leaderboard in sync across devices.
