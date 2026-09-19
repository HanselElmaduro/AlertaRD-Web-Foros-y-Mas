import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
const now = () =>
  text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`);
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  alias: text("alias").notNull().default("Participante"),
  province: text("province"),
  role: text("role").notNull().default("guest"),
  createdAt: now(),
});
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  salt: text("salt").notNull(),
  createdAt: now(),
});
export const sessions = sqliteTable(
  "sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
    createdAt: now(),
  },
  (t) => [index("idx_sessions_expiry").on(t.expiresAt)],
);
export const participation = sqliteTable("participation_data", {
  profileId: text("profile_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: now(),
});
export const provinces = sqliteTable("provinces", {
  name: text("name").primaryKey(),
});
export const categories = sqliteTable("forum_categories", {
  name: text("name").primaryKey(),
});
export const featureVotes = sqliteTable(
  "feature_votes",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    featureId: text("feature_id").notNull(),
    vote: text("vote").notNull(),
    createdAt: now(),
  },
  (t) => [uniqueIndex("uniq_feature_voter").on(t.profileId, t.featureId)],
);
export const configurations = sqliteTable("configurations", {
  profileId: text("profile_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  features: text("features").notNull(),
  createdAt: now(),
});
export const polls = sqliteTable("polls", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  questions: text("questions").notNull(),
  active: integer("active").notNull().default(1),
  version: integer("version").notNull().default(1),
  createdAt: now(),
});
export const pollResponses = sqliteTable(
  "poll_responses",
  {
    id: text("id").primaryKey(),
    pollId: text("poll_id")
      .notNull()
      .references(() => polls.id),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    answers: text("answers").notNull(),
    consentVersion: text("consent_version").notNull(),
    pollVersion: integer("poll_version").notNull(),
    createdAt: now(),
  },
  (t) => [uniqueIndex("uniq_poll_voter").on(t.pollId, t.profileId)],
);
export const threads = sqliteTable(
  "forum_threads",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    category: text("category").notNull(),
    status: text("status").notNull().default("pending"),
    official: integer("official").notNull().default(0),
    featured: integer("featured").notNull().default(0),
    closed: integer("closed").notNull().default(0),
    createdAt: now(),
  },
  (t) => [index("idx_threads_status_date").on(t.status, t.createdAt)],
);
export const comments = sqliteTable(
  "forum_comments",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    profileId: text("profile_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    parentId: text("parent_id"),
    body: text("body").notNull(),
    status: text("status").notNull().default("pending"),
    official: integer("official").notNull().default(0),
    featured: integer("featured").notNull().default(0),
    createdAt: now(),
  },
  (t) => [index("idx_comments_thread_status").on(t.threadId, t.status)],
);
export const likes = sqliteTable(
  "comment_likes",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    createdAt: now(),
  },
  (t) => [uniqueIndex("uniq_like").on(t.profileId, t.targetType, t.targetId)],
);
export const debateVotes = sqliteTable(
  "debate_votes",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    vote: text("vote").notNull(),
    createdAt: now(),
  },
  (t) => [uniqueIndex("uniq_debate_voter").on(t.threadId, t.profileId)],
);
export const bookmarks = sqliteTable(
  "bookmarks",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: now(),
  },
  (t) => [uniqueIndex("uniq_bookmark").on(t.profileId, t.threadId)],
);
export const reports = sqliteTable(
  "reports",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    reason: text("reason").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: now(),
  },
  (t) => [uniqueIndex("uniq_report").on(t.profileId, t.targetType, t.targetId)],
);
export const suggestions = sqliteTable("suggestions", {
  id: text("id").primaryKey(),
  profileId: text("profile_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  status: text("status").notNull().default("nueva"),
  createdAt: now(),
});
export const simulations = sqliteTable("simulations", {
  id: text("id").primaryKey(),
  profileId: text("profile_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  type: text("type").notNull(),
  outcome: text("outcome").notNull(),
  createdAt: now(),
});
export const projectChanges = sqliteTable("project_changes", {
  id: text("id").primaryKey(),
  concern: text("concern").notNull(),
  suggestion: text("suggestion").notNull(),
  decision: text("decision").notNull(),
  changeMade: text("change_made").notNull(),
  status: text("status").notNull(),
  createdAt: now(),
});
export const moderationLogs = sqliteTable("moderation_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  targetId: text("target_id").notNull(),
  action: text("action").notNull(),
  createdAt: now(),
});
export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: integer("expires_at").notNull(),
});
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
