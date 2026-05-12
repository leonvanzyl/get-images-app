CREATE TABLE "generation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"prompt" text NOT NULL,
	"model_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"aspect_ratio" text NOT NULL,
	"style" text,
	"seed" integer,
	"image_url" text NOT NULL,
	"media_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation" ADD CONSTRAINT "generation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generation_user_id_idx" ON "generation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generation_created_at_idx" ON "generation" USING btree ("created_at");