import { ChevronLeft, Users, ChevronRight, Copy, Check } from "lucide-react";
import Link from "next/link";
import { getCurrentUser, getOrCreateProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles, results, rsvps, achievements, userSettings, friendships } from "@/lib/schema";
import { eq, or, sql } from "drizzle-orm";
import SignOutButton from "./sign-out-button";
import CopyCodeButton from "./copy-code-button";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const profile = await getOrCreateProfile(user);

  // Get user stats
  const [winCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(results)
    .where(eq(results.winnerId, user.id));

  const [gameCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rsvps)
    .where(eq(rsvps.userId, user.id));

  // Get friend count
  const [friendCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(friendships)
    .where(
      sql`(${friendships.requesterId} = ${user.id} OR ${friendships.addresseeId} = ${user.id}) AND ${friendships.status} = 'accepted'`
    );

  const stats = {
    games: Number(gameCount?.count || 0),
    wins: Number(winCount?.count || 0),
    friends: Number(friendCount?.count || 0),
  };

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recently";

  const initials = profile.displayName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="w-11 h-11 rounded-xl bg-[#152b1e] flex items-center justify-center text-cream/70 hover:text-cream transition"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif text-xl font-bold text-cream">Profile</h1>
        <SignOutButton />
      </div>

      {/* Profile Card */}
      <div className="text-center pt-4 pb-2">
        {/* Avatar with gold ring */}
        <div className="relative inline-block mb-5">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-4xl font-bold text-white ring-4 ring-gold/40 ring-offset-4 ring-offset-jade">
            {initials}
          </div>
        </div>

        {/* Name */}
        <h2 className="font-serif text-2xl font-bold text-cream mb-3">
          {profile.displayName}
        </h2>

        {/* Rank Badge - gold text on dark bg */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#152b1e]">
          <span className="text-gold text-sm font-semibold tracking-wide">
            {profile.rankTitle || "Novice"}
          </span>
        </div>

        <p className="text-sm text-cream-muted mt-3">
          Member since {memberSince}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-box">
          <p className="stat-number">{stats.games}</p>
          <p className="stat-label">Games</p>
        </div>
        <div className="stat-box">
          <p className="stat-number">{stats.wins}</p>
          <p className="stat-label">Wins</p>
        </div>
        <div className="stat-box">
          <p className="stat-number">{stats.friends}</p>
          <p className="stat-label">Friends</p>
        </div>
      </div>

      {/* Invite Code Card */}
      <div className="card p-6">
        <p className="text-xs text-cream-muted uppercase tracking-wider mb-3">Your Invite Code</p>
        <div className="flex items-center justify-between">
          <p className="font-mono text-3xl font-bold text-gold tracking-[0.2em]">
            {profile.inviteCode}
          </p>
          <CopyCodeButton code={profile.inviteCode} />
        </div>
        <p className="text-sm text-cream-muted mt-3">
          Share this code with friends to connect
        </p>
      </div>

      {/* Friends Link */}
      <Link href="/friends">
        <div className="card p-5 flex items-center gap-4 hover:bg-[#1a3325] transition">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
            <Users size={22} className="text-gold" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-cream">Friends</p>
            <p className="text-sm text-cream-muted">
              {stats.friends === 0 ? "Add friends with invite codes" : `${stats.friends} friend${stats.friends === 1 ? "" : "s"}`}
            </p>
          </div>
          <ChevronRight size={20} className="text-cream/40" />
        </div>
      </Link>

      {/* Groups Link */}
      <Link href="/groups">
        <div className="card p-5 flex items-center gap-4 hover:bg-[#1a3325] transition">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
            <span className="text-xl">🀄</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-cream">Circles</p>
            <p className="text-sm text-cream-muted">
              Manage your mahjong groups
            </p>
          </div>
          <ChevronRight size={20} className="text-cream/40" />
        </div>
      </Link>
    </div>
  );
}
