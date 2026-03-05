import { Search, Clock, Users, ChevronRight, Plus, Home, Calendar } from "lucide-react";
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
          <button className="w-11 h-11 rounded-xl bg-green flex items-center justify-center text-white shadow-lg shadow-green/30 hover:bg-green/90 transition">
            <Plus size={20} />
          </button>
        </Link>
      </div>

      {allSessions.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-cream/40" />
          </div>
          <p className="text-cream/60 mb-2">No games yet</p>
          <p className="text-sm text-cream-muted mb-6">
            Create your first game night to get started
          </p>
          <Link href="/sessions/new">
            <button className="btn-green px-6 py-3">
              Create Game Night
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
                    year: "numeric",
                  });
                  const timeStr = dateObj.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <Link key={session.id} href={`/sessions/${session.id}`}>
                      <div className="card p-4 flex items-center gap-4 transition-all hover:scale-[1.01] active:scale-[0.99]">
                        <div className="w-12 h-12 rounded-xl bg-green/20 flex items-center justify-center">
                          <Calendar size={20} className="text-green" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-cream truncate">
                            {session.location || "Game Night"}
                          </p>
                          <p className="text-sm text-cream-muted mb-1">
                            {dateStr} · {timeStr}
                          </p>
                          <span className="text-xs text-cream-muted flex items-center gap-1">
                            <Users size={12} />
                            {session.rsvpCount} RSVP{session.rsvpCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="text-cream/30">
                          <ChevronRight size={18} />
                        </div>
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
                    year: "numeric",
                  });
                  const timeStr = dateObj.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <Link key={session.id} href={`/sessions/${session.id}`}>
                      <div className="card p-4 flex items-center gap-4 transition-all hover:scale-[1.01] active:scale-[0.99]">
                        <div className="w-12 h-12 rounded-xl bg-surface-raised flex items-center justify-center">
                          <Home size={20} className="text-gold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-semibold text-cream truncate">
                              {session.location || "Game Night"}
                            </p>
                            {session.winnerName && (
                              <span className="badge badge-winner text-[10px] shrink-0">
                                Winner
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-cream-muted mb-1.5">
                            {dateStr} · {timeStr}
                          </p>
                          <div className="flex items-center gap-4">
                            {session.winnerName && (
                              <span className="text-sm font-medium text-gold">
                                {session.winnerName}
                              </span>
                            )}
                            <span className="text-xs text-cream-muted flex items-center gap-1">
                              <Users size={12} />
                              {session.rsvpCount} Player{session.rsvpCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <div className="text-cream/30">
                          <ChevronRight size={18} />
                        </div>
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
