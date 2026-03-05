import { createNeonAuth } from "@neondatabase/auth/next/server";
import { db } from "./db";
import { profiles } from "./schema";
import { eq } from "drizzle-orm";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

// Helper: get current user on the server (Server Components / Server Actions)
export async function getCurrentUser() {
  const session = await auth.getSession();
  if (!session || session.error) return null;
  return session.data?.user ?? null;
}

// Generate a random 6-character invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Get or create a profile for the authenticated user
export async function getOrCreateProfile(user: { id: string; name?: string; email?: string }) {
  const [existing] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (existing) return existing;

  const displayName = user.name || user.email?.split("@")[0] || "Player";
  const inviteCode = generateInviteCode();

  const [profile] = await db.insert(profiles).values({
    id: user.id,
    displayName,
    inviteCode,
  }).returning();

  return profile;
}
