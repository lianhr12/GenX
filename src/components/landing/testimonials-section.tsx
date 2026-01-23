'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Star, Quote } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Demo testimonials - names/roles are fetched from i18n
const testimonials = [
  {
    id: '1',
    avatar: '/images/demo/avatars/avatar-1.jpg',
    rating: 5,
  },
  {
    id: '2',
    avatar: '/images/demo/avatars/avatar-2.jpg',
    rating: 5,
  },
  {
    id: '3',
    avatar: '/images/demo/avatars/avatar-3.jpg',
    rating: 5,
  },
  {
    id: '4',
    avatar: '/images/demo/avatars/avatar-4.jpg',
    rating: 5,
  },
];

interface TestimonialCardProps {
  testimonial: typeof testimonials[0];
  index: number;
}

function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  const t = useTranslations('Landing.testimonials');

  return (
    <motion.div
      className="relative h-full rounded-2xl border bg-background p-6 shadow-sm"
      whileHover={{ y: -4 }}
    >
      {/* Quote Icon */}
      <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/10" />

      {/* Rating */}
      <div className="flex gap-1">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      {/* Content */}
      <p className="mt-4 text-muted-foreground">
        "{t(`items.${testimonial.id}.content`)}"
      </p>

      {/* Author */}
      <div className="mt-6 flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
          <img
            src={testimonial.avatar}
            alt={t(`items.${testimonial.id}.name`)}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback to initials
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div>
          <p className="font-medium">{t(`items.${testimonial.id}.name`)}</p>
          <p className="text-sm text-muted-foreground">{t(`items.${testimonial.id}.role`)}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const t = useTranslations('Landing.testimonials');

  return (
    <section id="testimonials" className="relative py-24 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

        {/* Testimonials Carousel */}
        <div className="mt-16">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <TestimonialCard testimonial={testimonial} index={index} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-8 flex items-center justify-center gap-2">
              <CarouselPrevious className="relative left-0 top-0 translate-x-0 translate-y-0" />
              <CarouselNext className="relative right-0 top-0 translate-x-0 translate-y-0" />
            </div>
          </Carousel>
        </div>

        {/* Trust Badges (for future) */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 opacity-50">
          <div className="flex items-center gap-2 rounded-lg bg-background px-4 py-2 text-sm text-muted-foreground">
            <span>{t('trustBadges.g2.label')}</span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span>{t('trustBadges.g2.rating')}</span>
          </div>
          <div className="rounded-lg bg-background px-4 py-2 text-sm text-muted-foreground">
            {t('trustBadges.productHunt')}
          </div>
        </div>
      </div>
    </section>
  );
}
