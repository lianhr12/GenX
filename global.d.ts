import type { routing } from '@/i18n/routing';
import type messages from './messages/en.json';

/**
 * next-intl 4.0.0
 *
 * Note: For dynamic translation keys like `items.${id}.title`, use type assertion:
 * t(`items.${id}.title` as never)
 *
 * https://github.com/amannn/next-intl/blob/main/examples/example-app-router/global.d.ts
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
