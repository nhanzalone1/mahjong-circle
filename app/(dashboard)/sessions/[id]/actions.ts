"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { rsvps, results } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateRSVP(
  sessionId: string,
  response: string,
  note: string | null
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  // Check if RSVP exists
  const [existing] = await db
    .select()
    .from(rsvps)
    .where(and(eq(rsvps.sessionId, sessionId), eq(rsvps.userId, user.id)))
    .limit(1);

  if (existing) {
    // Update existing RSVP
    await db
      .update(rsvps)
      .set({
        response,
        note,
        updatedAt: new Date(),
      })
      .where(eq(rsvps.id, existing.id));
  } else {
    // Create new RSVP
    await db.insert(rsvps).values({
      sessionId,
      userId: user.id,
      response,
      note,
    });
  }

  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/sessions");
  revalidatePath("/dashboard");
}

export async function recordWinner(sessionId: string, winnerId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  // Check if result already exists
  const [existing] = await db
    .select()
    .from(results)
    .where(eq(results.sessionId, sessionId))
    .limit(1);

  if (existing) {
    throw new Error("Winner already recorded for this session");
  }

  // Create result
  await db.insert(results).values({
    sessionId,
    winnerId,
    recordedBy: user.id,
  });

  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/sessions");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
}
