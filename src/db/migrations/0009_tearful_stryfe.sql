CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" text NOT NULL,
	"user_id" text NOT NULL,
	"prompt" text NOT NULL,
	"model" text NOT NULL,
	"provider" text DEFAULT 'evolink',
	"external_task_id" text,
	"parameters" jsonb,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"error_message" text,
	"image_urls" jsonb,
	"thumbnail_url" text,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"generation_time" integer,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "images_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "images_user_id_idx" ON "images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "images_status_idx" ON "images" USING btree ("status");--> statement-breakpoint
CREATE INDEX "images_created_at_idx" ON "images" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "images_uuid_idx" ON "images" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "images_favorite_idx" ON "images" USING btree ("is_favorite");--> statement-breakpoint
CREATE INDEX "images_model_idx" ON "images" USING btree ("model");