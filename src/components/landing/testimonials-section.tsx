'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Quote, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

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
  testimonial: (typeof testimonials)[0];
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
        "{t(`items.${testimonial.id}.content` as never)}"
      </p>

      {/* Author */}
      <div className="mt-6 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
          <Image
            src={testimonial.avatar}
            alt={t(`items.${testimonial.id}.name` as never)}
            fill
            sizes="40px"
            className="object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <p className="font-medium">{t(`items.${testimonial.id}.name` as never)}</p>
          <p className="text-sm text-muted-foreground">
            {t(`items.${testimonial.id}.role` as never)}
          </p>
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
                <CarouselItem
                  key={testimonial.id}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
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

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2 rounded-lg bg-background px-4 py-2 text-sm text-muted-foreground">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>{t('trustBadges.securePayment')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
