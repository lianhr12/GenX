/**
 * Gallery Data Migration Script
 *
 * This script migrates the hardcoded gallery data to the database.
 * Run with: npx tsx scripts/migrate-gallery-data.ts
 *
 * Prerequisites:
 * 1. Run database migrations first: pnpm db:migrate
 * 2. Ensure DATABASE_URL is set in environment
 */

import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { nanoid } from 'nanoid';
import postgres from 'postgres';
import * as schema from '../src/db/schema';

dotenv.config();

// Gallery items to migrate (from the original hardcoded data)
const galleryItemsToMigrate = [
  {
    style: 'cyberpunk',
    thumbnail: 'https://asset.genx.art/home/video/1769843282311_1.png',
    video: 'https://asset.genx.art/home/video/1769843282311.mp4',
    likes: 234,
    views: 1250,
    prompt:
      'A neon-lit city street at night, rain falling through holographic advertisements',
  },
  {
    style: 'watercolor',
    thumbnail: 'https://asset.genx.art/home/video/1769843896197_1.png',
    video: 'https://asset.genx.art/home/video/1769843896197.mp4',
    likes: 189,
    views: 980,
    prompt: 'A serene mountain lake at sunset with soft watercolor effects',
  },
  {
    style: 'oilPainting',
    thumbnail: 'https://asset.genx.art/home/video/1769844345249_1.png',
    video: 'https://asset.genx.art/home/video/1769844345249.mp4',
    likes: 312,
    views: 1560,
    prompt:
      'A classic portrait in the style of Rembrandt with warm golden lighting',
  },
  {
    style: 'anime',
    thumbnail: 'https://asset.genx.art/home/video/1769844684310_1.png',
    video: 'https://asset.genx.art/home/video/1769844684310.mp4',
    likes: 456,
    views: 2340,
    prompt: 'Cherry blossom petals falling in a Japanese garden, anime style',
  },
  {
    style: 'fluidArt',
    thumbnail: 'https://asset.genx.art/home/video/1769845221638_1.png',
    video: 'https://asset.genx.art/home/video/1769845221638.mp4',
    likes: 278,
    views: 1120,
    prompt: 'Abstract colors swirling like liquid marble, mesmerizing flow',
  },
  {
    style: 'cyberpunk',
    thumbnail: 'https://asset.genx.art/home/video/769845597940_1.png',
    video: 'https://asset.genx.art/home/video/1769845597940.mp4',
    likes: 345,
    views: 1780,
    prompt:
      'Flying cars passing through a futuristic cityscape with glitch effects',
  },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🚀 Starting gallery data migration...\n');

  const client = postgres(databaseUrl);
  const db = drizzle(client, { schema });

  try {
    // Check if gallery_items table exists and has data
    const existingItems = await db.select().from(schema.galleryItems).limit(1);

    if (existingItems.length > 0) {
      console.log('⚠️  Gallery items already exist in the database.');
      console.log('   Skipping migration to avoid duplicates.');
      console.log(
        '   If you want to re-run, please clear the gallery_items table first.\n'
      );
      await client.end();
      return;
    }

    console.log(
      `📦 Migrating ${galleryItemsToMigrate.length} gallery items...\n`
    );

    // Insert gallery items
    for (let i = 0; i < galleryItemsToMigrate.length; i++) {
      const item = galleryItemsToMigrate[i];

      const [inserted] = await db
        .insert(schema.galleryItems)
        .values({
          uuid: nanoid(),
          videoUrl: item.video,
          thumbnailUrl: item.thumbnail,
          prompt: item.prompt,
          artStyle: item.style,
          creatorName: 'GenX Team',
          likesCount: item.likes,
          viewsCount: item.views,
          sourceType: schema.GallerySourceType.OFFICIAL,
          status: schema.GalleryStatus.APPROVED,
          isFeatured: true,
          sortWeight: galleryItemsToMigrate.length - i, // Higher weight for earlier items
        })
        .returning();

      console.log(
        `   ✅ Inserted: ${item.style} - ${item.prompt.substring(0, 50)}...`
      );
    }

    console.log('\n✨ Migration completed successfully!');
    console.log(`   Total items migrated: ${galleryItemsToMigrate.length}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Verify data in Drizzle Studio: pnpm db:studio');
    console.log('   2. Test the gallery page in your app');
    console.log('   3. Add more items via the admin panel\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
