import { ChevronLeft, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles, results, friendships } from "@/lib/schema";
import { eq, or, sql, desc } from "drizzle-orm";

const AVATAR_COLORS = [
  "bg-amber-500",
  "bg-slate-400",
  "bg-orange-600",
  "bg-emerald-600",
  "bg-cyan-600",
  "bg-rose-600",
  "bg-violet-600",
  "bg-pink-600",
];

const RANK_ICONS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  // Get user's friends
  const userFriendships = await db
    .select()
    .from(friendships)
    .where(
      sql`(${friendships.requesterId} = ${user.id} OR ${friendships.addresseeId} = ${user.id}) AND ${friendships.status} = 'accepted'`
    );

  const friendIds = userFriendships.map(f =>
    f.requesterId === user.id ? f.addresseeId : f.requesterId
  );

  // Include user and friends
  const relevantUserIds = [user.id, ...friendIds];

  // Get win counts for relevant users
  const leaderboardData = await db
    .select({
      userId: results.winnerId,
      wins: sql<number>`count(*)`.as("wins"),
    })
    .from(results)
    .where(sql`${results.winnerId} IN ${relevantUserIds}`)
    .groupBy(results.winnerId)
    .orderBy(desc(sql`count(*)`));

  // Get profiles for these users
  const leaderProfiles = await db
    .select()
    .from(profiles)
    .where(sql`${profiles.id} IN ${relevantUserIds}`);

  // Build leaderboard with profiles
  const leaders = leaderProfiles
    .map(profile => {
      const winData = leaderboardData.find(d => d.userId === profile.id);
      return {
        id: profile.id,
        name: profile.displayName,
        title: profile.rankTitle,
        wins: winData ? Number(winData.wins) : 0,
        isCurrentUser: profile.id === user.id,
      };
    })
    .sort((a, b) => b.wins - a.wins)
    .map((player, index) => ({ ...player, rank: index + 1 }));

  const hasData = leaders.some(l => l.wins > 0);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-cream/70 hover:text-cream transition shadow-card"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif text-2xl font-bold text-cream">
          Leaderboard
        </h1>
      </div>

      {/* Info */}
      <div className="flex items-center gap-2 text-sm text-cream-muted">
        <Users size={16} />
        <span>You and {friendIds.length} friend{friendIds.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Leaderboard */}
      {!hasData ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-cream/40" />
          </div>
          <p className="text-cream/60 mb-2">No wins recorded yet</p>
          <p className="text-sm text-cream-muted">
            Play some games and record wins to see the leaderboard
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaders.map((player, i) => {
            const initials = player.name
              .split(" ")
              .map(n => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={player.id}
                className={`card p-4 flex items-center gap-4 transition-all hover:scale-[1.01] ${
                  i === 0 && player.wins > 0 ? "ring-1 ring-gold/30" : ""
                } ${player.isCurrentUser ? "bg-green/5 ring-1 ring-green/20" : ""}`}
              >
                {/* Rank */}
                <div className="w-8 flex items-center justify-center">
                  {player.wins > 0 && RANK_ICONS[player.rank] ? (
                    <span className="text-2xl">{RANK_ICONS[player.rank]}</span>
                  ) : (
                    <span className="text-lg font-bold text-cream/40">
                      {player.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                    AVATAR_COLORS[i % AVATAR_COLORS.length]
                  } ${i === 0 && player.wins > 0 ? "ring-2 ring-gold ring-offset-2 ring-offset-jade" : ""}`}
                >
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-cream">{player.name}</p>
                    {player.isCurrentUser && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green/20 text-green font-semibold">
                        YOU
                      </span>
                    )}
                  </div>
                  {player.title && player.title !== "Novice" && (
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        i === 0 ? "text-gold" : "text-green"
                      }`}
                    >
                      {player.title}
                    </p>
                  )}
                </div>

                {/* Wins */}
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span
                      className={`text-2xl font-bold ${
                        i === 0 && player.wins > 0 ? "text-gold" : "text-cream"
                      }`}
                    >
                      {player.wins}
                    </span>
                    {i < 3 && player.wins > 0 && <Trophy size={16} className="text-gold" />}
                  </div>
                  <p className="text-[11px] text-cream-muted uppercase tracking-wider">
                    wins
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Record Win Button */}
      <div className="fixed bottom-28 left-5 right-5 z-40">
        <Link href="/sessions">
          <button className="btn-green w-full py-4 text-base flex items-center justify-center gap-2 shadow-xl">
            <span className="text-lg">+</span>
            Record a Win
          </button>
        </Link>
      </div>

      {/* Spacer for fixed button */}
      <div className="h-20" />
    </div>
  );
}
