import { Calendar, Clock, MapPin, Plus, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sessions, rsvps, profiles, groupMembers, friendships } from "@/lib/schema";
import { eq, gt, asc, sql } from "drizzle-orm";

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-pink-500",
];

function Avatar({ name, size = "md", index = 0, className = "" }: { name: string; size?: "sm" | "md" | "lg"; index?: number; className?: string }) {
  const sizeClasses = {
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className={`${sizeClasses[size]} ${AVATAR_COLORS[index % AVATAR_COLORS.length]} rounded-full flex items-center justify-center font-semibold text-white ${className}`}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; class: string }> = {
    coming: { label: "Coming", class: "badge-coming" },
    maybe: { label: "Maybe", class: "badge-maybe" },
    cant: { label: "Can't", class: "badge-cant" },
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

      const rsvpData = await db
        .select({
          userId: rsvps.userId,
          response: rsvps.response,
          note: rsvps.note,
        })
        .from(rsvps)
        .where(eq(rsvps.sessionId, session.id));

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

  // Empty state
  if (!nextSession) {
    return (
      <div className="space-y-10 animate-fade-up">
        {/* Welcome Section */}
        <section className="text-center pt-6">
          <h2 className="font-serif text-3xl font-bold text-[#0D1F17] mb-3">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-base">
            {groupIds.length === 0
              ? "Create or join a circle to get started"
              : hasFriends
                ? "No upcoming games. Schedule one!"
                : "Add friends to your circle"
            }
          </p>
        </section>

        {/* Action Cards */}
        <div className="space-y-4">
          {groupIds.length === 0 && (
            <Link href="/groups">
              <div className="card p-6 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#1a3d2b]/10 flex items-center justify-center">
                  <Users size={26} className="text-[#1a3d2b]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#0D1F17] text-lg mb-1">Create or Join a Circle</p>
                  <p className="text-sm text-gray-500">
                    Start your mahjong group
                  </p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </Link>
          )}

          {groupIds.length > 0 && !hasFriends && (
            <Link href="/friends">
              <div className="card p-6 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#1a3d2b]/10 flex items-center justify-center">
                  <Users size={26} className="text-[#1a3d2b]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#0D1F17] text-lg mb-1">Add Friends</p>
                  <p className="text-sm text-gray-500">
                    Share your invite code to connect
                  </p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </Link>
          )}

          {groupIds.length > 0 && (
            <Link href="/sessions/new">
              <div className="card p-6 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#C9A84C]/15 flex items-center justify-center">
                  <Plus size={26} className="text-[#C9A84C]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#0D1F17] text-lg mb-1">Schedule a Game Night</p>
                  <p className="text-sm text-gray-500">
                    Pick a date and invite the group
                  </p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </Link>
          )}
        </div>

        {/* Quick Links */}
        <section>
          <p className="section-title mb-4">Explore</p>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/leaderboard">
              <div className="card p-6 text-center">
                <p className="font-semibold text-[#0D1F17]">Leaderboard</p>
                <p className="text-sm text-gray-500 mt-1">View rankings</p>
              </div>
            </Link>
            <Link href="/sessions">
              <div className="card p-6 text-center">
                <p className="font-semibold text-[#0D1F17]">Games</p>
                <p className="text-sm text-gray-500 mt-1">Past sessions</p>
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

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Next Game Hero */}
      <section>
        <p className="section-title mb-4">Next Game</p>

        <div className="card overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&q=80"
              alt="Mahjong table"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

            {/* Badge */}
            <div className="absolute top-4 left-4">
              <span className="badge-upcoming">Upcoming Gathering</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 -mt-12 relative">
            <h2 className="font-serif text-2xl font-bold text-[#0D1F17] mb-4">
              {nextSession.location || "Game Night"}
            </h2>

            <div className="space-y-2.5 mb-6">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={16} className="text-[#C9A84C]" />
                <span className="text-sm">{dateStr}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock size={16} className="text-[#C9A84C]" />
                <span className="text-sm">{timeStr}</span>
              </div>
            </div>

            {/* Attendees Preview */}
            <div className="flex items-center justify-between pt-5 border-t border-gray-100">
              <div className="flex items-center gap-3">
                {goingAttendees.length > 0 ? (
                  <>
                    <div className="flex -space-x-2">
                      {goingAttendees.slice(0, 5).map((attendee, i) => (
                        <Avatar
                          key={attendee.userId}
                          name={attendee.profile?.displayName || "?"}
                          size="sm"
                          index={i}
                          className="ring-2 ring-white"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {goingAttendees.length} coming
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">No RSVPs yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RSVP Button */}
        <Link href={`/sessions/${nextSession.id}`} className="block mt-4">
          <button className="btn-primary w-full py-4 text-base">
            RSVP Now
          </button>
        </Link>
      </section>

      {/* Who's Coming */}
      {sessionRsvps.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="section-title">Who's Coming?</p>
            <span className="text-sm text-gray-500">
              {sessionRsvps.length} responded
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
                  <p className="font-medium text-[#0D1F17]">
                    {attendee.profile?.displayName || "Unknown"}
                  </p>
                  {attendee.note && (
                    <p className="text-sm text-gray-500 truncate">{attendee.note}</p>
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
