import { ChevronLeft, Trophy } from "lucide-react";
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

const FILTERS = ["All Time", "Season", "Monthly"];

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
    <div className="space-y-6 animate-fade-up pb-28">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="w-11 h-11 rounded-xl bg-[#152b1e] flex items-center justify-center text-cream/70 hover:text-cream transition"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif text-2xl font-bold text-cream">
          Season Leaderboard
        </h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {FILTERS.map((filter, i) => (
          <button
            key={filter}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              i === 0
                ? "bg-gold text-jade"
                : "bg-[#152b1e] text-cream/60 hover:text-cream"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {!hasData ? (
        <div className="card p-10 text-center">
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

            // Trophy colors for top 3
            const trophyColors: Record<number, string> = {
              1: "text-yellow-400", // Gold
              2: "text-gray-300",   // Silver
              3: "text-amber-600",  // Bronze
            };

            return (
              <div
                key={player.id}
                className={`card p-5 flex items-center gap-4 ${
                  player.isCurrentUser ? "ring-1 ring-gold/30" : ""
                }`}
              >
                {/* Rank */}
                <div className="w-8 flex items-center justify-center">
                  {player.wins > 0 && player.rank <= 3 ? (
                    <Trophy size={22} className={trophyColors[player.rank]} />
                  ) : (
                    <span className="text-lg font-bold text-cream/30">
                      {player.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white ${
                    AVATAR_COLORS[i % AVATAR_COLORS.length]
                  } ${player.rank === 1 && player.wins > 0 ? "ring-2 ring-gold ring-offset-2 ring-offset-[#152b1e]" : ""}`}
                >
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-cream">{player.name}</p>
                    {player.isCurrentUser && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-semibold">
                        YOU
                      </span>
                    )}
                  </div>
                  {player.title && player.title !== "Novice" && (
                    <p className="text-xs text-cream-muted mt-0.5">
                      {player.title}
                    </p>
                  )}
                </div>

                {/* Wins */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-gold">
                    {player.wins}
                  </p>
                  <p className="text-[10px] text-cream-muted uppercase tracking-wider">
                    wins
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Record Win Button */}
      <div className="fixed bottom-24 left-5 right-5 z-40">
        <Link href="/sessions">
          <button className="btn-gold w-full py-4 text-base font-semibold">
            Record Tonight's Win
          </button>
        </Link>
      </div>
    </div>
  );
}
