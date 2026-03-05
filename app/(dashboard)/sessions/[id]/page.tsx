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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Back link */}
      <Link
        href="/sessions"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--cream-muted)",
          textDecoration: "none",
          fontSize: "14px",
        }}
      >
        <ArrowLeft size={16} />
        Back to Sessions
      </Link>

      {/* Header Card */}
      <div className="tile-card animate-fade-up" style={{ padding: "0", overflow: "hidden" }}>
        {/* Image area */}
        <div
          style={{
            height: "160px",
            background: "linear-gradient(135deg, var(--bg-raised) 0%, rgba(17,212,131,0.15) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "56px",
          }}
        >
          🀄
        </div>

        <div style={{ padding: "20px" }}>
          {/* Status badge */}
          <span
            style={{
              background: isSessionPast
                ? "rgba(168,136,128,0.15)"
                : "rgba(17,212,131,0.15)",
              color: isSessionPast ? "var(--cream-muted)" : "var(--jade)",
              padding: "4px 12px",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {isSessionPast ? "Completed" : "Upcoming"}
          </span>

          <h1 style={{ fontSize: "24px", fontWeight: 700, marginTop: "12px" }}>
            {session.location ?? `${hostProfile?.displayName ?? "TBD"}'s Place`}
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", color: "var(--cream-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Calendar size={16} />
              <span>{format(session.date, "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock size={16} />
              <span>{format(session.date, "h:mm a")}</span>
            </div>
            {session.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MapPin size={16} />
                <span>{session.location}</span>
              </div>
            )}
          </div>

          {session.notes && (
            <p style={{ marginTop: "16px", color: "var(--cream-muted)", fontSize: "14px" }}>
              {session.notes}
            </p>
          )}
        </div>
      </div>

      {/* Winner Section (if completed) */}
      {result && (
        <div className="tile-card animate-fade-up" style={{ padding: "20px", background: "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, var(--bg-raised) 100%)", border: "1px solid rgba(201,168,76,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "32px" }}>🏆</span>
            <div>
              <p style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Winner
              </p>
              <p style={{ fontSize: "20px", fontWeight: 700 }}>{winnerName}</p>
            </div>
          </div>
        </div>
      )}

      {/* RSVP Section (if upcoming) */}
      {!isSessionPast && (
        <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <p className="section-label" style={{ marginBottom: "12px" }}>Your RSVP</p>
          <RSVPButtons
            sessionId={id}
            currentResponse={myRsvp?.response ?? null}
            currentNote={myRsvp?.note ?? null}
          />
        </div>
      )}

      {/* Record Winner (if past and no result) */}
      {isSessionPast && !result && (
        <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <p className="section-label" style={{ marginBottom: "12px" }}>Record Winner</p>
          <RecordWinnerForm sessionId={id} members={members} />
        </div>
      )}

      {/* Attendees */}
      <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <p className="section-label">Who&apos;s Coming?</p>
          <span style={{ fontSize: "13px", color: "var(--jade)" }}>
            {goingList.length + maybeList.length} total
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
            <div className="tile-card" style={{ padding: "24px", textAlign: "center" }}>
              <p style={{ color: "var(--cream-muted)", fontSize: "14px" }}>
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
    coming: { label: "Coming", className: "badge--going", color: "var(--jade)" },
    maybe: { label: "Maybe", className: "badge--maybe", color: "var(--gold)" },
    cant: { label: "Can't Make It", className: "badge--out", color: "#ff8070" },
  } as const;

  const status = statusConfig[attendee.response as keyof typeof statusConfig] ?? statusConfig.maybe;

  return (
    <div
      className="tile-card"
      style={{
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: `hsl(${(attendee.name.charCodeAt(0) * 37) % 360}, 40%, 30%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {attendee.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: "15px" }}>{attendee.name}</p>
        {attendee.note && (
          <p style={{ color: "var(--cream-muted)", fontSize: "13px" }}>
            {attendee.note}
          </p>
        )}
      </div>

      {/* Status */}
      <span className={`badge ${status.className}`}>{status.label}</span>
    </div>
  );
}
