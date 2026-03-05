"use server";

import { db } from "@/lib/db";
import { profiles, friendships } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addFriendByCode(inviteCode: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const code = inviteCode.trim().toUpperCase();

  // Find the user with this invite code
  const [friendProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.inviteCode, code))
    .limit(1);

  if (!friendProfile) {
    return { error: "No user found with that invite code" };
  }

  if (friendProfile.id === user.id) {
    return { error: "You can't add yourself as a friend" };
  }

  // Check if friendship already exists (in either direction)
  const [existingFriendship] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, user.id), eq(friendships.addresseeId, friendProfile.id)),
        and(eq(friendships.requesterId, friendProfile.id), eq(friendships.addresseeId, user.id))
      )
    )
    .limit(1);

  if (existingFriendship) {
    if (existingFriendship.status === "accepted") {
      return { error: "You're already friends!" };
    }
    return { error: "Friend request already pending" };
  }

  // Create friendship (auto-accept for invite code method)
  await db.insert(friendships).values({
    requesterId: user.id,
    addresseeId: friendProfile.id,
    status: "accepted", // Direct connection via invite code
  });

  revalidatePath("/friends");
  revalidatePath("/profile");
  revalidatePath("/leaderboard");

  return { success: true, friendName: friendProfile.displayName };
}

export async function removeFriend(friendshipId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Only allow removing friendships you're part of
  await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.id, friendshipId),
        or(eq(friendships.requesterId, user.id), eq(friendships.addresseeId, user.id))
      )
    );

  revalidatePath("/friends");
  revalidatePath("/profile");
  revalidatePath("/leaderboard");

  return { success: true };
}

export async function getFriendsWithProfiles(userId: string) {
  // Get all accepted friendships
  const userFriendships = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId))
      )
    );

  // Get friend IDs
  const friendIds = userFriendships.map(f =>
    f.requesterId === userId ? f.addresseeId : f.requesterId
  );

  if (friendIds.length === 0) return [];

  // Get friend profiles
  const friendProfiles = await db
    .select()
    .from(profiles)
    .where(sql`${profiles.id} IN ${friendIds}`);

  // Combine with friendship data
  return friendProfiles.map(profile => {
    const friendship = userFriendships.find(
      f => f.requesterId === profile.id || f.addresseeId === profile.id
    );
    return {
      ...profile,
      friendshipId: friendship?.id,
    };
  });
}
