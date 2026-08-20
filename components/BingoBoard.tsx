"use client";

import { FREE_INDEX } from "@/lib/bingo";
import { PLAYERS } from "@/lib/players";
import type { JerseyVariant } from "@/lib/types";
import JerseyBack from "./JerseyBack";

const NUMBER_BY_NAME = new Map(PLAYERS.map((p) => [p.name, p.number]));

export default function BingoBoard({
  board,
  variants,
  crossed,
  onToggle,
}: {
  board: string[];
  variants: JerseyVariant[];
  crossed: number[];
  onToggle: (index: number) => void;
}) {
  const crossedSet = new Set(crossed);

  return (
    <div className="board">
      {board.map((name, i) => {
        const isFree = i === FREE_INDEX;
        const isCrossed = crossedSet.has(i);
        const variant = variants[i] ?? "navy";
        return (
          <div
            key={i}
            className={`square${isFree ? " free" : ""}`}
            data-variant={isFree ? undefined : variant}
            onClick={() => !isFree && onToggle(i)}
          >
            {isFree ? (
              <span>FREE</span>
            ) : (
              <JerseyBack name={name} number={NUMBER_BY_NAME.get(name) ?? null} variant={variant} />
            )}
            {isCrossed && !isFree && <span className="stamp">X</span>}
          </div>
        );
      })}
    </div>
  );
}
