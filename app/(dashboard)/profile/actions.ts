"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type SettingKey = "gameNotifications" | "groupVisibility" | "darkTheme";

export async function updatePreference(key: SettingKey, value: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  // Check if settings exist
  const [existing] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, user.id))
    .limit(1);

  if (existing) {
    await db
      .update(userSettings)
      .set({
        [key]: value,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, user.id));
  } else {
    await db.insert(userSettings).values({
      userId: user.id,
      [key]: value,
    });
  }

  revalidatePath("/profile");
}
