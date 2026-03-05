import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { groupMembers } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CreateSessionForm } from "./create-session-form";

export default async function NewSessionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  // Get user's group
  const [membership] = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, user.id))
    .limit(1);

  if (!membership?.groupId) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
          Back
        </Link>

        <div className="tile-card" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ fontSize: "40px", marginBottom: "12px" }}>🀄</p>
          <p style={{ fontWeight: 600, fontSize: "16px", marginBottom: "8px" }}>
            Join a circle first
          </p>
          <p style={{ color: "var(--cream-muted)", fontSize: "14px" }}>
            You need to be in a circle to schedule game nights.
          </p>
        </div>
      </div>
    );
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
        <h1 style={{ fontSize: "28px", fontWeight: 700 }}>Schedule a Night</h1>
        <p style={{ color: "var(--cream-muted)", fontSize: "14px", marginTop: "4px" }}>
          Set up the next mahjong gathering
        </p>
      </div>

      <CreateSessionForm groupId={membership.groupId} />
    </div>
  );
}
