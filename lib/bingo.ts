import { PLAYERS } from "./players";
import type { JerseyVariant, PlayerState } from "./types";

export const BOARD_SIZE = 5;
export const FREE_INDEX = 12;
export const ROOM_TTL_SECONDS = 60 * 60 * 24;
const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O, easy to read aloud

export const JERSEY_VARIANTS: JerseyVariant[] = ["navy", "cityConnect", "gold", "pinstripe"];

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
  const picks = shuffle(PLAYERS)
    .slice(0, 24)
    .map((p) => p.name);
  const board: string[] = [];
  let p = 0;
  for (let i = 0; i < 25; i++) {
    board.push(i === FREE_INDEX ? "FREE" : picks[p++]);
  }
  return board;
}

// One random variant per square, generated alongside the board so it's
// assigned per-square-per-board (not per-player globally) and persisted the
// same way the board itself is.
export function generateVariants(): JerseyVariant[] {
  const variants: JerseyVariant[] = [];
  for (let i = 0; i < 25; i++) {
    variants.push(JERSEY_VARIANTS[Math.floor(Math.random() * JERSEY_VARIANTS.length)]);
  }
  return variants;
}

export function countBingos(crossed: number[]): number {
  const set = new Set(crossed);
  return LINES.filter((line) => line.every((i) => set.has(i))).length;
}

export function createPlayer(): PlayerState {
  return {
    board: generateBoard(),
    variants: generateVariants(),
    crossed: [FREE_INDEX],
    bingos: 0,
    firstBingoAt: null,
  };
}
