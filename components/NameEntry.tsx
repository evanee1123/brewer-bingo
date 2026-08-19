"use client";

import { FormEvent, useState } from "react";

export default function NameEntry({
  roomCode,
  onSubmit,
  submitting,
  error,
}: {
  roomCode: string;
  onSubmit: (name: string) => void;
  submitting: boolean;
  error: string;
}) {
  const [name, setName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <main className="wrap">
      <span className="baseball">⚾</span>
      <h1 className="brand-title">Joining Room</h1>
      <p className="room-code" style={{ color: "var(--gold)" }}>
        {roomCode}
      </p>

      <div className="card ticket-notch">
        <p className="section-title">What&apos;s your name?</p>
        <form onSubmit={handleSubmit}>
          <input
            className="field"
            placeholder="Display name"
            value={name}
            maxLength={24}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <button className="btn" type="submit" disabled={submitting || !name.trim()}>
            {submitting ? "Getting your board..." : "Deal Me In"}
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>
    </main>
  );
}
