"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sessions, rsvps } from "@/lib/schema";
import { revalidatePath } from "next/cache";

type CreateSessionInput = {
  groupId: string;
  date: Date;
  location: string | null;
  notes: string | null;
};

export async function createSession(input: CreateSessionInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  // Create the session with current user as host
  const [session] = await db
    .insert(sessions)
    .values({
      groupId: input.groupId,
      hostId: user.id,
      date: input.date,
      location: input.location,
      notes: input.notes,
      status: "upcoming",
    })
    .returning();

  // Auto-RSVP the host as "coming"
  await db.insert(rsvps).values({
    sessionId: session.id,
    userId: user.id,
    response: "coming",
    note: "Host",
  });

  revalidatePath("/sessions");
  revalidatePath("/dashboard");

  return session;
}
