CREATE TABLE "model_pricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" text NOT NULL,
	"credit_cost" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation" ADD COLUMN "credit_cost" integer;--> statement-breakpoint
CREATE UNIQUE INDEX "model_pricing_model_id_idx" ON "model_pricing" USING btree ("model_id");