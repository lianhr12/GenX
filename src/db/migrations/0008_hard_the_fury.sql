CREATE TABLE "credit_holds" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"video_uuid" text NOT NULL,
	"credits" integer NOT NULL,
	"status" text DEFAULT 'HOLDING' NOT NULL,
	"package_allocation" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"settled_at" timestamp,
	CONSTRAINT "credit_holds_video_uuid_unique" UNIQUE("video_uuid")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" text NOT NULL,
	"user_id" text NOT NULL,
	"prompt" text NOT NULL,
	"model" text NOT NULL,
	"parameters" jsonb,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"provider" text,
	"external_task_id" text,
	"error_message" text,
	"start_image_url" text,
	"original_video_url" text,
	"video_url" text,
	"thumbnail_url" text,
	"duration" integer,
	"resolution" text,
	"aspect_ratio" text,
	"file_size" integer,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"generation_time" integer,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "videos_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "credit_holds" ADD CONSTRAINT "credit_holds_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_holds_user_id_idx" ON "credit_holds" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_holds_status_idx" ON "credit_holds" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_holds_video_uuid_idx" ON "credit_holds" USING btree ("video_uuid");--> statement-breakpoint
CREATE INDEX "videos_user_id_idx" ON "videos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "videos_status_idx" ON "videos" USING btree ("status");--> statement-breakpoint
CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "videos_uuid_idx" ON "videos" USING btree ("uuid");