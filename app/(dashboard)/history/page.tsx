import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, groupMembers, sessions, results, rsvps } from "@/lib/schema";
import { eq, and, lt, desc, sql } from "drizzle-orm";
import { format } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Search, Users, MapPin } from "lucide-react";

type GameHistoryEntry = {
  id: string;
  date: Date;
  location: string | null;
  hostName: string;
  winnerName: string | null;
  playerCount: number;
};

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  // Get user's group
  const [membership] = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, user.id))
    .limit(1);

  const groupId = membership?.groupId;

  let games: GameHistoryEntry[] = [];

  if (groupId) {
    // Get past sessions with results
    const pastSessions = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.groupId, groupId),
          lt(sessions.date, new Date())
        )
      )
      .orderBy(desc(sessions.date))
      .limit(50);

    for (const session of pastSessions) {
      // Get host name
      let hostName = "Unknown";
      if (session.hostId) {
        const [host] = await db
          .select({ displayName: profiles.displayName })
          .from(profiles)
          .where(eq(profiles.id, session.hostId))
          .limit(1);
        hostName = host?.displayName ?? "Unknown";
      }

      // Get result/winner
      let winnerName: string | null = null;
      const [result] = await db
        .select({ winnerId: results.winnerId })
        .from(results)
        .where(eq(results.sessionId, session.id))
        .limit(1);

      if (result?.winnerId) {
        const [winner] = await db
          .select({ displayName: profiles.displayName })
          .from(profiles)
          .where(eq(profiles.id, result.winnerId))
          .limit(1);
        winnerName = winner?.displayName ?? null;
      }

      // Get player count from RSVPs
      const [rsvpCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(rsvps)
        .where(and(eq(rsvps.sessionId, session.id), eq(rsvps.response, "coming")));

      games.push({
        id: session.id,
        date: session.date,
        location: session.location,
        hostName,
        winnerName,
        playerCount: Number(rsvpCount?.count ?? 0),
      });
    }
  }

  // Group games by month
  const gamesByMonth: Record<string, GameHistoryEntry[]> = {};
  for (const game of games) {
    const monthKey = format(game.date, "MMMM yyyy");
    if (!gamesByMonth[monthKey]) {
      gamesByMonth[monthKey] = [];
    }
    gamesByMonth[monthKey].push(game);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div className="animate-fade-up">
        <Link
          href="/sessions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--cream-muted)",
            textDecoration: "none",
            fontSize: "14px",
            marginBottom: "12px",
          }}
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <h1 style={{ fontSize: "28px", fontWeight: 700 }}>Games History</h1>
      </div>

      {/* Search */}
      <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            background: "var(--bg-raised)",
            borderRadius: "10px",
            border: "1px solid var(--border)",
          }}
        >
          <Search size={18} style={{ color: "var(--cream-muted)" }} />
          <input
            type="text"
            placeholder="Search games, hosts, or winners"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--cream)",
              fontSize: "15px",
            }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="animate-fade-up" style={{ animationDelay: "0.1s", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          className="btn-jade"
          style={{ padding: "8px 16px", fontSize: "13px" }}
        >
          All Time
        </button>
        {Object.keys(gamesByMonth).slice(0, 3).map((month) => (
          <button
            key={month}
            className="btn-ghost"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            {month.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Sessions list */}
      <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <p className="section-label" style={{ marginBottom: "12px" }}>Recent Sessions</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {games.map((game) => (
            <Link key={game.id} href={`/sessions/${game.id}`} style={{ textDecoration: "none" }}>
              <div
                className="tile-card"
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, var(--bg-surface) 0%, rgba(17,212,131,0.1) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    flexShrink: 0,
                  }}
                >
                  🀄
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <p style={{ fontWeight: 600, fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {game.location ?? `${game.hostName}'s Place`}
                    </p>
                    {game.winnerName && (
                      <span
                        style={{
                          background: "rgba(201,168,76,0.15)",
                          color: "var(--gold)",
                          padding: "3px 10px",
                          borderRadius: "100px",
                          fontSize: "11px",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        WINNER
                      </span>
                    )}
                  </div>
                  <p style={{ color: "var(--cream-muted)", fontSize: "13px", marginTop: "2px" }}>
                    {format(game.date, "MMM d, yyyy")} · {format(game.date, "h:mm a")}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" }}>
                    {game.winnerName && (
                      <span style={{ fontSize: "13px", color: "var(--gold)" }}>
                        {game.winnerName}
                      </span>
                    )}
                    <span style={{ fontSize: "12px", color: "var(--cream-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Users size={12} />
                      {game.playerCount} Players
                    </span>
                  </div>
                </div>

                {/* View details arrow */}
                <span style={{ color: "var(--jade)", fontSize: "13px" }}>
                  View Details →
                </span>
              </div>
            </Link>
          ))}

          {games.length === 0 && (
            <div className="tile-card" style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ fontSize: "40px", marginBottom: "12px" }}>📜</p>
              <p style={{ color: "var(--cream-muted)", fontSize: "14px" }}>
                No game history yet. Play some sessions first!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
