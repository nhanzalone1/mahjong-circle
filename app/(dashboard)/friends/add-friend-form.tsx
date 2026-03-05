"use client";

import { useState, useTransition } from "react";
import { UserPlus, Loader2, Check, X } from "lucide-react";
import { addFriendByCode } from "./actions";

export default function AddFriendForm() {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    startTransition(async () => {
      const result = await addFriendByCode(code);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: `Added ${result.friendName} as a friend!` });
        setCode("");
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter invite code"
          maxLength={6}
          className="input flex-1 font-mono text-center text-lg tracking-widest uppercase"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending || !code.trim()}
          className="w-12 h-12 rounded-xl bg-green flex items-center justify-center text-white shadow-lg shadow-green/30 hover:bg-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <UserPlus size={20} />
          )}
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
            message.type === "success"
              ? "bg-green/20 text-green"
              : "bg-red/20 text-red-400"
          }`}
        >
          {message.type === "success" ? <Check size={16} /> : <X size={16} />}
          {message.text}
        </div>
      )}
    </form>
  );
}
