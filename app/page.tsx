"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  async function startNewGame() {
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/room", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create room");
      const data = await res.json();
      router.push(`/room/${data.roomCode}`);
    } catch {
      setError("Couldn't start a new game. Try again.");
      setCreating(false);
    }
  }

  function joinRoom(e: FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 4) {
      setError("Room codes are 4 letters.");
      return;
    }
    router.push(`/room/${code}`);
  }

  return (
    <main className="wrap">
      <span className="baseball">⚾</span>
      <h1 className="brand-title">
        Brewers
        <br />
        Jersey Bingo
      </h1>
      <p className="brand-sub">
        Spot the jersey. Stamp the square. Get bingo at the ballpark.
      </p>

      <div className="card ticket-notch">
        <button className="btn" onClick={startNewGame} disabled={creating}>
          {creating ? "Starting..." : "Start New Game"}
        </button>

        <hr className="perforation" />

        <p className="section-title" style={{ marginBottom: 8 }}>
          Have a room code?
        </p>
        <form onSubmit={joinRoom}>
          <input
            className="field"
            placeholder="e.g. BREW"
            value={joinCode}
            maxLength={4}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            style={{ marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.15em", textAlign: "center" }}
          />
          <button className="btn btn-compact" type="submit" disabled={!joinCode.trim()}>
            Join Room
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
      </div>
    </main>
  );
}
