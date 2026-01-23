import type { MetadataRoute } from 'next';
import { getBaseUrl } from '../lib/urls/urls';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/*', // API routes
        '/_next/*', // Next.js internal routes
        '/settings/*', // User settings
        '/dashboard/*', // User dashboard
        '/auth/*', // Authentication pages (login, register, etc.)
        '/admin/*', // Admin panel
        '/payment/*', // Payment processing
      ],
    },
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
