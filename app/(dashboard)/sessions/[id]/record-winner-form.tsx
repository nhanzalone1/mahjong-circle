"use client";

import { useState, useTransition } from "react";
import { recordWinner } from "./actions";

type Props = {
  sessionId: string;
  members: { userId: string; displayName: string }[];
};

export function RecordWinnerForm({ sessionId, members }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedWinner, setSelectedWinner] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWinner) return;

    startTransition(async () => {
      await recordWinner(sessionId, selectedWinner);
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div className="tile-card" style={{ padding: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "var(--cream-muted)" }}>
          Who won tonight?
        </label>
        <select
          value={selectedWinner}
          onChange={(e) => setSelectedWinner(e.target.value)}
          className="input-field"
          style={{
            appearance: "none",
            cursor: "pointer",
          }}
        >
          <option value="">Select winner...</option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.displayName}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending || !selectedWinner}
        className="btn-gold"
        style={{
          padding: "14px",
          fontSize: "15px",
          opacity: isPending || !selectedWinner ? 0.6 : 1,
        }}
      >
        {isPending ? "Recording..." : "🏆 Record Winner"}
      </button>
    </form>
  );
}
