-- Drop legacy pricing table; superseded by the new fully-DB-driven `model` table.
DROP TABLE IF EXISTS "model_pricing";--> statement-breakpoint

-- Better Auth admin plugin columns on `user`.
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint

-- Impersonation column on `session`, populated by the admin plugin while
-- an admin acts as another user.
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint

-- Fully DB-driven model registry. Replaces the in-code IMAGE_MODELS array.
CREATE TABLE "model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"provider_model_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"aspect_ratios" text[] NOT NULL,
	"thinking_default" text,
	"thinking_high" text,
	"credit_cost" integer NOT NULL,
	"thinking_high_credit_cost" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "model_thinking_both_or_neither"
		CHECK ((thinking_default IS NULL) = (thinking_high IS NULL))
);--> statement-breakpoint
CREATE UNIQUE INDEX "model_model_id_idx" ON "model" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "model_is_active_sort_idx" ON "model" USING btree ("is_active","sort_order");--> statement-breakpoint

-- Append-only admin action log. `actor_id` is nullable so history survives
-- if the actor user row is later removed.
CREATE TABLE "admin_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"before" jsonb,
	"after" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_actor_id_user_id_fk"
	FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_log_actor_id_idx" ON "admin_audit_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "admin_audit_log_action_idx" ON "admin_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "admin_audit_log_target_idx" ON "admin_audit_log" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "admin_audit_log_created_at_idx" ON "admin_audit_log" USING btree ("created_at");
