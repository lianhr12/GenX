/**
 * Hero section skeleton for initial page load.
 * Provides visual placeholder while the hero content loads.
 */
export function HeroSkeleton() {
  return (
    <section className="relative min-h-screen animate-pulse overflow-hidden">
      {/* Background placeholder */}
      <div className="absolute inset-0 bg-muted" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      {/* Content placeholder */}
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-5xl text-center">
          {/* Headline skeleton */}
          <div className="mx-auto h-16 w-[600px] max-w-full rounded-lg bg-muted-foreground/20" />
          
          {/* Subheadline skeleton */}
          <div className="mx-auto mt-6 h-8 w-[500px] max-w-full rounded bg-muted-foreground/10" />
          <div className="mx-auto mt-2 h-6 w-[400px] max-w-full rounded bg-muted-foreground/10" />

          {/* CTA buttons skeleton */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="h-12 w-40 rounded-xl bg-muted-foreground/20" />
            <div className="h-12 w-40 rounded-xl bg-muted-foreground/10" />
          </div>

          {/* Social proof badge skeleton */}
          <div className="mx-auto mt-10 h-10 w-48 rounded-full bg-muted-foreground/10" />

          {/* Video indicators skeleton */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full bg-muted-foreground/20 ${i === 0 ? 'w-8' : 'w-2'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator skeleton */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-20 rounded bg-muted-foreground/10" />
          <div className="h-8 w-5 rounded-full border-2 border-muted-foreground/20" />
        </div>
      </div>
    </section>
  );
}
