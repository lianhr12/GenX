'use client';

import { Button } from '@/components/ui/button';
import {
  artStylesUI,
  getStyleBySlug,
  validStyleSlugs,
} from '@/config/art-styles-ui';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ArrowLeftIcon, CheckCircleIcon, SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { useRef, useState } from 'react';

export default function StyleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations('StylesPage');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Validate slug
  if (!validStyleSlugs.includes(slug)) {
    notFound();
  }

  const style = getStyleBySlug(slug);
  if (!style) {
    notFound();
  }

  const Icon = style.icon;

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

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
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium mb-6 w-fit bg-gradient-to-r',
              style.gradient
            )}
          >
            <SparklesIcon className="size-4" />
            {t(`styles.${slug}.title` as never)}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {t(`styles.${slug}.headline` as never)}
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            {t(`styles.${slug}.longDescription` as never)}
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {['bestFor', 'mood', 'technique'].map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <CheckCircleIcon className="size-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">
                    {t(`features.${feature}` as never)}:{' '}
                  </span>
                  <span className="text-muted-foreground">
                    {t(`styles.${slug}.${feature}` as never)}
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
            className={cn(
              'aspect-video rounded-2xl overflow-hidden border cursor-pointer relative group',
              style.borderColor
            )}
            onClick={handleVideoToggle}
          >
            {/* Poster Image */}
            <div
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                isPlaying ? 'opacity-0' : 'opacity-100'
              )}
            >
              <Image
                src={style.poster}
                alt={t(`styles.${slug}.title` as never)}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
                unoptimized={true}
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm',
                    style.bgColor
                  )}
                >
                  <Icon className={cn('size-8', style.iconColor)} />
                </div>
              </div>
            </div>

            {/* Video */}
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="none"
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
                isPlaying ? 'opacity-100' : 'opacity-0'
              )}
            >
              <source
                src={style.video.replace('.mp4', '.webm')}
                type="video/webm"
              />
              <source src={style.video} type="video/mp4" />
            </video>

            {/* Gradient Overlay */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-10 pointer-events-none',
                style.gradient
              )}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-3">
            {t('clickToPlay')}
          </p>
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
                {t(`styles.${slug}.${useCase}.title` as never)}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t(`styles.${slug}.${useCase}.description` as never)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Other Styles */}
      <div className="border-t pt-16 mt-16">
        <h2 className="text-2xl font-bold mb-8">{t('otherStyles')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {artStylesUI
            .filter((s) => s.slug !== slug)
            .map((otherStyle) => {
              const OtherIcon = otherStyle.icon;
              return (
                <LocaleLink
                  key={otherStyle.slug}
                  href={`/styles/${otherStyle.slug}`}
                  className={cn(
                    'group p-4 rounded-xl border bg-card transition-all',
                    otherStyle.borderColor,
                    otherStyle.hoverBorderColor
                  )}
                >
                  <div className="w-full aspect-video rounded-lg overflow-hidden mb-3 relative">
                    <Image
                      src={otherStyle.poster}
                      alt={t(`styles.${otherStyle.slug}.title` as never)}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized={true}
                    />
                    <div
                      className={cn(
                        'absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30'
                      )}
                    >
                      <OtherIcon
                        className={cn('size-8', otherStyle.iconColor)}
                      />
                    </div>
                  </div>
                  <h3 className="font-medium text-sm">
                    {t(`styles.${otherStyle.slug}.title` as never)}
                  </h3>
                </LocaleLink>
              );
            })}
        </div>
      </div>
    </div>
  );
}
