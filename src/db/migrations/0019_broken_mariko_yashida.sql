ALTER TABLE "gallery_items" ADD COLUMN "hide_prompt" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "hide_prompt" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "hide_prompt" boolean DEFAULT false NOT NULL;