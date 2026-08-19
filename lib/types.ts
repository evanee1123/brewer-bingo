export interface PlayerState {
  board: string[];
  crossed: number[];
  bingos: number;
  firstBingoAt: number | null;
}

export interface RoomState {
  roomCode: string;
  createdAt: number;
  players: Record<string, PlayerState>;
}
