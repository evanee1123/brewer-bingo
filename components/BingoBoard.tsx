"use client";

import { FREE_INDEX } from "@/lib/bingo";
import { PLAYERS } from "@/lib/players";
import JerseyBack from "./JerseyBack";

const NUMBER_BY_NAME = new Map(PLAYERS.map((p) => [p.name, p.number]));

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
            {isFree ? (
              <span>FREE</span>
            ) : (
              <JerseyBack name={name} number={NUMBER_BY_NAME.get(name) ?? null} />
            )}
            {isCrossed && !isFree && <span className="stamp">X</span>}
          </div>
        );
      })}
    </div>
  );
}
