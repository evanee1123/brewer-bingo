import { PLAYERS } from "./players";
import type { PlayerState } from "./types";

export const BOARD_SIZE = 5;
export const FREE_INDEX = 12;
export const ROOM_TTL_SECONDS = 60 * 60 * 24;
const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O, easy to read aloud

function buildLines(): number[][] {
  const lines: number[][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    lines.push([0, 1, 2, 3, 4].map((c) => r * BOARD_SIZE + c));
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    lines.push([0, 1, 2, 3, 4].map((r) => r * BOARD_SIZE + c));
  }
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);
  return lines;
}

export const LINES = buildLines();

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateBoard(): string[] {
  const picks = shuffle(PLAYERS).slice(0, 24);
  const board: string[] = [];
  let p = 0;
  for (let i = 0; i < 25; i++) {
    board.push(i === FREE_INDEX ? "FREE" : picks[p++]);
  }
  return board;
}

export function countBingos(crossed: number[]): number {
  const set = new Set(crossed);
  return LINES.filter((line) => line.every((i) => set.has(i))).length;
}

export function createPlayer(): PlayerState {
  return {
    board: generateBoard(),
    crossed: [FREE_INDEX],
    bingos: 0,
    firstBingoAt: null,
  };
}
