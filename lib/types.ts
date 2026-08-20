export type JerseyVariant = "navy" | "cityConnect" | "gold" | "pinstripe";

export interface PlayerState {
  board: string[];
  variants: JerseyVariant[];
  crossed: number[];
  bingos: number;
  firstBingoAt: number | null;
}

export interface RoomState {
  roomCode: string;
  createdAt: number;
  players: Record<string, PlayerState>;
}
