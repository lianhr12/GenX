'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryItemData } from './gallery-video-card';
import { GalleryVideoCard } from './gallery-video-card';
import type { ReplicateData } from '@/stores/creator-navigation-store';

interface MasonryPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MasonryGalleryProps {
  items: GalleryItemData[];
  gap?: number;
  onItemClick?: (item: GalleryItemData) => void;
  onReplicate?: (data: ReplicateData) => void;
}

const getAspectRatioValue = (ratio: string): number => {
  const [width, height] = ratio.split(':').map(Number);
  return width / height;
};

export function MasonryGallery({
  items,
  gap = 16,
  onItemClick,
  onReplicate,
}: MasonryGalleryProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [positions, setPositions] = useState<Map<string, MasonryPosition>>(
    new Map()
  );
  const [containerHeight, setContainerHeight] = useState(0);

  const calculateColumnCount = useCallback((width: number): number => {
    if (width < 640) return 2;
    if (width < 768) return 2;
    if (width < 1024) return 3;
    if (width < 1280) return 4;
    return 5;
  }, []);

  const calculatePositions = useCallback(() => {
    if (!containerRef.current || items.length === 0) return;

    const containerWidth = containerRef.current.offsetWidth;
    const cols = calculateColumnCount(containerWidth);
    const columnWidth = (containerWidth - gap * (cols - 1)) / cols;
    const columnHeights = new Array(cols).fill(0);
    const newPositions = new Map<string, MasonryPosition>();

    items.forEach((item) => {
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      const aspectRatio = item.aspectRatio
        ? getAspectRatioValue(item.aspectRatio)
        : 16 / 9;
      const itemHeight = columnWidth / aspectRatio;
      const itemId = String(item.uuid || item.id);

      newPositions.set(itemId, {
        x: shortestColumn * (columnWidth + gap),
        y: columnHeights[shortestColumn],
        width: columnWidth,
        height: itemHeight,
      });

      columnHeights[shortestColumn] += itemHeight + gap;
    });

    setPositions(newPositions);
    setContainerHeight(Math.max(...columnHeights) - gap);
  }, [items, gap, calculateColumnCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      calculatePositions();
    });

    resizeObserver.observe(container);
    calculatePositions();

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculatePositions]);

  useEffect(() => {
    calculatePositions();
  }, [items, calculatePositions]);

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
        const itemId = String(item.uuid || item.id);
        const position = positions.get(itemId);
        if (!position) return null;

        return (
          <div
            key={itemId}
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
            <GalleryVideoCard item={item} onClick={onItemClick} onReplicate={onReplicate} />
          </div>
        );
      })}
    </div>
  );
}
