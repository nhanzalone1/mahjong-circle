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
    <div className="space-y-3">
      {/* Response buttons */}
      <div className="flex gap-2">
        {responses.map((r) => (
          <button
            key={r.value}
            onClick={() => handleRSVP(r.value)}
            disabled={isPending}
            className={`flex-1 py-3 px-2 rounded-xl font-semibold text-sm transition-all ${
              currentResponse === r.value
                ? "bg-[#1a3d2b] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            } ${isPending ? "opacity-70" : ""}`}
          >
            <span className="mr-1">{r.icon}</span>
            {r.label}
          </button>
        ))}
      </div>

      {/* Note toggle */}
      <button
        onClick={() => setShowNoteInput(!showNoteInput)}
        className="text-gray-500 text-sm hover:text-gray-700 text-left py-1"
      >
        {showNoteInput ? "− Hide note" : "+ Add a note (e.g., \"Bringing snacks\")"}
      </button>

      {/* Note input */}
      {showNoteInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Bringing snacks"
            className="input flex-1"
          />
          <button
            onClick={() => currentResponse && handleRSVP(currentResponse)}
            disabled={isPending || !currentResponse}
            className="btn-ghost py-3 px-4 text-sm"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
