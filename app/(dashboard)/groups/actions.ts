"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { groups, groupMembers } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Generate a random 6-character group invite code
function generateGroupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createGroup(name: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  if (!name.trim()) {
    return { error: "Group name is required" };
  }

  const inviteCode = generateGroupCode();

  const [group] = await db.insert(groups).values({
    name: name.trim(),
    inviteCode,
    createdBy: user.id,
  }).returning();

  // Add creator as a member with admin role
  await db.insert(groupMembers).values({
    groupId: group.id,
    userId: user.id,
    role: "admin",
  });

  revalidatePath("/groups");
  revalidatePath("/dashboard");
  revalidatePath("/sessions");

  return { success: true, group };
}

export async function joinGroup(inviteCode: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const code = inviteCode.trim().toUpperCase();

  // Find group by invite code
  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.inviteCode, code))
    .limit(1);

  if (!group) {
    return { error: "No group found with that code" };
  }

  // Check if already a member
  const [existing] = await db
    .select()
    .from(groupMembers)
    .where(sql`${groupMembers.groupId} = ${group.id} AND ${groupMembers.userId} = ${user.id}`)
    .limit(1);

  if (existing) {
    return { error: "You're already in this group" };
  }

  // Add as member
  await db.insert(groupMembers).values({
    groupId: group.id,
    userId: user.id,
    role: "member",
  });

  revalidatePath("/groups");
  revalidatePath("/dashboard");
  revalidatePath("/sessions");

  return { success: true, groupName: group.name };
}

export async function getMyGroups(userId: string) {
  const memberships = await db
    .select({
      groupId: groupMembers.groupId,
      role: groupMembers.role,
      group: groups,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, userId));

  return memberships.map(m => ({
    ...m.group,
    role: m.role,
  }));
}

export async function getGroupMemberCount(groupId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));

  return Number(result?.count || 0);
}
