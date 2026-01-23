'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import {
  BookOpenIcon,
  CreditCardIcon,
  ImageIcon,
  SearchIcon,
  ShieldIcon,
  XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

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

interface FaqItem {
  categoryId: string;
  questionId: string;
  question: string;
  answer: string;
}

export function HelpSearch() {
  const t = useTranslations('HelpPage');
  const [searchQuery, setSearchQuery] = useState('');

  // Build searchable FAQ data with translations
  const allFaqs = useMemo(() => {
    const faqs: FaqItem[] = [];
    for (const category of categories) {
      for (const qId of faqItems[category.id]) {
        faqs.push({
          categoryId: category.id,
          questionId: qId,
          question: t(`faqs.${category.id}.${qId}.question` as never),
          answer: t(`faqs.${category.id}.${qId}.answer` as never),
        });
      }
    }
    return faqs;
  }, [t]);

  // Filter FAQs based on search query
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    return allFaqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
  }, [searchQuery, allFaqs]);

  const hasSearchResults = filteredFaqs !== null;
  const hasResults = filteredFaqs && filteredFaqs.length > 0;

  return (
    <>
      {/* Search Box */}
      <div className="relative mb-12">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full h-14 pl-12 pr-12 rounded-xl border bg-card text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <XIcon className="size-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {hasSearchResults && (
        <div className="mb-12">
          {hasResults ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {t('searchResults', { count: filteredFaqs.length })}
              </p>
              <Accordion
                type="single"
                collapsible
                className="w-full rounded-xl border bg-card px-4"
              >
                {filteredFaqs.map((faq) => {
                  const category = categories.find(
                    (c) => c.id === faq.categoryId
                  );
                  const Icon = category?.icon || BookOpenIcon;
                  return (
                    <AccordionItem
                      key={`${faq.categoryId}-${faq.questionId}`}
                      value={`${faq.categoryId}-${faq.questionId}`}
                      className="border-b last:border-0"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-start gap-3">
                          <Icon className="size-5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <span className="block">{faq.question}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                              {t(`categories.${faq.categoryId}` as never)}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pl-8">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </>
          ) : (
            <div className="text-center py-8 px-4 rounded-xl border bg-card">
              <SearchIcon className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('noResults')}</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 text-primary hover:underline text-sm"
              >
                {t('clearSearch')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Links - Hide when searching */}
      {!hasSearchResults && (
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
                  {t(`categories.${category.id}` as never)}
                </span>
              </a>
            );
          })}
        </div>
      )}

      {/* FAQ Sections - Hide when searching */}
      {!hasSearchResults && (
        <div className="space-y-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <section key={category.id} id={category.id}>
                <div className="flex items-center gap-3 mb-6">
                  <Icon className="size-6 text-primary" />
                  <h2 className="text-2xl font-bold">
                    {t(`categories.${category.id}` as never)}
                  </h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {faqItems[category.id].map((qId) => (
                    <AccordionItem key={qId} value={`${category.id}-${qId}`}>
                      <AccordionTrigger className="text-left">
                        {t(`faqs.${category.id}.${qId}.question` as never)}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {t(`faqs.${category.id}.${qId}.answer` as never)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
