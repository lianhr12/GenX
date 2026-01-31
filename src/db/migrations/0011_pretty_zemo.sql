CREATE TABLE "gallery_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" text NOT NULL,
	"video_id" integer,
	"video_url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"prompt" text NOT NULL,
	"art_style" text NOT NULL,
	"creator_id" text,
	"creator_name" text,
	"creator_avatar" text,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"source_type" text DEFAULT 'official' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_weight" integer DEFAULT 0 NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"reject_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_items_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "gallery_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"gallery_item_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_likes" ADD CONSTRAINT "gallery_likes_gallery_item_id_gallery_items_id_fk" FOREIGN KEY ("gallery_item_id") REFERENCES "public"."gallery_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_likes" ADD CONSTRAINT "gallery_likes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gallery_items_uuid_idx" ON "gallery_items" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "gallery_items_status_idx" ON "gallery_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gallery_items_art_style_idx" ON "gallery_items" USING btree ("art_style");--> statement-breakpoint
CREATE INDEX "gallery_items_is_featured_idx" ON "gallery_items" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "gallery_items_creator_id_idx" ON "gallery_items" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "gallery_items_sort_weight_idx" ON "gallery_items" USING btree ("sort_weight");--> statement-breakpoint
CREATE INDEX "gallery_items_created_at_idx" ON "gallery_items" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "gallery_likes_unique_idx" ON "gallery_likes" USING btree ("gallery_item_id","user_id");--> statement-breakpoint
CREATE INDEX "gallery_likes_gallery_item_id_idx" ON "gallery_likes" USING btree ("gallery_item_id");--> statement-breakpoint
CREATE INDEX "gallery_likes_user_id_idx" ON "gallery_likes" USING btree ("user_id");