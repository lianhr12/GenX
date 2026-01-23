import type { routing } from '@/i18n/routing';
import type messages from './messages/en.json';

/**
 * Recursive type to allow nested message access with dynamic keys
 */
type NestedMessages = {
  [key: string]: string | NestedMessages;
};

/**
 * Combined Messages type that supports both static type checking
 * and dynamic key access for runtime-generated keys
 */
type Messages = typeof messages & NestedMessages;

/**
 * next-intl 4.0.0
 *
 * https://github.com/amannn/next-intl/blob/main/examples/example-app-router/global.d.ts
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: Messages;
  }
}
