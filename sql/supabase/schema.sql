-- Alerta RD — PostgreSQL / Supabase
-- Run once on a NEW dedicated project. Then run policies.sql and rpc.sql.
BEGIN;
CREATE TABLE "bookmarks" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "forum_categories" (
	"name" text PRIMARY KEY NOT NULL
);

CREATE TABLE "forum_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"profile_id" text,
	"parent_id" text,
	"body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"official" integer DEFAULT 0 NOT NULL,
	"featured" integer DEFAULT 0 NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "configurations" (
	"profile_id" text PRIMARY KEY NOT NULL,
	"features" text NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "debate_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"vote" text NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "feature_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"feature_id" text NOT NULL,
	"vote" text NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "comment_likes" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "moderation_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"target_id" text NOT NULL,
	"action" text NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "participation_data" (
	"profile_id" text PRIMARY KEY NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "poll_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"answers" text NOT NULL,
	"consent_version" text NOT NULL,
	"poll_version" integer NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "polls" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"questions" text NOT NULL,
	"active" integer DEFAULT 1 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"alias" text DEFAULT 'Participante' NOT NULL,
	"province" text,
	"role" text DEFAULT 'guest' NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "project_changes" (
	"id" text PRIMARY KEY NOT NULL,
	"concern" text NOT NULL,
	"suggestion" text NOT NULL,
	"decision" text NOT NULL,
	"change_made" text NOT NULL,
	"status" text NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "provinces" (
	"name" text PRIMARY KEY NOT NULL
);

CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"expires_at" bigint NOT NULL
);

CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"expires_at" bigint NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);

CREATE TABLE "simulations" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text,
	"type" text NOT NULL,
	"outcome" text NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "suggestions" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"problem" text NOT NULL,
	"solution" text NOT NULL,
	"status" text DEFAULT 'nueva' NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "forum_threads" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"category" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"official" integer DEFAULT 0 NOT NULL,
	"featured" integer DEFAULT 0 NOT NULL,
	"closed" integer DEFAULT 0 NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"salt" text NOT NULL,
	"created_at" text DEFAULT to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);

ALTER TABLE "bookmarks" ADD FOREIGN KEY ("thread_id") REFERENCES "forum_threads"("id") ON UPDATE no action ON DELETE cascade;

ALTER TABLE "bookmarks" ADD FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE cascade;

ALTER TABLE "forum_comments" ADD FOREIGN KEY ("thread_id") REFERENCES "forum_threads"("id") ON UPDATE no action ON DELETE cascade;

ALTER TABLE "forum_comments" ADD FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE set null;

ALTER TABLE "configurations" ADD FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE cascade;

ALTER TABLE "debate_votes" ADD FOREIGN KEY ("thread_id") REFERENCES "forum_threads"("id") ON UPDATE no action ON DELETE cascade;

ALTER TABLE "debate_votes" ADD FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE cascade;

ALTER TABLE "feature_votes" ADD FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE cascade;

ALTER TABLE "comment_likes" ADD FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE cascade;

ALTER TABLE "moderation_logs" ADD FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE set null;

ALTER TABLE "participation_data" ADD FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE cascade;

ALTER TABLE "poll_responses" ADD FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON UPDATE no action ON DELETE no action;

ALTER TABLE "poll_responses" ADD FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE cascade;

ALTER TABLE "reports" ADD FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE cascade;

ALTER TABLE "sessions" ADD FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE cascade;

ALTER TABLE "simulations" ADD FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE set null;

ALTER TABLE "suggestions" ADD FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE set null;

ALTER TABLE "forum_threads" ADD FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE set null;

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "profiles"("id") ON UPDATE no action ON DELETE cascade;

CREATE UNIQUE INDEX "uniq_bookmark" ON "bookmarks" ("profile_id","thread_id");

CREATE INDEX "idx_comments_thread_status" ON "forum_comments" ("thread_id","status");

CREATE UNIQUE INDEX "uniq_debate_voter" ON "debate_votes" ("thread_id","profile_id");

CREATE UNIQUE INDEX "uniq_feature_voter" ON "feature_votes" ("profile_id","feature_id");

CREATE UNIQUE INDEX "uniq_like" ON "comment_likes" ("profile_id","target_type","target_id");

CREATE UNIQUE INDEX "uniq_poll_voter" ON "poll_responses" ("poll_id","profile_id");

CREATE UNIQUE INDEX "uniq_report" ON "reports" ("profile_id","target_type","target_id");

CREATE INDEX "idx_sessions_expiry" ON "sessions" ("expires_at");

CREATE INDEX "idx_threads_status_date" ON "forum_threads" ("status","created_at");

CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");
COMMIT;
