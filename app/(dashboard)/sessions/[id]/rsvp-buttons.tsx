"use client";

import { useState, useTransition } from "react";
import { updateRSVP } from "./actions";

type Props = {
  sessionId: string;
  currentResponse: string | null;
  currentNote: string | null;
};

export function RSVPButtons({ sessionId, currentResponse, currentNote }: Props) {
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState(currentNote ?? "");
  const [showNoteInput, setShowNoteInput] = useState(false);

  const handleRSVP = (response: string) => {
    startTransition(async () => {
      await updateRSVP(sessionId, response, note || null);
    });
  };

  const responses = [
    { value: "coming", label: "Coming", icon: "✓" },
    { value: "maybe", label: "Maybe", icon: "?" },
    { value: "cant", label: "Can't Make It", icon: "✗" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Response buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        {responses.map((r) => (
          <button
            key={r.value}
            onClick={() => handleRSVP(r.value)}
            disabled={isPending}
            className={currentResponse === r.value ? "btn-jade" : "btn-ghost"}
            style={{
              flex: 1,
              padding: "12px 8px",
              fontSize: "14px",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            <span style={{ marginRight: "4px" }}>{r.icon}</span>
            {r.label}
          </button>
        ))}
      </div>

      {/* Note toggle */}
      <button
        onClick={() => setShowNoteInput(!showNoteInput)}
        style={{
          background: "none",
          border: "none",
          color: "var(--cream-muted)",
          fontSize: "13px",
          cursor: "pointer",
          textAlign: "left",
          padding: "4px 0",
        }}
      >
        {showNoteInput ? "− Hide note" : "+ Add a note (e.g., \"Bringing snacks\")"}
      </button>

      {/* Note input */}
      {showNoteInput && (
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Bringing snacks"
            className="input-field"
            style={{ flex: 1 }}
          />
          <button
            onClick={() => currentResponse && handleRSVP(currentResponse)}
            disabled={isPending || !currentResponse}
            className="btn-ghost"
            style={{ padding: "12px 16px", fontSize: "14px" }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
