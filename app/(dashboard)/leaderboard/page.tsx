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
  "bg-orange-500",
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-pink-500",
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

  const relevantUserIds = [user.id, ...friendIds];

  const leaderboardData = await db
    .select({
      userId: results.winnerId,
      wins: sql<number>`count(*)`.as("wins"),
    })
    .from(results)
    .where(sql`${results.winnerId} IN ${relevantUserIds}`)
    .groupBy(results.winnerId)
    .orderBy(desc(sql`count(*)`));

  const leaderProfiles = await db
    .select()
    .from(profiles)
    .where(sql`${profiles.id} IN ${relevantUserIds}`);

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
          className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif text-2xl font-bold text-[#0D1F17]">
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
                ? "bg-[#1a3d2b] text-white"
                : "bg-white text-gray-500 hover:text-gray-700 shadow-sm"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {!hasData ? (
        <div className="card p-10 text-center">
          <p className="text-gray-500 mb-2">No wins recorded yet</p>
          <p className="text-sm text-gray-400">
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

            const trophyColors: Record<number, string> = {
              1: "text-yellow-500",
              2: "text-gray-400",
              3: "text-amber-600",
            };

            return (
              <div
                key={player.id}
                className={`card p-5 flex items-center gap-4 ${
                  player.isCurrentUser ? "ring-2 ring-[#C9A84C]/30" : ""
                }`}
              >
                {/* Rank */}
                <div className="w-8 flex items-center justify-center">
                  {player.wins > 0 && player.rank <= 3 ? (
                    <Trophy size={22} className={trophyColors[player.rank]} />
                  ) : (
                    <span className="text-lg font-bold text-gray-300">
                      {player.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white ${
                    AVATAR_COLORS[i % AVATAR_COLORS.length]
                  } ${player.rank === 1 && player.wins > 0 ? "ring-2 ring-[#C9A84C] ring-offset-2" : ""}`}
                >
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#0D1F17]">{player.name}</p>
                    {player.isCurrentUser && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A84C]/15 text-[#a08339] font-semibold">
                        YOU
                      </span>
                    )}
                  </div>
                  {player.title && player.title !== "Novice" && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {player.title}
                    </p>
                  )}
                </div>

                {/* Wins */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#C9A84C]">
                    {player.wins}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
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
          <button className="btn-primary w-full py-4 text-base font-semibold shadow-lg">
            Record Tonight's Win
          </button>
        </Link>
      </div>
    </div>
  );
}
