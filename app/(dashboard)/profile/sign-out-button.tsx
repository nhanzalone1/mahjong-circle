"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await authClient.signOut();
      router.push("/auth");
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-cream/70 hover:text-red-400 transition shadow-card disabled:opacity-50"
    >
      <LogOut size={20} />
    </button>
  );
}
