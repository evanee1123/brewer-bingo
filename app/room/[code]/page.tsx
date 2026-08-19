"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NameEntry from "@/components/NameEntry";
import BingoBoard from "@/components/BingoBoard";
import Leaderboard from "@/components/Leaderboard";
import { FREE_INDEX, LINES } from "@/lib/bingo";
import type { PlayerState, RoomState } from "@/lib/types";

const POLL_INTERVAL_MS = 4000;

function storageKey(code: string) {
  return `bb-name-${code}`;
}

function completedLines(crossed: number[]): number {
  const set = new Set(crossed);
  return LINES.filter((line) => line.every((i) => set.has(i))).length;
}

export default function RoomPage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();

  const [name, setName] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const pendingToggle = useRef(false);
  const prevBingos = useRef(0);

  const fetchRoom = useCallback(
    async (activeName: string | null) => {
      const res = await fetch(`/api/room/${code}`);
      if (res.status === 404) {
        setRoomNotFound(true);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      setRoom(data.room);
      if (activeName && data.room?.players?.[activeName] && !pendingToggle.current) {
        setPlayer(data.room.players[activeName]);
      }
    },
    [code]
  );

  // load stored name + initial room fetch
  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey(code));
    setName(stored);
    fetchRoom(stored).finally(() => setInitialLoading(false));
  }, [code, fetchRoom]);

  // polling
  useEffect(() => {
    const id = setInterval(() => fetchRoom(name), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [code, name, fetchRoom]);

  // bingo banner detection
  useEffect(() => {
    if (!player) return;
    if (player.bingos > prevBingos.current) {
      setShowBanner(true);
    }
    prevBingos.current = player.bingos;
  }, [player]);

  async function handleJoin(enteredName: string) {
    setJoining(true);
    setJoinError("");
    try {
      const res = await fetch(`/api/room/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: enteredName }),
      });
      if (res.status === 404) {
        setRoomNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("join failed");
      const data = await res.json();
      window.localStorage.setItem(storageKey(code), enteredName);
      setName(enteredName);
      setRoom(data.room);
      setPlayer(data.player);
      prevBingos.current = data.player.bingos;
    } catch {
      setJoinError("Couldn't join the room. Try again.");
    } finally {
      setJoining(false);
    }
  }

  async function handleToggle(index: number) {
    if (!name || !player || index === FREE_INDEX) return;

    pendingToggle.current = true;
    setPlayer((prev) => {
      if (!prev) return prev;
      const set = new Set(prev.crossed);
      if (set.has(index)) set.delete(index);
      else set.add(index);
      const crossed = Array.from(set);
      return { ...prev, crossed, bingos: completedLines(crossed) };
    });

    try {
      const res = await fetch(`/api/room/${code}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, squareIndex: index }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlayer(data.player);
      }
    } finally {
      pendingToggle.current = false;
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/room/${code}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (roomNotFound) {
    return (
      <main className="wrap">
        <span className="baseball">⚾</span>
        <h1 className="brand-title">Room Not Found</h1>
        <p className="brand-sub">This room may have expired. Rooms last 24 hours.</p>
        <a className="btn" href="/" style={{ textDecoration: "none" }}>
          Start a New Game
        </a>
      </main>
    );
  }

  if (initialLoading) {
    return (
      <main className="wrap">
        <div className="spinner">Loading room...</div>
      </main>
    );
  }

  if (!name || !player) {
    return (
      <NameEntry
        roomCode={code}
        onSubmit={handleJoin}
        submitting={joining}
        error={joinError}
      />
    );
  }

  return (
    <main className="wrap">
      <span className="baseball">⚾</span>
      <h1 className="brand-title">Jersey Bingo</h1>

      <div className="card ticket-notch">
        <p className="room-code-label">Room Code</p>
        <p className="room-code">{code}</p>
        <div className="share-row">
          <button className="btn" onClick={copyLink}>
            {copied ? "Copied!" : "Copy Invite Link"}
          </button>
        </div>
      </div>

      <div className="card">
        <p className="section-title">Your Board — {name}</p>
        <BingoBoard board={player.board} crossed={player.crossed} onToggle={handleToggle} />
      </div>

      <div className="card">
        <p className="section-title">Leaderboard</p>
        {room && <Leaderboard players={room.players} currentName={name} />}
      </div>

      {showBanner && (
        <div className="bingo-banner" onClick={() => setShowBanner(false)}>
          <div className="bingo-banner-card">
            <div style={{ fontSize: "2.5rem" }}>🎉⚾🎉</div>
            <div className="bingo-banner-title">BINGO!</div>
            <p>You&apos;ve got {player.bingos} line{player.bingos === 1 ? "" : "s"}!</p>
            <button
              className="btn"
              style={{ marginTop: 16 }}
              onClick={() => setShowBanner(false)}
            >
              Keep Playing
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
