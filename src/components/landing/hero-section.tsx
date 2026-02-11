import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { HeroVideoBackground } from './hero-video-background';

// Lazy load the heavy GenXCreator to reduce initial JS bundle
const LazyGenXCreator = dynamic(
  () => import('@/components/generator/GenXCreator').then((m) => m.GenXCreator),
  {
    ssr: true,
    loading: () => (
      <div className="h-[180px] w-full animate-pulse rounded-xl bg-muted/20 backdrop-blur-sm border border-border/30" />
    ),
  }
);

/**
 * HeroSection - Server Component for optimal LCP
 *
 * Key optimizations:
 * 1. Server component: h1/p text rendered in initial HTML without JS dependency
 * 2. No Framer Motion TextEffect: avoids initial opacity:0 that blocks LCP
 * 3. CSS-only animations: transform-based entrance (no opacity delay)
 * 4. GenXCreator lazy loaded: reduces initial JS bundle size
 * 5. Video background as client island: hydrates independently
 */
export async function HeroSection() {
  const t = await getTranslations('Landing.hero');

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Video Background - Client Component (hydrates independently) */}
      <HeroVideoBackground />

      {/* Content - Server Rendered for instant LCP */}
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 py-20">
        <div className="mx-auto w-full max-w-5xl text-center">
          {/* Headline - immediately visible in SSR HTML, CSS-only animation */}
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl animate-hero-enter">
            {t('headline')}
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-4 max-w-3xl text-balance text-base text-muted-foreground sm:mt-6 sm:text-lg md:text-xl lg:text-2xl animate-hero-enter-delay-1">
            {t('subheadline')}
          </p>

          {/* GenXCreator - Lazy loaded for reduced initial JS */}
          <div className="mt-6 w-full max-w-4xl mx-auto sm:mt-10 animate-hero-enter-delay-2">
            <LazyGenXCreator compact enableNavigation showCredits />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs uppercase tracking-widest">
            {t('scrollHint')}
          </span>
          <div className="h-8 w-5 rounded-full border-2 border-muted-foreground/30 p-1">
            <div className="h-2 w-1.5 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}
