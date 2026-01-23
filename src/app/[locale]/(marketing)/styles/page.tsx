import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { constructMetadata } from '@/lib/metadata';
import { ArrowRightIcon, PaletteIcon, PlayCircleIcon } from 'lucide-react';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: 'Art Styles - 5 Unique Styles | ' + t('title'),
    description:
      'Explore our 5 unique art styles: Cyberpunk, Watercolor, Oil Painting, Anime, and Fluid Art. Each style is carefully tuned to make your work stand out.',
    locale,
    pathname: '/styles',
  });
}

// Style data - this could be moved to a config file
const styles = [
  {
    id: 'cyberpunk',
    gradient: 'from-purple-600 via-pink-500 to-cyan-400',
    bgColor: 'bg-purple-950',
    previewImage: '/images/styles/cyberpunk-preview.jpg',
  },
  {
    id: 'watercolor',
    gradient: 'from-blue-400 via-teal-300 to-emerald-400',
    bgColor: 'bg-blue-950',
    previewImage: '/images/styles/watercolor-preview.jpg',
  },
  {
    id: 'oil-painting',
    gradient: 'from-amber-600 via-orange-500 to-yellow-400',
    bgColor: 'bg-amber-950',
    previewImage: '/images/styles/oil-painting-preview.jpg',
  },
  {
    id: 'anime',
    gradient: 'from-pink-500 via-rose-400 to-red-400',
    bgColor: 'bg-pink-950',
    previewImage: '/images/styles/anime-preview.jpg',
  },
  {
    id: 'fluid-art',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    bgColor: 'bg-indigo-950',
    previewImage: '/images/styles/fluid-art-preview.jpg',
  },
];

export default async function StylesPage() {
  const t = await getTranslations('StylesPage');

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <PaletteIcon className="size-4" />
          {t('badge')}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      {/* Styles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {styles.map((style) => (
          <LocaleLink
            key={style.id}
            href={`/styles/${style.id}`}
            className="group relative overflow-hidden rounded-2xl border bg-card aspect-[4/5] transition-all duration-300 hover:shadow-xl hover:border-primary/50"
          >
            {/* Gradient Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
            />

            {/* Preview Image Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-full h-full ${style.bgColor} flex items-center justify-center`}
              >
                <PlayCircleIcon className="size-16 text-white/50 group-hover:text-white/80 transition-colors" />
              </div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t(`styles.${style.id}.title`)}
              </h2>
              <p className="text-white/80 text-sm mb-4 line-clamp-2">
                {t(`styles.${style.id}.description`)}
              </p>
              <div className="flex items-center gap-2 text-white/60 text-sm group-hover:text-white transition-colors">
                <span>{t('viewStyle')}</span>
                <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </LocaleLink>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-muted/50 border">
          <div className="text-center sm:text-left">
            <h3 className="font-semibold mb-1">{t('cta.title')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('cta.description')}
            </p>
          </div>
          <Button asChild size="lg" className="whitespace-nowrap">
            <LocaleLink href="/create/image-to-video">
              {t('cta.button')}
            </LocaleLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
