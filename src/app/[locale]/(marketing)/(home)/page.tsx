import {
  HeroSection,
  PainPointsSection,
  ArtStylesSection,
  HowItWorksSection,
  GallerySection,
  UseCasesSection,
  WhyGenXSection,
  TestimonialsSection,
  PricingPreviewSection,
  FAQSection,
  FinalCTASection,
} from '@/components/landing';
import CrispChat from '@/components/layout/crisp-chat';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

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
