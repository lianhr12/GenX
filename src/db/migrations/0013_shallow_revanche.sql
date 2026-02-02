ALTER TABLE "gallery_items" ALTER COLUMN "video_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD COLUMN "media_type" text DEFAULT 'video' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD COLUMN "image_id" integer;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD COLUMN "image_urls" jsonb;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "is_public" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "is_public" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gallery_items_media_type_idx" ON "gallery_items" USING btree ("media_type");--> statement-breakpoint
CREATE INDEX "images_is_public_idx" ON "images" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "videos_is_public_idx" ON "videos" USING btree ("is_public");