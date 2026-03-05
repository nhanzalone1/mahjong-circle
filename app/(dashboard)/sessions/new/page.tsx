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
      <div className="space-y-6 animate-fade-up">
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <div className="card p-10 text-center">
          <p className="text-5xl mb-3">🀄</p>
          <p className="font-semibold text-[#0D1F17] text-lg mb-2">
            Join a circle first
          </p>
          <p className="text-gray-500 text-sm">
            You need to be in a circle to schedule game nights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-3"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <h1 className="font-serif text-2xl font-bold text-[#0D1F17]">Schedule a Night</h1>
        <p className="text-gray-500 text-sm mt-1">
          Set up the next mahjong gathering
        </p>
      </div>

      <CreateSessionForm groupId={membership.groupId} />
    </div>
  );
}
