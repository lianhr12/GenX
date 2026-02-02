ALTER TABLE "credit_holds" ALTER COLUMN "video_uuid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_holds" ADD COLUMN "media_uuid" text;--> statement-breakpoint
ALTER TABLE "credit_holds" ADD COLUMN "media_type" text;--> statement-breakpoint
CREATE UNIQUE INDEX "credit_holds_media_uuid_idx" ON "credit_holds" USING btree ("media_uuid");--> statement-breakpoint
ALTER TABLE "credit_holds" ADD CONSTRAINT "credit_holds_media_uuid_unique" UNIQUE("media_uuid");