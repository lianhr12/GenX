import { constructMetadata } from '@/lib/metadata';
import Container from '@/components/layout/container';
import { LocaleLink } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  CodeIcon,
  KeyIcon,
  ZapIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  CopyIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: 'API Documentation | ' + t('title'),
    description:
      'Integrate GenX.art into your applications with our powerful API. Create art videos programmatically with simple REST endpoints.',
    locale,
    pathname: '/api-docs',
  });
}

// API Endpoints preview
const endpoints = [
  {
    method: 'POST',
    path: '/v1/videos/create',
    description: 'Create a new art video from an image',
  },
  {
    method: 'GET',
    path: '/v1/videos/{id}',
    description: 'Get video status and download URL',
  },
  {
    method: 'GET',
    path: '/v1/styles',
    description: 'List all available art styles',
  },
  {
    method: 'GET',
    path: '/v1/account/credits',
    description: 'Check remaining API credits',
  },
];

// Features
const features = [
  { id: 'simple', icon: ZapIcon },
  { id: 'secure', icon: ShieldCheckIcon },
  { id: 'scalable', icon: CodeIcon },
];

export default async function APIDocsPage() {
  const t = await getTranslations('APIDocsPage');

  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <CodeIcon className="size-4" />
            {t('badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('description')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <LocaleLink href="/docs">{t('viewFullDocs')}</LocaleLink>
            </Button>
            <Button asChild variant="outline" size="lg">
              <LocaleLink href="/settings/profile">{t('getApiKey')}</LocaleLink>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="p-6 rounded-xl border bg-card text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Icon className="size-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">
                  {t(`features.${feature.id}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t(`features.${feature.id}.description`)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Start */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">{t('quickStart.title')}</h2>
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
              <span className="text-sm font-medium">{t('quickStart.example')}</span>
              <Button variant="ghost" size="sm" className="gap-2">
                <CopyIcon className="size-4" />
                {t('quickStart.copy')}
              </Button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
              <code className="text-muted-foreground">
{`curl -X POST https://api.genx.art/v1/videos/create \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/photo.jpg",
    "style": "cyberpunk",
    "duration": 5
  }'`}
              </code>
            </pre>
          </div>
        </div>

        {/* API Endpoints Preview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">{t('endpoints.title')}</h2>
          <div className="space-y-3">
            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors"
              >
                <span
                  className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                    endpoint.method === 'POST'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}
                >
                  {endpoint.method}
                </span>
                <code className="font-mono text-sm">{endpoint.path}</code>
                <span className="text-muted-foreground text-sm ml-auto hidden sm:block">
                  {endpoint.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Authentication */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">{t('auth.title')}</h2>
          <div className="p-6 rounded-xl border bg-card">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <KeyIcon className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('auth.subtitle')}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('auth.description')}
                </p>
                <div className="p-3 rounded-lg bg-muted font-mono text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">{t('rateLimits.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="font-semibold mb-4">{t('rateLimits.free.title')}</h3>
              <ul className="space-y-2">
                {['limit1', 'limit2', 'limit3'].map((limit) => (
                  <li key={limit} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircleIcon className="size-4 text-primary flex-shrink-0" />
                    {t(`rateLimits.free.${limit}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-xl border bg-card border-primary/50">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold">{t('rateLimits.pro.title')}</h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                  {t('rateLimits.pro.badge')}
                </span>
              </div>
              <ul className="space-y-2">
                {['limit1', 'limit2', 'limit3'].map((limit) => (
                  <li key={limit} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircleIcon className="size-4 text-primary flex-shrink-0" />
                    {t(`rateLimits.pro.${limit}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 rounded-2xl bg-muted/50 border">
          <BookOpenIcon className="size-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('cta.title')}</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t('cta.description')}
          </p>
          <Button asChild size="lg" className="gap-2">
            <LocaleLink href="/docs">
              {t('cta.button')}
              <ExternalLinkIcon className="size-4" />
            </LocaleLink>
          </Button>
        </div>
      </div>
    </Container>
  );
}
