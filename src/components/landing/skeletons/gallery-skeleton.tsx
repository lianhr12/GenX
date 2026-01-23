/**
 * Gallery section skeleton for loading state.
 * Shows placeholder grid while gallery images/videos load.
 */
export function GallerySkeleton() {
  return (
    <section className="relative animate-pulse py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header skeleton */}
        <div className="text-center">
          {/* Badge */}
          <div className="mx-auto h-6 w-28 rounded-full bg-muted" />
          {/* Headline */}
          <div className="mx-auto mt-4 h-10 w-80 max-w-full rounded bg-muted" />
          {/* Subheadline */}
          <div className="mx-auto mt-4 h-6 w-96 max-w-full rounded bg-muted/70" />
        </div>

        {/* Filters skeleton */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-10 rounded-full bg-muted ${i === 0 ? 'w-16' : 'w-24'}`}
            />
          ))}
        </div>

        {/* Gallery Grid skeleton */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video overflow-hidden rounded-xl border bg-muted"
            >
              {/* Play button placeholder */}
              <div className="flex h-full items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-muted-foreground/10" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons skeleton */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <div className="h-12 w-32 rounded-xl bg-muted" />
          <div className="h-12 w-40 rounded-xl bg-muted" />
        </div>
      </div>
    </section>
  );
}
