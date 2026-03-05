"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "./actions";
import { Calendar, Clock, MapPin, FileText } from "lucide-react";

type Props = {
  groupId: string;
};

export function CreateSessionForm({ groupId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError("Please select a date");
      return;
    }

    const dateTime = new Date(`${date}T${time}`);

    startTransition(async () => {
      try {
        await createSession({
          groupId,
          date: dateTime,
          location: location || null,
          notes: notes || null,
        });
        router.push("/sessions");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create session");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(255,100,80,0.1)",
            border: "1px solid rgba(255,100,80,0.3)",
            borderRadius: "8px",
            color: "#ff8070",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* Date */}
      <div className="tile-card" style={{ padding: "16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontSize: "14px", color: "var(--cream-muted)" }}>
          <Calendar size={16} />
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
          min={new Date().toISOString().split("T")[0]}
          style={{ colorScheme: "dark" }}
        />
      </div>

      {/* Time */}
      <div className="tile-card" style={{ padding: "16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontSize: "14px", color: "var(--cream-muted)" }}>
          <Clock size={16} />
          Time
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="input-field"
          style={{ colorScheme: "dark" }}
        />
      </div>

      {/* Location */}
      <div className="tile-card" style={{ padding: "16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontSize: "14px", color: "var(--cream-muted)" }}>
          <MapPin size={16} />
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Auntie Mei's House"
          className="input-field"
        />
      </div>

      {/* Notes */}
      <div className="tile-card" style={{ padding: "16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontSize: "14px", color: "var(--cream-muted)" }}>
          <FileText size={16} />
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions or reminders"
          className="input-field"
          rows={3}
          style={{ resize: "vertical", minHeight: "80px" }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="btn-jade"
        style={{
          padding: "16px",
          fontSize: "16px",
          fontWeight: 600,
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Creating..." : "Create Session"}
      </button>
    </form>
  );
}
