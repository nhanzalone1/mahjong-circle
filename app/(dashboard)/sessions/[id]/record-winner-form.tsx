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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="card p-4">
        <label className="block mb-2 text-sm text-gray-500">
          Who won tonight?
        </label>
        <select
          value={selectedWinner}
          onChange={(e) => setSelectedWinner(e.target.value)}
          className="input cursor-pointer"
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
        className="btn-primary w-full py-3.5 text-base disabled:opacity-60"
      >
        {isPending ? "Recording..." : "🏆 Record Winner"}
      </button>
    </form>
  );
}
