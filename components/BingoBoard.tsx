"use client";

import { FREE_INDEX } from "@/lib/bingo";

export default function BingoBoard({
  board,
  crossed,
  onToggle,
}: {
  board: string[];
  crossed: number[];
  onToggle: (index: number) => void;
}) {
  const crossedSet = new Set(crossed);

  return (
    <div className="board">
      {board.map((name, i) => {
        const isFree = i === FREE_INDEX;
        const isCrossed = crossedSet.has(i);
        return (
          <div
            key={i}
            className={`square${isFree ? " free" : ""}`}
            onClick={() => !isFree && onToggle(i)}
          >
            <span>{isFree ? "FREE" : name}</span>
            {isCrossed && !isFree && <span className="stamp">X</span>}
          </div>
        );
      })}
    </div>
  );
}
