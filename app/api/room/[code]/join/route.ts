import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { createPlayer, ROOM_TTL_SECONDS } from "@/lib/bingo";
import type { RoomState } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code.toUpperCase();
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const key = `room:${code}`;
  const room = await redis.get<RoomState>(key);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (!room.players[name]) {
    room.players[name] = createPlayer();
    const ttl = await redis.ttl(key);
    await redis.set(key, room, { ex: ttl > 0 ? ttl : ROOM_TTL_SECONDS });
  }

  return NextResponse.json({ room, player: room.players[name] });
}
