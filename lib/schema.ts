import { pgTable, text, timestamp, uuid, unique, integer, boolean } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  rankTitle: text("rank_title").default("Novice"),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").default("member"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
}, (t) => [unique("group_member_unique").on(t.groupId, t.userId)]);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").notNull(),
  hostId: text("host_id"),
  date: timestamp("date", { withTimezone: true }).notNull(),
  location: text("location"),
  notes: text("notes"),
  status: text("status").default("upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const rsvps = pgTable("rsvps", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull(),
  userId: text("user_id").notNull(),
  response: text("response").notNull(), // 'coming', 'maybe', 'cant'
  note: text("note"), // e.g., "Bringing snacks"
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => [unique("rsvp_unique").on(t.sessionId, t.userId)]);

export const results = pgTable("results", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().unique(),
  winnerId: text("winner_id"),
  notes: text("notes"),
  recordedBy: text("recorded_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // 'first_win', 'five_wins', 'ten_wins', 'champion', etc.
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }).defaultNow(),
}, (t) => [unique("achievement_unique").on(t.userId, t.type)]);

export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  gameNotifications: boolean("game_notifications").default(true),
  groupVisibility: boolean("group_visibility").default(true),
  darkTheme: boolean("dark_theme").default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const friendships = pgTable("friendships", {
  id: uuid("id").primaryKey().defaultRandom(),
  requesterId: text("requester_id").notNull(),
  addresseeId: text("addressee_id").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (t) => [unique("friendship_unique").on(t.requesterId, t.addresseeId)]);
