CREATE TABLE "gallery_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"gallery_item_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gallery_favorites" ADD CONSTRAINT "gallery_favorites_gallery_item_id_gallery_items_id_fk" FOREIGN KEY ("gallery_item_id") REFERENCES "public"."gallery_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_favorites" ADD CONSTRAINT "gallery_favorites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gallery_favorites_unique_idx" ON "gallery_favorites" USING btree ("gallery_item_id","user_id");--> statement-breakpoint
CREATE INDEX "gallery_favorites_gallery_item_id_idx" ON "gallery_favorites" USING btree ("gallery_item_id");--> statement-breakpoint
CREATE INDEX "gallery_favorites_user_id_idx" ON "gallery_favorites" USING btree ("user_id");