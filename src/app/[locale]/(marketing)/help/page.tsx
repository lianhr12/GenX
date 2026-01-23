import Container from '@/components/layout/container';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { constructMetadata } from '@/lib/metadata';
import {
  BookOpenIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  HelpCircleIcon,
  ImageIcon,
  MailIcon,
  MessageCircleIcon,
  SearchIcon,
  ShieldIcon,
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
    title: 'Help Center | ' + t('title'),
    description:
      'Get help with GenX.art. Find answers to frequently asked questions about creating art videos, pricing, account management, and more.',
    locale,
    pathname: '/help',
  });
}

// FAQ categories with icons
const categories = [
  { id: 'getting-started', icon: BookOpenIcon },
  { id: 'creating-videos', icon: ImageIcon },
  { id: 'billing', icon: CreditCardIcon },
  { id: 'account', icon: ShieldIcon },
];

// FAQ items per category
const faqItems: Record<string, string[]> = {
  'getting-started': ['q1', 'q2', 'q3'],
  'creating-videos': ['q1', 'q2', 'q3', 'q4'],
  billing: ['q1', 'q2', 'q3'],
  account: ['q1', 'q2', 'q3'],
};

export default async function HelpPage() {
  const t = await getTranslations('HelpPage');

  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <HelpCircleIcon className="size-4" />
            {t('badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Search Box (Visual only - could be connected to search functionality) */}
        <div className="relative mb-12">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="w-full h-14 pl-12 pr-4 rounded-xl border bg-card text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="flex flex-col items-center p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all text-center"
              >
                <Icon className="size-8 text-primary mb-3" />
                <span className="font-medium">
                  {t(`categories.${category.id}`)}
                </span>
              </a>
            );
          })}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <section key={category.id} id={category.id}>
                <div className="flex items-center gap-3 mb-6">
                  <Icon className="size-6 text-primary" />
                  <h2 className="text-2xl font-bold">
                    {t(`categories.${category.id}`)}
                  </h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {faqItems[category.id].map((qId) => (
                    <AccordionItem key={qId} value={`${category.id}-${qId}`}>
                      <AccordionTrigger className="text-left">
                        {t(`faqs.${category.id}.${qId}.question`)}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {t(`faqs.${category.id}.${qId}.answer`)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            );
          })}
        </div>

        {/* Contact Support Section */}
        <div className="mt-20 p-8 rounded-2xl bg-muted/50 border">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{t('contact.title')}</h2>
            <p className="text-muted-foreground">{t('contact.description')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Support */}
            <div className="flex items-start gap-4 p-6 rounded-xl bg-card border">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MailIcon className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {t('contact.email.title')}
                </h3>
                <p className="text-muted-foreground text-sm mb-2">
                  {t('contact.email.description')}
                </p>
                <a
                  href="mailto:support@genx.art"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  support@genx.art
                </a>
              </div>
            </div>

            {/* Documentation */}
            <div className="flex items-start gap-4 p-6 rounded-xl bg-card border">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpenIcon className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {t('contact.docs.title')}
                </h3>
                <p className="text-muted-foreground text-sm mb-2">
                  {t('contact.docs.description')}
                </p>
                <LocaleLink
                  href="/docs"
                  className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                >
                  {t('contact.docs.link')}
                  <ExternalLinkIcon className="size-3" />
                </LocaleLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
