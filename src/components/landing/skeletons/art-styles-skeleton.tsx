/**
 * Art Styles section skeleton for loading state.
 * Shows placeholder cards while style videos/images load.
 */
export function ArtStylesSkeleton() {
  return (
    <section className="relative animate-pulse py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header skeleton */}
        <div className="text-center">
          {/* Badge */}
          <div className="mx-auto h-6 w-32 rounded-full bg-muted" />
          {/* Headline */}
          <div className="mx-auto mt-4 h-10 w-72 max-w-full rounded bg-muted" />
          {/* Subheadline */}
          <div className="mx-auto mt-4 h-6 w-96 max-w-full rounded bg-muted/70" />
        </div>

        {/* Styles Grid skeleton */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border bg-background"
            >
              {/* Video/Image placeholder */}
              <div className="aspect-video bg-muted">
                {/* Style badge placeholder */}
                <div className="m-4 h-7 w-24 rounded-full bg-muted-foreground/10" />
              </div>

              {/* Content placeholder */}
              <div className="p-5">
                {/* Title */}
                <div className="h-6 w-24 rounded bg-muted" />
                {/* Description */}
                <div className="mt-2 h-4 w-full rounded bg-muted/70" />
                <div className="mt-1 h-4 w-3/4 rounded bg-muted/70" />
                {/* Best for */}
                <div className="mt-2 h-3 w-20 rounded bg-muted/50" />
                {/* CTA button placeholder */}
                <div className="mt-4 h-9 w-full rounded bg-muted/30" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA skeleton */}
        <div className="mt-12 flex justify-center">
          <div className="h-12 w-40 rounded-xl bg-muted" />
        </div>
      </div>
    </section>
  );
}
