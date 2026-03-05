"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { removeFriend } from "./actions";

interface RemoveFriendButtonProps {
  friendshipId: string;
  friendName: string;
}

export default function RemoveFriendButton({ friendshipId, friendName }: RemoveFriendButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRemove = () => {
    startTransition(async () => {
      await removeFriend(friendshipId);
      setShowConfirm(false);
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium hover:bg-red-200 transition disabled:opacity-50"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : "Remove"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
    >
      <Trash2 size={18} />
    </button>
  );
}
