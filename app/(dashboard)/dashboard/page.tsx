import { Calendar, Clock, MapPin, Plus, Users } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sessions, rsvps, profiles, groupMembers, friendships } from "@/lib/schema";
import { eq, gt, asc, sql } from "drizzle-orm";

const AVATAR_COLORS = [
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-violet-600",
  "bg-cyan-600",
  "bg-orange-600",
];

function Avatar({ name, size = "md", index = 0 }: { name: string; size?: "sm" | "md" | "lg"; index?: number }) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className={`${sizeClasses[size]} ${AVATAR_COLORS[index % AVATAR_COLORS.length]} rounded-full flex items-center justify-center font-bold text-white shadow-lg`}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; class: string }> = {
    coming: { label: "Coming", class: "badge-coming" },
    maybe: { label: "Maybe", class: "badge-maybe" },
    cant: { label: "Can't Make It", class: "badge-cant" },
  };

  const { label, class: className } = config[status] || config.coming;

  return (
    <span className={`badge ${className}`}>
      {label}
    </span>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  // Get user's groups
  const userGroups = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, user.id));

  const groupIds = userGroups.map(g => g.groupId);

  // Get next upcoming session
  let nextSession = null;
  let sessionRsvps: Array<{ userId: string; response: string; note: string | null; profile: { displayName: string } | null }> = [];

  if (groupIds.length > 0) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(sql`${sessions.groupId} IN ${groupIds} AND ${sessions.date} > NOW() AND ${sessions.status} = 'upcoming'`)
      .orderBy(asc(sessions.date))
      .limit(1);

    if (session) {
      nextSession = session;

      // Get RSVPs for this session with profiles
      const rsvpData = await db
        .select({
          userId: rsvps.userId,
          response: rsvps.response,
          note: rsvps.note,
        })
        .from(rsvps)
        .where(eq(rsvps.sessionId, session.id));

      // Get profiles for RSVP users
      const rsvpUserIds = rsvpData.map(r => r.userId);
      const rsvpProfiles = rsvpUserIds.length > 0
        ? await db.select().from(profiles).where(sql`${profiles.id} IN ${rsvpUserIds}`)
        : [];

      sessionRsvps = rsvpData.map(r => ({
        ...r,
        profile: rsvpProfiles.find(p => p.id === r.userId) || null,
      }));
    }
  }

  // Get friend count
  const [friendCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(friendships)
    .where(
      sql`(${friendships.requesterId} = ${user.id} OR ${friendships.addresseeId} = ${user.id}) AND ${friendships.status} = 'accepted'`
    );

  const hasFriends = Number(friendCount?.count || 0) > 0;

  // If no next session, show welcome/empty state
  if (!nextSession) {
    return (
      <div className="space-y-8 animate-fade-up">
        {/* Welcome Section */}
        <section className="text-center pt-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-4xl">🀄</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-cream mb-2">
            Welcome to Mahjong Night
          </h2>
          <p className="text-cream-muted">
            {hasFriends
              ? "No upcoming games scheduled. Create one to get started!"
              : "Add some friends to start playing together"}
          </p>
        </section>

        {/* Action Cards */}
        <div className="space-y-4">
          {groupIds.length === 0 && (
            <Link href="/groups">
              <div className="card p-5 flex items-center gap-4 hover:bg-surface-raised transition ring-1 ring-gold/30">
                <div className="w-14 h-14 rounded-xl bg-gold/20 flex items-center justify-center">
                  <span className="text-2xl">🀄</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-cream mb-1">Create or Join a Circle</p>
                  <p className="text-sm text-cream-muted">
                    Start by creating your mahjong group
                  </p>
                </div>
              </div>
            </Link>
          )}

          {!hasFriends && (
            <Link href="/friends">
              <div className="card p-5 flex items-center gap-4 hover:bg-surface-raised transition">
                <div className="w-14 h-14 rounded-xl bg-green/20 flex items-center justify-center">
                  <Users size={26} className="text-green" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-cream mb-1">Add Friends</p>
                  <p className="text-sm text-cream-muted">
                    Share your invite code to connect
                  </p>
                </div>
              </div>
            </Link>
          )}

          {groupIds.length > 0 && (
            <Link href="/sessions/new">
              <div className="card p-5 flex items-center gap-4 hover:bg-surface-raised transition">
                <div className="w-14 h-14 rounded-xl bg-green/20 flex items-center justify-center">
                  <Plus size={26} className="text-green" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-cream mb-1">Create a Game Night</p>
                  <p className="text-sm text-cream-muted">
                    Schedule your next session
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Quick Links */}
        <section>
          <p className="section-title mb-4">Explore</p>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/leaderboard">
              <div className="card p-5 text-center hover:scale-[1.02] transition">
                <span className="text-3xl mb-2 block">🏆</span>
                <p className="font-semibold text-cream text-sm">Leaderboard</p>
              </div>
            </Link>
            <Link href="/sessions">
              <div className="card p-5 text-center hover:scale-[1.02] transition">
                <span className="text-3xl mb-2 block">📋</span>
                <p className="font-semibold text-cream text-sm">Game History</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // Format date
  const sessionDate = new Date(nextSession.date);
  const dateStr = sessionDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const timeStr = sessionDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const goingAttendees = sessionRsvps.filter(a => a.response === "coming");
  const totalAttendees = sessionRsvps.length;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Next Game Section */}
      <section>
        <p className="section-title mb-4">Next Game</p>

        {/* Featured Card */}
        <div className="card-featured overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-44 bg-gradient-to-br from-surface-raised to-jade overflow-hidden">
            {/* Mahjong tiles illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-4 gap-2 transform rotate-6 scale-110 opacity-60">
                {["🀄", "🀅", "🀆", "🀇", "🀈", "🀉", "🀊", "🀋"].map((tile, i) => (
                  <div key={i} className="w-12 h-16 bg-cream/10 rounded-lg flex items-center justify-center text-2xl shadow-lg backdrop-blur-sm">
                    {tile}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="p-6 -mt-6 relative">
            <span className="badge badge-green text-[10px] mb-4">
              Upcoming Gathering
            </span>

            <h2 className="font-serif text-2xl font-bold text-cream mb-4">
              {nextSession.location || "Game Night"}
            </h2>

            <div className="space-y-2.5 mb-6">
              <div className="flex items-center gap-3 text-cream/70">
                <Calendar size={16} className="text-gold" />
                <span className="text-sm">{dateStr}</span>
              </div>
              <div className="flex items-center gap-3 text-cream/70">
                <Clock size={16} className="text-gold" />
                <span className="text-sm">{timeStr}</span>
              </div>
            </div>

            {/* Attendees Preview Row */}
            <div className="flex items-center justify-between pt-5 border-t border-white/10">
              <div className="flex items-center gap-3">
                {/* Stacked Avatars */}
                <div className="flex -space-x-3">
                  {goingAttendees.slice(0, 4).map((attendee, i) => (
                    <div key={attendee.userId} className="ring-2 ring-surface-raised rounded-full">
                      <Avatar name={attendee.profile?.displayName || "?"} size="sm" index={i} />
                    </div>
                  ))}
                </div>
                {totalAttendees > 4 && (
                  <span className="text-sm text-cream/60">
                    +{totalAttendees - 4} more
                  </span>
                )}
                {totalAttendees === 0 && (
                  <span className="text-sm text-cream/60">No RSVPs yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RSVP Button */}
        <Link href={`/sessions/${nextSession.id}`} className="block mt-4">
          <button className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
            <span>✓</span>
            RSVP Now
          </button>
        </Link>
      </section>

      {/* Who's Coming Section */}
      {sessionRsvps.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="section-title">Who's Coming?</p>
            <span className="text-sm font-medium text-green">
              {totalAttendees} total
            </span>
          </div>

          <div className="space-y-3">
            {sessionRsvps.map((attendee, i) => (
              <div
                key={attendee.userId}
                className="card p-4 flex items-center gap-4"
              >
                <Avatar name={attendee.profile?.displayName || "?"} size="md" index={i} />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-cream">
                    {attendee.profile?.displayName || "Unknown"}
                  </p>
                  {attendee.note && (
                    <p className="text-sm text-cream-muted truncate">{attendee.note}</p>
                  )}
                </div>

                <StatusBadge status={attendee.response} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
