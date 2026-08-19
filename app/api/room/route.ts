import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { generateRoomCode, ROOM_TTL_SECONDS } from "@/lib/bingo";
import type { RoomState } from "@/lib/types";

export async function POST() {
  let code = generateRoomCode();
  for (let attempt = 0; attempt < 10; attempt++) {
    const exists = await redis.exists(`room:${code}`);
    if (!exists) break;
    code = generateRoomCode();
  }

  const room: RoomState = {
    roomCode: code,
    createdAt: Date.now(),
    players: {},
  };

  await redis.set(`room:${code}`, room, { ex: ROOM_TTL_SECONDS });

  return NextResponse.json({ roomCode: code });
}
