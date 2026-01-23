'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';

const faqItems = [
  { id: 'free' },
  { id: 'skills' },
  { id: 'commercial' },
  { id: 'watermark' },
  { id: 'formats' },
  { id: 'time' },
  { id: 'data' },
  { id: 'payment' },
  { id: 'refund' },
  { id: 'cancel' },
];

export function FAQSection() {
  const t = useTranslations('Landing.faq');

  return (
    <section id="faq" className="relative py-24 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <AnimatedGroup preset="blur-slide">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              {t('badge')}
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {t('headline')}
            </h2>
          </AnimatedGroup>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-12">
          <AnimatedGroup preset="slide">
            <Accordion
              type="single"
              collapsible
              defaultValue="free"
              className="w-full rounded-2xl border bg-background px-6 py-2 shadow-sm"
            >
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-b border-dashed last:border-0"
                >
                  <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">
                    {t(`items.${item.id}.question` as never)}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-muted-foreground">
                    {t(`items.${item.id}.answer` as never)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedGroup>
        </div>
      </div>
    </section>
  );
}
