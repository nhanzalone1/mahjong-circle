import { Clock, Users, ChevronRight, Plus, Home, Calendar } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sessions, results, profiles, groupMembers, rsvps } from "@/lib/schema";
import { eq, desc, sql, lt, gte } from "drizzle-orm";

export default async function SessionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  // Get user's groups
  const userGroups = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, user.id));

  const groupIds = userGroups.map(g => g.groupId);

  // Get all sessions for user's groups
  let allSessions: Array<{
    id: string;
    location: string | null;
    date: Date;
    status: string | null;
    winnerId?: string | null;
    winnerName?: string | null;
    rsvpCount?: number;
  }> = [];

  if (groupIds.length > 0) {
    const sessionData = await db
      .select()
      .from(sessions)
      .where(sql`${sessions.groupId} IN ${groupIds}`)
      .orderBy(desc(sessions.date));

    // Get results for past sessions
    const sessionIds = sessionData.map(s => s.id);
    const sessionResults = sessionIds.length > 0
      ? await db.select().from(results).where(sql`${results.sessionId} IN ${sessionIds}`)
      : [];

    // Get winner profiles
    const winnerIds = sessionResults.map(r => r.winnerId).filter(Boolean) as string[];
    const winnerProfiles = winnerIds.length > 0
      ? await db.select().from(profiles).where(sql`${profiles.id} IN ${winnerIds}`)
      : [];

    // Get RSVP counts
    const rsvpCounts = sessionIds.length > 0
      ? await db
          .select({
            sessionId: rsvps.sessionId,
            count: sql<number>`count(*)`,
          })
          .from(rsvps)
          .where(sql`${rsvps.sessionId} IN ${sessionIds}`)
          .groupBy(rsvps.sessionId)
      : [];

    allSessions = sessionData.map(s => {
      const result = sessionResults.find(r => r.sessionId === s.id);
      const winner = result?.winnerId ? winnerProfiles.find(p => p.id === result.winnerId) : null;
      const rsvpData = rsvpCounts.find(r => r.sessionId === s.id);

      return {
        id: s.id,
        location: s.location,
        date: s.date,
        status: s.status,
        winnerId: result?.winnerId,
        winnerName: winner?.displayName,
        rsvpCount: rsvpData ? Number(rsvpData.count) : 0,
      };
    });
  }

  const now = new Date();
  const upcomingSessions = allSessions.filter(s => new Date(s.date) > now);
  const pastSessions = allSessions.filter(s => new Date(s.date) <= now);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-cream">
          Games
        </h1>
        <Link href="/sessions/new">
          <button className="w-11 h-11 rounded-xl bg-gold flex items-center justify-center text-jade hover:bg-gold-light transition">
            <Plus size={20} />
          </button>
        </Link>
      </div>

      {allSessions.length === 0 ? (
        /* Elegant Empty State */
        <div className="text-center py-16">
          <p className="text-cream/50 mb-6">No games scheduled yet</p>
          <Link href="/sessions/new">
            <button className="btn-ghost">
              Create Your First Game
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <section>
              <p className="section-title mb-4">Upcoming</p>
              <div className="space-y-3">
                {upcomingSessions.map((session) => {
                  const dateObj = new Date(session.date);
                  const dateStr = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  const timeStr = dateObj.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <Link key={session.id} href={`/sessions/${session.id}`}>
                      <div className="card p-5 flex items-center gap-4 hover:bg-[#1a3325] transition">
                        <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                          <Home size={20} className="text-gold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-cream truncate">
                            {session.location || "Game Night"}
                          </p>
                          <p className="text-sm text-cream-muted">
                            {dateStr} · {timeStr}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-cream-muted">
                          <Users size={14} />
                          <span className="text-sm">{session.rsvpCount}</span>
                        </div>
                        <ChevronRight size={18} className="text-cream/30" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <section>
              <p className="section-title mb-4">Past Games</p>
              <div className="space-y-3">
                {pastSessions.map((session) => {
                  const dateObj = new Date(session.date);
                  const dateStr = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  const timeStr = dateObj.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <Link key={session.id} href={`/sessions/${session.id}`}>
                      <div className="card p-5 flex items-center gap-4 hover:bg-[#1a3325] transition">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                          <Home size={20} className="text-cream/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold text-cream truncate">
                              {session.location || "Game Night"}
                            </p>
                            {session.winnerName && (
                              <span className="badge-winner text-[10px]">
                                Winner
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-cream-muted">
                            {dateStr} · {timeStr}
                          </p>
                          {session.winnerName && (
                            <p className="text-sm text-gold mt-1">
                              {session.winnerName}
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/sessions/${session.id}`}
                          className="text-sm text-gold hover:underline"
                        >
                          View Details →
                        </Link>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
