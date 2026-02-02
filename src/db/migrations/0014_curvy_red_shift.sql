CREATE INDEX "gallery_items_video_id_idx" ON "gallery_items" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "gallery_items_image_id_idx" ON "gallery_items" USING btree ("image_id");