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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Date */}
      <div className="card p-4">
        <label className="flex items-center gap-2 mb-2.5 text-sm text-gray-500">
          <Calendar size={16} className="text-[#C9A84C]" />
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Time */}
      <div className="card p-4">
        <label className="flex items-center gap-2 mb-2.5 text-sm text-gray-500">
          <Clock size={16} className="text-[#C9A84C]" />
          Time
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="input"
        />
      </div>

      {/* Location */}
      <div className="card p-4">
        <label className="flex items-center gap-2 mb-2.5 text-sm text-gray-500">
          <MapPin size={16} className="text-[#C9A84C]" />
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Auntie Mei's House"
          className="input"
        />
      </div>

      {/* Notes */}
      <div className="card p-4">
        <label className="flex items-center gap-2 mb-2.5 text-sm text-gray-500">
          <FileText size={16} className="text-[#C9A84C]" />
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions or reminders"
          className="input resize-y min-h-[80px]"
          rows={3}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full py-4 text-base"
      >
        {isPending ? "Creating..." : "Create Session"}
      </button>
    </form>
  );
}
