'use client';

import { useTranslations } from 'next-intl';
import { FAQSchema, VideoSchema, WebsiteSchema } from './json-ld';
import type { FAQItem } from './json-ld/types';

const faqItemIds = [
  'free',
  'skills',
  'commercial',
  'watermark',
  'formats',
  'time',
  'data',
  'payment',
  'refund',
  'cancel',
];

// Hero section video demo samples for VideoObject Schema
const heroVideos = [
  {
    name: 'Cyberpunk Art Style Video Demo',
    description:
      'AI-generated cyberpunk art style video demonstration - Transform your photos into futuristic neon-lit scenes with GenX.art',
    thumbnailUrl: '/images/demo/cyberpunk-poster.jpg',
    contentUrl: '/videos/demo/cyberpunk.mp4',
    duration: 'PT10S',
  },
  {
    name: 'Watercolor Art Style Video Demo',
    description:
      'AI-generated watercolor art style video demonstration - Create beautiful flowing watercolor animations from any image',
    thumbnailUrl: '/images/demo/watercolor-poster.jpg',
    contentUrl: '/videos/demo/watercolor.mp4',
    duration: 'PT10S',
  },
  {
    name: 'Oil Painting Art Style Video Demo',
    description:
      'AI-generated oil painting art style video demonstration - Transform photos into rich, textured oil painting animations',
    thumbnailUrl: '/images/demo/oil-painting-poster.jpg',
    contentUrl: '/videos/demo/oil-painting.mp4',
    duration: 'PT10S',
  },
  {
    name: 'Anime Art Style Video Demo',
    description:
      'AI-generated anime art style video demonstration - Convert any image into stunning anime-style animations',
    thumbnailUrl: '/images/demo/anime-poster.jpg',
    contentUrl: '/videos/demo/anime.mp4',
    duration: 'PT10S',
  },
  {
    name: 'Fluid Art Style Video Demo',
    description:
      'AI-generated fluid art style video demonstration - Create mesmerizing liquid art animations from your photos',
    thumbnailUrl: '/images/demo/fluid-art-poster.jpg',
    contentUrl: '/videos/demo/fluid-art.mp4',
    duration: 'PT10S',
  },
];

/**
 * HomePage Structured Data Schemas
 *
 * Includes WebsiteSchema, FAQSchema, and VideoSchema for the homepage
 * This is a client component to access translations via useTranslations
 */
export function HomePageSchemas() {
  const t = useTranslations('Landing.faq.items');

  // Build FAQ items from translations
  const faqItems: FAQItem[] = faqItemIds.map((id) => ({
    question: t(`${id}.question` as never),
    answer: t(`${id}.answer` as never),
  }));

  return (
    <>
      <WebsiteSchema />
      <FAQSchema items={faqItems} />
      {/* VideoObject Schema for Hero demo videos */}
      {heroVideos.map((video) => (
        <VideoSchema
          key={video.name}
          name={video.name}
          description={video.description}
          thumbnailUrl={video.thumbnailUrl}
          contentUrl={video.contentUrl}
          duration={video.duration}
          uploadDate="2024-01-01"
        />
      ))}
    </>
  );
}
