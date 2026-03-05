import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, sessions, rsvps, results, groupMembers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { format, isPast } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { MapPin, Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RSVPButtons } from "./rsvp-buttons";
import { RecordWinnerForm } from "./record-winner-form";

type Attendee = {
  userId: string;
  name: string;
  response: string;
  note: string | null;
};

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  // Get session
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);

  if (!session) notFound();

  // Get host profile
  let hostProfile = null;
  if (session.hostId) {
    const [host] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, session.hostId))
      .limit(1);
    hostProfile = host;
  }

  // Get all RSVPs with user profiles
  const sessionRsvps = await db
    .select({
      userId: rsvps.userId,
      response: rsvps.response,
      note: rsvps.note,
    })
    .from(rsvps)
    .where(eq(rsvps.sessionId, id));

  const attendees: Attendee[] = [];
  for (const rsvp of sessionRsvps) {
    const [profile] = await db
      .select({ displayName: profiles.displayName })
      .from(profiles)
      .where(eq(profiles.id, rsvp.userId))
      .limit(1);

    attendees.push({
      userId: rsvp.userId,
      name: profile?.displayName ?? "Unknown",
      response: rsvp.response,
      note: rsvp.note,
    });
  }

  // Get result if exists
  const [result] = await db
    .select()
    .from(results)
    .where(eq(results.sessionId, id))
    .limit(1);

  let winnerName = null;
  if (result?.winnerId) {
    const [winner] = await db
      .select({ displayName: profiles.displayName })
      .from(profiles)
      .where(eq(profiles.id, result.winnerId))
      .limit(1);
    winnerName = winner?.displayName;
  }

  // Get group members for record winner dropdown
  const members = await db
    .select({
      userId: groupMembers.userId,
      displayName: profiles.displayName,
    })
    .from(groupMembers)
    .innerJoin(profiles, eq(profiles.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, session.groupId));

  const myRsvp = sessionRsvps.find((r) => r.userId === user.id);
  const isSessionPast = isPast(session.date);
  const goingList = attendees.filter((a) => a.response === "coming");
  const maybeList = attendees.filter((a) => a.response === "maybe");
  const cantList = attendees.filter((a) => a.response === "cant");

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Back link */}
      <Link
        href="/sessions"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
      >
        <ArrowLeft size={16} />
        Back to Sessions
      </Link>

      {/* Header Card */}
      <div className="card overflow-hidden">
        {/* Image area */}
        <div className="h-40 bg-gradient-to-br from-[#1a3d2b]/10 to-[#C9A84C]/10 flex items-center justify-center">
          <span className="text-6xl">🀄</span>
        </div>

        <div className="p-5">
          {/* Status badge */}
          <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
            isSessionPast
              ? "bg-gray-100 text-gray-500"
              : "bg-green-100 text-green-700"
          }`}>
            {isSessionPast ? "Completed" : "Upcoming"}
          </span>

          <h1 className="text-2xl font-bold text-[#0D1F17] mt-3">
            {session.location ?? `${hostProfile?.displayName ?? "TBD"}'s Place`}
          </h1>

          <div className="flex flex-col gap-2 mt-3 text-gray-500">
            <div className="flex items-center gap-2.5">
              <Calendar size={16} className="text-[#C9A84C]" />
              <span className="text-sm">{format(session.date, "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-[#C9A84C]" />
              <span className="text-sm">{format(session.date, "h:mm a")}</span>
            </div>
            {session.location && (
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-[#C9A84C]" />
                <span className="text-sm">{session.location}</span>
              </div>
            )}
          </div>

          {session.notes && (
            <p className="mt-4 text-gray-500 text-sm">
              {session.notes}
            </p>
          )}
        </div>
      </div>

      {/* Winner Section (if completed) */}
      {result && (
        <div className="card p-5 bg-gradient-to-br from-[#C9A84C]/10 to-white border border-[#C9A84C]/30">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏆</span>
            <div>
              <p className="text-xs text-[#C9A84C] font-semibold uppercase tracking-wider">
                Winner
              </p>
              <p className="text-xl font-bold text-[#0D1F17]">{winnerName}</p>
            </div>
          </div>
        </div>
      )}

      {/* RSVP Section (if upcoming) */}
      {!isSessionPast && (
        <div>
          <p className="section-title mb-3">Your RSVP</p>
          <RSVPButtons
            sessionId={id}
            currentResponse={myRsvp?.response ?? null}
            currentNote={myRsvp?.note ?? null}
          />
        </div>
      )}

      {/* Record Winner (if past and no result) */}
      {isSessionPast && !result && (
        <div>
          <p className="section-title mb-3">Record Winner</p>
          <RecordWinnerForm sessionId={id} members={members} />
        </div>
      )}

      {/* Attendees */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="section-title">Who&apos;s Coming?</p>
          <span className="text-sm text-[#1a3d2b]">
            {goingList.length + maybeList.length} total
          </span>
        </div>

        <div className="space-y-2">
          {/* Going */}
          {goingList.map((attendee) => (
            <AttendeeCard key={attendee.userId} attendee={attendee} />
          ))}

          {/* Maybe */}
          {maybeList.map((attendee) => (
            <AttendeeCard key={attendee.userId} attendee={attendee} />
          ))}

          {/* Can't make it */}
          {cantList.map((attendee) => (
            <AttendeeCard key={attendee.userId} attendee={attendee} />
          ))}

          {attendees.length === 0 && (
            <div className="card p-6 text-center">
              <p className="text-gray-500 text-sm">
                No RSVPs yet. Be the first!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AttendeeCard({ attendee }: { attendee: Attendee }) {
  const statusConfig = {
    coming: { label: "Coming", className: "badge-coming" },
    maybe: { label: "Maybe", className: "badge-maybe" },
    cant: { label: "Can't", className: "badge-cant" },
  } as const;

  const status = statusConfig[attendee.response as keyof typeof statusConfig] ?? statusConfig.maybe;

  const AVATAR_COLORS = [
    "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-violet-500",
    "bg-cyan-500", "bg-orange-500", "bg-teal-500", "bg-pink-500",
  ];
  const colorIndex = attendee.name.charCodeAt(0) % AVATAR_COLORS.length;

  return (
    <div className="card p-4 flex items-center gap-3">
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[colorIndex]} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
        {attendee.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#0D1F17]">{attendee.name}</p>
        {attendee.note && (
          <p className="text-sm text-gray-500 truncate">
            {attendee.note}
          </p>
        )}
      </div>

      {/* Status */}
      <span className={`badge ${status.className}`}>{status.label}</span>
    </div>
  );
}
