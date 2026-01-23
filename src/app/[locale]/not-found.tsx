import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import {
  BookOpen,
  Home,
  ImageIcon,
  Mail,
  Search,
  Video,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

// Popular links to help users find what they're looking for
const popularLinks = [
  {
    icon: Video,
    labelKey: 'links.imageToVideo',
    href: '/create/image-to-video',
  },
  {
    icon: ImageIcon,
    labelKey: 'links.gallery',
    href: '/gallery',
  },
  {
    icon: BookOpen,
    labelKey: 'links.docs',
    href: '/docs',
  },
  {
    icon: Mail,
    labelKey: 'links.contact',
    href: '/contact',
  },
];

/**
 * Note that `app/[locale]/[...rest]/page.tsx`
 * is necessary for this page to render.
 *
 * https://next-intl.dev/docs/environments/error-files#not-foundjs
 * https://next-intl.dev/docs/environments/error-files#catching-non-localized-requests
 */
export default function NotFound() {
  const t = useTranslations('NotFoundPage');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        {/* Logo */}
        <Logo className="mx-auto size-16 mb-8" />

        {/* Error Code */}
        <h1 className="text-8xl font-bold text-primary/20 mb-4">{t('title')}</h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold mb-4">{t('headline')}</h2>
        <p className="text-muted-foreground text-lg mb-8">{t('message')}</p>

        {/* Primary Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button asChild size="lg" className="cursor-pointer gap-2">
            <LocaleLink href="/">
              <Home className="size-4" />
              {t('backToHome')}
            </LocaleLink>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="cursor-pointer gap-2"
          >
            <LocaleLink href="/help">
              <Search className="size-4" />
              {t('searchHelp')}
            </LocaleLink>
          </Button>
        </div>

        {/* Popular Links */}
        <div className="border-t pt-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            {t('popularPages')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {popularLinks.map((link) => (
              <LocaleLink
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <link.icon className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {t(link.labelKey as never)}
                </span>
              </LocaleLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
