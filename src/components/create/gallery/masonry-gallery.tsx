'use client';

import type { GalleryItem } from '@/config/create';
import { useMasonry } from '@/hooks/use-masonry';
import { GalleryVideoCard } from './gallery-video-card';

interface MasonryGalleryProps {
  items: GalleryItem[];
}

export function MasonryGallery({ items }: MasonryGalleryProps) {
  const masonryItems = items.map((item) => ({
    ...item,
    aspectRatio: item.aspectRatio,
  }));

  const { positions, containerHeight, containerRef } = useMasonry({
    items: masonryItems,
    gap: 16,
  });

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No items to display
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: containerHeight || 'auto' }}
    >
      {items.map((item, index) => {
        const position = positions.get(item.id);
        if (!position) return null;

        return (
          <div
            key={item.id}
            className="absolute animate-in fade-in slide-in-from-bottom-4 duration-300"
            style={{
              left: position.x,
              top: position.y,
              width: position.width,
              height: position.height,
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'backwards',
            }}
          >
            <GalleryVideoCard item={item} />
          </div>
        );
      })}
    </div>
  );
}
