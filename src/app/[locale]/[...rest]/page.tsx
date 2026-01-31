import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/**
 * 404 pages should not be indexed by search engines
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Catching unknown routes
 *
 * all requests that are matched within the [locale] segment will render
 * the not-found page when an unknown route is encountered (e.g. /en/unknown).
 *
 * https://next-intl.dev/docs/environments/error-files#catching-unknown-routes
 */
export default function CatchAllPage() {
  notFound();
}
