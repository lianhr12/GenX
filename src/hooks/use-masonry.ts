import { useCallback, useEffect, useRef, useState } from 'react';

interface MasonryItem {
  id: string;
  aspectRatio: string;
  [key: string]: unknown;
}

interface MasonryPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseMasonryOptions {
  items: MasonryItem[];
  columnCount?: number;
  gap?: number;
  containerWidth?: number;
}

interface UseMasonryReturn {
  positions: Map<string, MasonryPosition>;
  containerHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const getAspectRatioValue = (ratio: string): number => {
  const [width, height] = ratio.split(':').map(Number);
  return width / height;
};

export function useMasonry({
  items,
  columnCount: initialColumnCount,
  gap = 16,
}: UseMasonryOptions): UseMasonryReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [positions, setPositions] = useState<Map<string, MasonryPosition>>(
    new Map()
  );
  const [containerHeight, setContainerHeight] = useState(0);
  const [columnCount, setColumnCount] = useState(initialColumnCount || 4);

  // Calculate column count based on container width
  const calculateColumnCount = useCallback((width: number): number => {
    if (width < 640) return 2; // sm
    if (width < 768) return 2; // md
    if (width < 1024) return 3; // lg
    if (width < 1280) return 4; // xl
    return 5; // 2xl
  }, []);

  // Calculate positions for all items
  const calculatePositions = useCallback(() => {
    if (!containerRef.current || items.length === 0) return;

    const containerWidth = containerRef.current.offsetWidth;
    const cols = initialColumnCount || calculateColumnCount(containerWidth);
    setColumnCount(cols);

    const columnWidth = (containerWidth - gap * (cols - 1)) / cols;
    const columnHeights = new Array(cols).fill(0);
    const newPositions = new Map<string, MasonryPosition>();

    items.forEach((item) => {
      // Find the shortest column
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));

      // Calculate item height based on aspect ratio
      const aspectRatio = getAspectRatioValue(item.aspectRatio);
      const itemHeight = columnWidth / aspectRatio;

      // Set position
      newPositions.set(item.id, {
        x: shortestColumn * (columnWidth + gap),
        y: columnHeights[shortestColumn],
        width: columnWidth,
        height: itemHeight,
      });

      // Update column height
      columnHeights[shortestColumn] += itemHeight + gap;
    });

    setPositions(newPositions);
    setContainerHeight(Math.max(...columnHeights) - gap);
  }, [items, gap, initialColumnCount, calculateColumnCount]);

  // Recalculate on resize
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

  // Recalculate when items change
  useEffect(() => {
    calculatePositions();
  }, [items, calculatePositions]);

  return {
    positions,
    containerHeight,
    containerRef,
  };
}
