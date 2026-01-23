import { constructMetadata } from '@/lib/metadata';
import { LocaleLink } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftIcon,
  SparklesIcon,
  PlayCircleIcon,
  CheckCircleIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Valid style slugs
const validStyles = [
  'cyberpunk',
  'watercolor',
  'oil-painting',
  'anime',
  'fluid-art',
] as const;

type StyleSlug = (typeof validStyles)[number];

// Style configurations
const styleConfigs: Record<
  StyleSlug,
  {
    gradient: string;
    bgColor: string;
    seoKeywords: string[];
  }
> = {
  cyberpunk: {
    gradient: 'from-purple-600 via-pink-500 to-cyan-400',
    bgColor: 'bg-purple-950',
    seoKeywords: [
      'cyberpunk video',
      'neon art',
      'futuristic video',
      'sci-fi video generator',
    ],
  },
  watercolor: {
    gradient: 'from-blue-400 via-teal-300 to-emerald-400',
    bgColor: 'bg-blue-950',
    seoKeywords: [
      'watercolor video',
      'painting animation',
      'artistic video',
      'watercolor effect',
    ],
  },
  'oil-painting': {
    gradient: 'from-amber-600 via-orange-500 to-yellow-400',
    bgColor: 'bg-amber-950',
    seoKeywords: [
      'oil painting video',
      'classic art video',
      'renaissance style',
      'painting animation',
    ],
  },
  anime: {
    gradient: 'from-pink-500 via-rose-400 to-red-400',
    bgColor: 'bg-pink-950',
    seoKeywords: [
      'anime video',
      'anime style generator',
      'japanese animation',
      'manga video',
    ],
  },
  'fluid-art': {
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    bgColor: 'bg-indigo-950',
    seoKeywords: [
      'fluid art video',
      'abstract video',
      'color flow animation',
      'psychedelic video',
    ],
  },
};

export async function generateStaticParams() {
  return validStyles.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata | undefined> {
  const { locale, slug } = await params;

  if (!validStyles.includes(slug as StyleSlug)) {
    return;
  }

  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const st = await getTranslations({ locale, namespace: 'StylesPage' });

  const styleTitle = st(`styles.${slug}.title`);
  const styleDesc = st(`styles.${slug}.description`);

  return constructMetadata({
    title: `${styleTitle} Style - AI Art Video | ${t('title')}`,
    description: `Create stunning ${styleTitle} art videos. ${styleDesc}`,
    locale,
    pathname: `/styles/${slug}`,
    keywords: styleConfigs[slug as StyleSlug]?.seoKeywords,
  });
}

export default async function StyleDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { slug } = await params;

  // Validate slug
  if (!validStyles.includes(slug as StyleSlug)) {
    notFound();
  }

  const t = await getTranslations('StylesPage');
  const config = styleConfigs[slug as StyleSlug];

  return (
    <div>
      {/* Back Button */}
      <LocaleLink
        href="/styles"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeftIcon className="size-4" />
        {t('backToStyles')}
      </LocaleLink>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Left: Content */}
        <div className="flex flex-col justify-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.gradient} text-white text-sm font-medium mb-6 w-fit`}
          >
            <SparklesIcon className="size-4" />
            {t(`styles.${slug}.title`)}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {t(`styles.${slug}.headline`)}
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            {t(`styles.${slug}.longDescription`)}
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {['bestFor', 'mood', 'technique'].map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <CheckCircleIcon className="size-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">{t(`features.${feature}`)}: </span>
                  <span className="text-muted-foreground">
                    {t(`styles.${slug}.${feature}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="gap-2">
              <LocaleLink href={`/create/image-to-video?style=${slug}`}>
                <SparklesIcon className="size-4" />
                {t('createWithStyle')}
              </LocaleLink>
            </Button>
            <Button asChild variant="outline" size="lg">
              <LocaleLink href="/gallery">{t('viewExamples')}</LocaleLink>
            </Button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="relative">
          <div
            className={`aspect-video rounded-2xl overflow-hidden ${config.bgColor} flex items-center justify-center border`}
          >
            {/* Video Preview Placeholder */}
            <div className="text-center">
              <PlayCircleIcon className="size-20 text-white/50 mx-auto mb-4" />
              <p className="text-white/60 text-sm">{t('previewComingSoon')}</p>
            </div>

            {/* Gradient Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20`}
            />
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="border-t pt-16">
        <h2 className="text-2xl font-bold mb-8">{t('useCasesTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['useCase1', 'useCase2', 'useCase3'].map((useCase) => (
            <div
              key={useCase}
              className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold mb-2">
                {t(`styles.${slug}.${useCase}.title`)}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t(`styles.${slug}.${useCase}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Other Styles */}
      <div className="border-t pt-16 mt-16">
        <h2 className="text-2xl font-bold mb-8">{t('otherStyles')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {validStyles
            .filter((s) => s !== slug)
            .map((otherSlug) => {
              const otherConfig = styleConfigs[otherSlug];
              return (
                <LocaleLink
                  key={otherSlug}
                  href={`/styles/${otherSlug}`}
                  className="group p-4 rounded-xl border bg-card hover:border-primary/50 transition-all"
                >
                  <div
                    className={`w-full aspect-video rounded-lg ${otherConfig.bgColor} mb-3 group-hover:opacity-80 transition-opacity`}
                  />
                  <h3 className="font-medium text-sm">
                    {t(`styles.${otherSlug}.title`)}
                  </h3>
                </LocaleLink>
              );
            })}
        </div>
      </div>
    </div>
  );
}
