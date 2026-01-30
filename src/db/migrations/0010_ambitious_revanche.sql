ALTER TABLE "videos" ADD COLUMN "is_favorite" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "videos_favorite_idx" ON "videos" USING btree ("is_favorite");