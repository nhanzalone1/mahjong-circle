import { ChevronLeft, Settings, Bell, Eye, Moon, ChevronRight, Trophy, Users, LogOut } from "lucide-react";
import Link from "next/link";
import { getCurrentUser, getOrCreateProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles, results, rsvps, achievements, userSettings, friendships } from "@/lib/schema";
import { eq, or, sql } from "drizzle-orm";
import SignOutButton from "./sign-out-button";

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

  const userAchievements = await db
    .select()
    .from(achievements)
    .where(eq(achievements.userId, user.id));

  // Get friend count
  const [friendCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(friendships)
    .where(
      sql`(${friendships.requesterId} = ${user.id} OR ${friendships.addresseeId} = ${user.id}) AND ${friendships.status} = 'accepted'`
    );

  // Get user settings (or defaults)
  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, user.id))
    .limit(1);

  const userPrefs = settings || {
    gameNotifications: true,
    groupVisibility: true,
    darkTheme: true,
  };

  const stats = {
    games: Number(gameCount?.count || 0),
    wins: Number(winCount?.count || 0),
    friends: Number(friendCount?.count || 0),
  };

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recently";

  // Map achievements to trophies
  const achievementTypes = userAchievements.map(a => a.type);
  const TROPHIES = [
    { icon: "🏆", label: "Champion", type: "champion", unlocked: achievementTypes.includes("champion") },
    { icon: "🎖️", label: "5 Wins", type: "five_wins", unlocked: achievementTypes.includes("five_wins") },
    { icon: "⭐", label: "10 Wins", type: "ten_wins", unlocked: achievementTypes.includes("ten_wins") },
    { icon: "🎯", label: "First Win", type: "first_win", unlocked: achievementTypes.includes("first_win") },
  ];

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
          className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-cream/70 hover:text-cream transition shadow-card"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif text-xl font-bold text-cream">Profile</h1>
        <SignOutButton />
      </div>

      {/* Profile Card */}
      <div className="text-center pt-4 pb-2">
        {/* Avatar */}
        <div className="relative inline-block mb-4">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-4xl font-bold text-white shadow-xl ring-4 ring-gold/30">
            {initials}
          </div>
          {stats.wins > 0 && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gold flex items-center justify-center shadow-lg">
              <Trophy size={16} className="text-jade" />
            </div>
          )}
        </div>

        {/* Name */}
        <h2 className="font-serif text-2xl font-bold text-cream mb-2">
          {profile.displayName}
        </h2>

        {/* Rank Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green/15 border border-green/30 mb-2">
          <span className="text-green text-sm font-semibold uppercase tracking-wider">
            {profile.rankTitle || "Novice"}
          </span>
        </div>

        <p className="text-sm text-cream-muted">
          Member since {memberSince}
        </p>
      </div>

      {/* Invite Code */}
      <div className="card p-4 text-center">
        <p className="text-xs text-cream-muted uppercase tracking-wider mb-2">Your Invite Code</p>
        <p className="font-mono text-2xl font-bold text-gold tracking-widest">{profile.inviteCode}</p>
        <p className="text-xs text-cream-muted mt-2">Share this code with friends to connect</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className={`card p-5 text-center ${
              key === "wins"
                ? "ring-1 ring-gold/30 bg-gradient-to-br from-gold/10 to-transparent"
                : ""
            }`}
          >
            <p
              className={`text-3xl font-bold mb-1 ${
                key === "wins" ? "text-gold" : "text-cream"
              }`}
            >
              {value}
            </p>
            <p className="text-xs text-cream-muted uppercase tracking-wider font-semibold">
              {key}
            </p>
          </div>
        ))}
      </div>

      {/* Friends Link */}
      <Link href="/friends">
        <div className="card p-4 flex items-center gap-4 hover:bg-surface-raised transition">
          <div className="w-12 h-12 rounded-xl bg-green/20 flex items-center justify-center">
            <Users size={22} className="text-green" />
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

      {/* Trophy Gallery */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="section-title">Trophy Gallery</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {TROPHIES.map((trophy, i) => (
            <div
              key={i}
              className={`card aspect-square flex flex-col items-center justify-center text-2xl transition-all ${
                trophy.unlocked
                  ? "hover:scale-105"
                  : "opacity-40 grayscale"
              }`}
            >
              <span>{trophy.unlocked ? trophy.icon : "🔒"}</span>
              <span className="text-[10px] text-cream-muted mt-1">{trophy.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Preferences */}
      <section>
        <p className="section-title mb-4">Preferences</p>

        <div className="card overflow-hidden divide-y divide-white/5">
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center">
              <Bell size={18} className="text-cream/60" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-cream">Game Notifications</p>
              <p className="text-sm text-cream-muted">Alerts for game invites</p>
            </div>
            <div
              className={`relative w-12 h-7 rounded-full transition-all ${
                userPrefs.gameNotifications ? "bg-green" : "bg-white/10"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                  userPrefs.gameNotifications ? "left-6" : "left-1"
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center">
              <Eye size={18} className="text-cream/60" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-cream">Discoverable</p>
              <p className="text-sm text-cream-muted">Allow friends to find you</p>
            </div>
            <div
              className={`relative w-12 h-7 rounded-full transition-all ${
                userPrefs.groupVisibility ? "bg-green" : "bg-white/10"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                  userPrefs.groupVisibility ? "left-6" : "left-1"
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center">
              <Moon size={18} className="text-cream/60" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-cream">Dark Theme</p>
              <p className="text-sm text-cream-muted">Always on</p>
            </div>
            <ChevronRight size={18} className="text-cream/40" />
          </div>
        </div>
      </section>
    </div>
  );
}
