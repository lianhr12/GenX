import { cn } from '@/lib/utils';

interface SectionSkeletonProps {
  /**
   * Height of the skeleton section
   * @default 'h-96'
   */
  height?: string;
  /**
   * Whether to show background color
   * @default true
   */
  showBackground?: boolean;
  /**
   * Additional className
   */
  className?: string;
}

/**
 * Generic section skeleton for landing page sections.
 * Used as loading placeholder for dynamically imported components.
 */
export function SectionSkeleton({
  height = 'h-96',
  showBackground = true,
  className,
}: SectionSkeletonProps) {
  return (
    <div
      className={cn(
        height,
        'animate-pulse',
        showBackground && 'bg-muted/30',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge skeleton */}
          <div className="mx-auto h-6 w-24 rounded-full bg-muted" />
          {/* Headline skeleton */}
          <div className="mx-auto mt-4 h-10 w-96 max-w-full rounded bg-muted" />
          {/* Subheadline skeleton */}
          <div className="mx-auto mt-4 h-6 w-80 max-w-full rounded bg-muted/70" />
        </div>
      </div>
    </div>
  );
}
