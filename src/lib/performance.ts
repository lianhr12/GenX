/**
 * Performance monitoring utilities for tracking Core Web Vitals.
 *
 * LCP (Largest Contentful Paint) Target: < 2.5s (good), < 4s (needs improvement)
 * FID (First Input Delay) Target: < 100ms (good), < 300ms (needs improvement)
 * CLS (Cumulative Layout Shift) Target: < 0.1 (good), < 0.25 (needs improvement)
 * FCP (First Contentful Paint) Target: < 1.8s (good), < 3s (needs improvement)
 * TTFB (Time to First Byte) Target: < 800ms (good), < 1800ms (needs improvement)
 */

type MetricName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';

interface Metric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  entries: PerformanceEntry[];
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
}

type ReportHandler = (metric: Metric) => void;

/**
 * Report web vitals to console in development.
 * Useful for debugging performance issues.
 */
export function reportWebVitalsToConsole(metric: Metric) {
  const color = {
    good: '\x1b[32m', // green
    'needs-improvement': '\x1b[33m', // yellow
    poor: '\x1b[31m', // red
  }[metric.rating];

  const reset = '\x1b[0m';

  console.log(
    `${color}[${metric.name}]${reset} ${metric.value.toFixed(2)}ms (${metric.rating})`
  );
}

/**
 * Report web vitals to analytics service.
 * Replace the endpoint with your analytics provider.
 */
export function reportWebVitalsToAnalytics(metric: Metric) {
  // Example: Send to Google Analytics
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = window.gtag as (
      command: string,
      eventName: string,
      eventParams: Record<string, unknown>
    ) => void;

    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value
      ),
      non_interaction: true,
    });
  }

  // Example: Send to custom endpoint
  // fetch('/api/vitals', {
  //   method: 'POST',
  //   body: JSON.stringify(metric),
  //   headers: { 'Content-Type': 'application/json' },
  //   keepalive: true,
  // });
}

/**
 * Initialize web vitals monitoring.
 * Call this in your app's root layout or _app file.
 *
 * @example
 * ```tsx
 * // In layout.tsx or _app.tsx
 * import { initWebVitals } from '@/lib/performance';
 *
 * useEffect(() => {
 *   initWebVitals();
 * }, []);
 * ```
 */
export async function initWebVitals(onReport?: ReportHandler) {
  if (typeof window === 'undefined') return;

  try {
    const { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } = await import(
      'web-vitals'
    );

    const handler: ReportHandler = (metric) => {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        reportWebVitalsToConsole(metric);
      }

      // Report to analytics in production
      if (process.env.NODE_ENV === 'production') {
        reportWebVitalsToAnalytics(metric);
      }

      // Call custom handler if provided
      onReport?.(metric);
    };

    onCLS(handler);
    onFCP(handler);
    onFID(handler);
    onINP(handler);
    onLCP(handler);
    onTTFB(handler);
  } catch (error) {
    console.warn('Failed to load web-vitals:', error);
  }
}

/**
 * Measure a custom performance mark.
 *
 * @example
 * ```tsx
 * measureMark('hero-video-loaded');
 * ```
 */
export function measureMark(name: string) {
  if (typeof window === 'undefined' || !window.performance) return;

  try {
    performance.mark(name);

    // Log duration since navigation start
    const entries = performance.getEntriesByName(name, 'mark');
    if (entries.length > 0) {
      const entry = entries[entries.length - 1];
      console.log(`[Performance] ${name}: ${entry.startTime.toFixed(2)}ms`);
    }
  } catch (error) {
    console.warn(`Failed to measure mark ${name}:`, error);
  }
}

/**
 * Measure time between two marks.
 *
 * @example
 * ```tsx
 * measureMark('video-start');
 * // ... video loads ...
 * measureMark('video-ready');
 * measureBetween('video-load-time', 'video-start', 'video-ready');
 * ```
 */
export function measureBetween(
  name: string,
  startMark: string,
  endMark: string
) {
  if (typeof window === 'undefined' || !window.performance) return;

  try {
    performance.measure(name, startMark, endMark);

    const entries = performance.getEntriesByName(name, 'measure');
    if (entries.length > 0) {
      const entry = entries[entries.length - 1];
      console.log(`[Performance] ${name}: ${entry.duration.toFixed(2)}ms`);
    }
  } catch (error) {
    console.warn(
      `Failed to measure between ${startMark} and ${endMark}:`,
      error
    );
  }
}

/**
 * Get the LCP element and its load time.
 * Useful for debugging LCP issues.
 */
export function getLCPInfo(): Promise<{
  element: Element | null;
  time: number;
} | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      resolve(null);
      return;
    }

    let lcpEntry: PerformanceEntry | null = null;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      lcpEntry = entries[entries.length - 1];
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });

    // Wait a bit then resolve with the latest LCP
    setTimeout(() => {
      observer.disconnect();

      if (lcpEntry) {
        const entry = lcpEntry as PerformanceEntry & {
          element?: Element;
          startTime: number;
        };
        resolve({
          element: entry.element || null,
          time: entry.startTime,
        });
      } else {
        resolve(null);
      }
    }, 5000);
  });
}

/**
 * Debug helper to identify what's causing slow LCP.
 * Call this in development to see LCP breakdown.
 */
export async function debugLCP() {
  const info = await getLCPInfo();

  if (info) {
    console.group('🎯 LCP Debug Info');
    console.log('LCP Time:', `${info.time.toFixed(2)}ms`);
    console.log('LCP Element:', info.element);

    if (info.element) {
      const rect = info.element.getBoundingClientRect();
      console.log('Element Dimensions:', `${rect.width}x${rect.height}`);

      if (info.element instanceof HTMLImageElement) {
        console.log('Image Source:', info.element.src);
        console.log(
          'Natural Size:',
          `${info.element.naturalWidth}x${info.element.naturalHeight}`
        );
      }

      if (info.element instanceof HTMLVideoElement) {
        console.log('Video Source:', info.element.currentSrc);
        console.log(
          'Video Size:',
          `${info.element.videoWidth}x${info.element.videoHeight}`
        );
      }
    }

    console.groupEnd();
  } else {
    console.warn('Could not get LCP info');
  }
}
