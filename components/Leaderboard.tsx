"use client";

import type { PlayerState } from "@/lib/types";

const TOTAL_SQUARES = 24; // excludes the free space

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function Leaderboard({
  players,
  currentName,
}: {
  players: Record<string, PlayerState>;
  currentName: string;
}) {
  const entries = Object.entries(players).sort(([, a], [, b]) => {
    if (b.bingos !== a.bingos) return b.bingos - a.bingos;
    return b.crossed.length - a.crossed.length;
  });

  const firstBingoName = entries.reduce<string | null>((winner, [name, p]) => {
    if (p.firstBingoAt === null) return winner;
    if (!winner) return name;
    const winnerTime = players[winner].firstBingoAt ?? Infinity;
    return p.firstBingoAt < winnerTime ? name : winner;
  }, null);

  if (entries.length === 0) {
    return <p className="muted center">No players yet.</p>;
  }

  return (
    <div>
      {entries.map(([name, p]) => (
        <div className="leaderboard-row" key={name}>
          <div>
            <div className="lb-name">
              {name === firstBingoName && <span className="flag">🚩</span>}
              {name}
              {name === currentName && <span className="muted"> (you)</span>}
            </div>
            {p.firstBingoAt && (
              <span className="lb-time">first bingo at {formatTime(p.firstBingoAt)}</span>
            )}
          </div>
          <div className="lb-stats">
            <span className="lb-crossed">
              {p.crossed.length - 1}/{TOTAL_SQUARES}
            </span>
            <span className="lb-bingos">{p.bingos} 🎯</span>
          </div>
        </div>
      ))}
    </div>
  );
}
