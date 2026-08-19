import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { RoomState } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code.toUpperCase();
  const room = await redis.get<RoomState>(`room:${code}`);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({ room });
}
