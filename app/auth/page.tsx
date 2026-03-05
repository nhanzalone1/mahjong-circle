"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { error } = await authClient.signUp.email({ email, password, name });
        if (error) setError(error.message ?? "Signup failed");
        else setMessage("Check your email to confirm your account!");
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) setError(error.message ?? "Login failed");
        else router.push("/dashboard");
      }
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-dvh bg-jade flex flex-col">
      {/* Top section with branding */}
      <div className="flex-1 flex flex-col items-center justify-end pb-8 pt-16 px-8">
        <div className="text-6xl mb-6">🀄</div>
        <h1 className="font-serif text-4xl font-bold text-cream tracking-tight mb-2">
          Mahjong Night
        </h1>
        <p className="text-cream/50 text-base">
          Track games with your circle
        </p>
      </div>

      {/* Form section */}
      <div className="flex-1 flex flex-col px-8 pb-12">
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-cream placeholder:text-cream/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all text-base"
              autoComplete="name"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-cream placeholder:text-cream/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all text-base"
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-cream placeholder:text-cream/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all text-base"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />

          {error && (
            <p className="text-red-400 text-sm text-center px-2">{error}</p>
          )}

          {message && (
            <p className="text-green text-sm text-center px-2">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green hover:bg-green/90 disabled:bg-green/50 rounded-2xl text-white font-semibold text-base transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-8 text-center">
          <p className="text-cream/40 text-sm">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
                setMessage(null);
              }}
              className="text-cream font-medium ml-1 hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Subtle footer */}
        <p className="text-cream/20 text-xs text-center mt-auto pt-8">
          Invite-only circle
        </p>
      </div>
    </div>
  );
}
