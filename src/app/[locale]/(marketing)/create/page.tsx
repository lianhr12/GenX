import { constructMetadata } from '@/lib/metadata';
import Container from '@/components/layout/container';
import { LocaleLink } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  FilmIcon,
  ImageIcon,
  SparklesIcon,
  VideoIcon,
  ArrowRightIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: 'Create - AI Art Tools | ' + t('title'),
    description:
      'Transform your photos into stunning art videos. Choose from Image to Video, Text to Video, and more AI-powered creation tools.',
    locale,
    pathname: '/create',
  });
}

const tools = [
  {
    id: 'image-to-video',
    href: '/create/image-to-video',
    icon: FilmIcon,
    gradient: 'from-purple-500 to-pink-500',
    featured: true,
  },
  {
    id: 'text-to-video',
    href: '/create/text-to-video',
    icon: VideoIcon,
    gradient: 'from-blue-500 to-cyan-500',
    featured: false,
  },
  {
    id: 'reference-to-video',
    href: '/create/reference-to-video',
    icon: SparklesIcon,
    gradient: 'from-orange-500 to-yellow-500',
    featured: false,
  },
  {
    id: 'image',
    href: '/create/image',
    icon: ImageIcon,
    gradient: 'from-green-500 to-emerald-500',
    featured: false,
  },
];

export default async function CreatePage() {
  const t = await getTranslations('CreatePage');

  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <SparklesIcon className="size-4" />
            {t('badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <LocaleLink
                key={tool.id}
                href={tool.href}
                className={`group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:border-primary/50 ${
                  tool.featured ? 'md:col-span-2' : ''
                }`}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}
                  >
                    <Icon className="size-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-semibold">
                        {t(`tools.${tool.id}.title`)}
                      </h2>
                      {tool.featured && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                          {t('popular')}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-lg">
                      {t(`tools.${tool.id}.description`)}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      <ArrowRightIcon className="size-5" />
                    </Button>
                  </div>
                </div>

                {/* Features for featured tool */}
                {tool.featured && (
                  <div className="relative mt-6 pt-6 border-t flex flex-wrap gap-4">
                    {['feature1', 'feature2', 'feature3', 'feature4'].map(
                      (feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {t(`tools.${tool.id}.${feature}`)}
                        </div>
                      )
                    )}
                  </div>
                )}
              </LocaleLink>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">{t('bottomText')}</p>
          <Button asChild size="lg">
            <LocaleLink href="/styles">{t('exploreStyles')}</LocaleLink>
          </Button>
        </div>
      </div>
    </Container>
  );
}
