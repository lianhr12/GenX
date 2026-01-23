import { HomePageSchemas } from '@/components/seo';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';

// Critical above-the-fold component - static import for LCP optimization
import { HeroSection } from '@/components/landing';

// Import skeleton components for loading states
import {
  ArtStylesSkeleton,
  GallerySkeleton,
  SectionSkeleton,
} from '@/components/landing/skeletons';

// Dynamic imports with SSR for SEO - these sections are below the fold
// PainPoints is close to fold, keep SSR for SEO
const PainPointsSection = dynamic(
  () =>
    import('@/components/landing/pain-points-section').then(
      (m) => m.PainPointsSection
    ),
  { ssr: true }
);

// Art Styles has videos/images, SSR for SEO but lazy load client JS
const ArtStylesSection = dynamic(
  () =>
    import('@/components/landing/art-styles-section').then(
      (m) => m.ArtStylesSection
    ),
  { ssr: true, loading: () => <ArtStylesSkeleton /> }
);

// How It Works - SSR for SEO
const HowItWorksSection = dynamic(
  () =>
    import('@/components/landing/how-it-works-section').then(
      (m) => m.HowItWorksSection
    ),
  { ssr: true }
);

// Gallery has heavy media, SSR for SEO but defer loading
const GallerySection = dynamic(
  () =>
    import('@/components/landing/gallery-section').then(
      (m) => m.GallerySection
    ),
  { ssr: true, loading: () => <GallerySkeleton /> }
);

// Use Cases - SSR for SEO
const UseCasesSection = dynamic(
  () =>
    import('@/components/landing/use-cases-section').then(
      (m) => m.UseCasesSection
    ),
  { ssr: true }
);

// Why GenX - SSR for SEO
const WhyGenXSection = dynamic(
  () =>
    import('@/components/landing/why-genx-section').then(
      (m) => m.WhyGenXSection
    ),
  { ssr: true }
);

// Lower priority sections - can disable SSR for faster initial load
const TestimonialsSection = dynamic(
  () =>
    import('@/components/landing/testimonials-section').then(
      (m) => m.TestimonialsSection
    ),
  { ssr: true, loading: () => <SectionSkeleton /> }
);

// Pricing - SSR for SEO (important for conversions)
const PricingPreviewSection = dynamic(
  () =>
    import('@/components/landing/pricing-preview-section').then(
      (m) => m.PricingPreviewSection
    ),
  { ssr: true }
);

// FAQ - SSR for SEO (important for search)
const FAQSection = dynamic(
  () => import('@/components/landing/faq-section').then((m) => m.FAQSection),
  { ssr: true }
);

// Final CTA - SSR for conversions
const FinalCTASection = dynamic(
  () =>
    import('@/components/landing/final-cta-section').then(
      (m) => m.FinalCTASection
    ),
  { ssr: true }
);

// Crisp Chat - Client Component, import directly (ssr: false not allowed in Server Components)
import CrispChat from '@/components/layout/crisp-chat';

/**
 * https://next-intl.dev/docs/environments/actions-metadata-route-handlers#metadata-api
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    pathname: '',
  });
}

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage(props: HomePageProps) {
  return (
    <>
      {/* JSON-LD Structured Data for Homepage */}
      <HomePageSchemas />

      <div className="flex flex-col">
        {/* Hero - Primary conversion entry */}
        <HeroSection />

        {/* Pain Points + Solution - Build emotional connection */}
        <PainPointsSection />

        {/* 5 Art Styles - Core differentiation */}
        <ArtStylesSection />

        {/* How It Works - Remove tech fear */}
        <HowItWorksSection />

        {/* Creator Gallery - Social proof + inspire creativity */}
        <GallerySection />

        {/* Use Cases - Help users imagine possibilities */}
        <UseCasesSection />

        {/* Why GenX - Trust building */}
        <WhyGenXSection />

        {/* Testimonials - Real user social proof */}
        <TestimonialsSection />

        {/* Pricing Preview - Transparent pricing */}
        <PricingPreviewSection />

        {/* FAQ - Remove concerns + SEO */}
        <FAQSection />

        {/* Final CTA - Conversion closure */}
        <FinalCTASection />

        {/* Chat Support */}
        <CrispChat />
      </div>
    </>
  );
}
