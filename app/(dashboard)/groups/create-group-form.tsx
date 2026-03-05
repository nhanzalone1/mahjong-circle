"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2, Check, X } from "lucide-react";
import { createGroup } from "./actions";

export default function CreateGroupForm() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      const result = await createGroup(name);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: `Created "${name}" circle!` });
        setName("");
      }

      setTimeout(() => setMessage(null), 3000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Circle name (e.g., Friday Night Mahjong)"
          className="input flex-1"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="w-14 h-14 rounded-xl bg-[#1a3d2b] flex items-center justify-center text-white hover:bg-[#153026] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isPending ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <Plus size={22} />
          )}
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {message.type === "success" ? <Check size={16} /> : <X size={16} />}
          {message.text}
        </div>
      )}
    </form>
  );
}
