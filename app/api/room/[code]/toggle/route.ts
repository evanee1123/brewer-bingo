import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { countBingos, FREE_INDEX, ROOM_TTL_SECONDS, hasBlackout, hasMPattern } from "@/lib/bingo";
import type { RoomState } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code.toUpperCase();
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const squareIndex = body?.squareIndex;

  if (
    !name ||
    typeof squareIndex !== "number" ||
    !Number.isInteger(squareIndex) ||
    squareIndex < 0 ||
    squareIndex > 24
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (squareIndex === FREE_INDEX) {
    return NextResponse.json(
      { error: "Cannot toggle the free space" },
      { status: 400 }
    );
  }

  const key = `room:${code}`;
  const room = await redis.get<RoomState>(key);

  if (!room || !room.players[name]) {
    return NextResponse.json(
      { error: "Player not found in room" },
      { status: 404 }
    );
  }

  const player = room.players[name];
  const crossedSet = new Set(player.crossed);
  if (crossedSet.has(squareIndex)) {
    crossedSet.delete(squareIndex);
  } else {
    crossedSet.add(squareIndex);
  }

  player.crossed = Array.from(crossedSet).sort((a, b) => a - b);
  player.bingos = countBingos(player.crossed);

  if (player.bingos > 0 && player.firstBingoAt === null) {
    player.firstBingoAt = Date.now();
  } else if (player.bingos === 0) {
    player.firstBingoAt = null;
  }

  const now = Date.now();

  const mPattern = hasMPattern(player.crossed);
  if (mPattern && player.mPatternAt === null) {
    player.mPatternAt = now;
  } else if (!mPattern) {
    player.mPatternAt = null;
  }

  const blackout = hasBlackout(player.crossed);
  if (blackout && player.blackoutAt === null) {
    player.blackoutAt = now;
  } else if (!blackout) {
    player.blackoutAt = null;
  }

  room.players[name] = player;

  const ttl = await redis.ttl(key);
  await redis.set(key, room, { ex: ttl > 0 ? ttl : ROOM_TTL_SECONDS });

  return NextResponse.json({ player });
}
