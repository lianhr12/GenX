'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseLazyVideoOptions {
  /**
   * Intersection Observer threshold (0-1)
   * @default 0.1
   */
  threshold?: number;
  /**
   * Root margin for early loading (e.g., '200px')
   * @default '200px'
   */
  rootMargin?: string;
  /**
   * Whether to preload the video when in view
   * @default true
   */
  preloadOnInView?: boolean;
  /**
   * Whether to auto-play when video is loaded and in view
   * @default false
   */
  autoPlayOnLoad?: boolean;
}

interface UseLazyVideoReturn {
  /**
   * Ref to attach to the video container element
   */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Ref to attach to the video element
   */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /**
   * Whether the video container is in the viewport
   */
  isInView: boolean;
  /**
   * Whether the video should start loading
   */
  shouldLoad: boolean;
  /**
   * Whether the video is fully loaded and ready to play
   */
  isLoaded: boolean;
  /**
   * Whether the video is currently playing
   */
  isPlaying: boolean;
  /**
   * Play the video
   */
  play: () => Promise<void>;
  /**
   * Pause the video
   */
  pause: () => void;
  /**
   * Reset the video to the beginning
   */
  reset: () => void;
}

/**
 * Hook for lazy loading videos using Intersection Observer.
 * Only loads video when it enters the viewport (with optional margin for preloading).
 *
 * @example
 * ```tsx
 * const { containerRef, videoRef, shouldLoad, isLoaded } = useLazyVideo({
 *   rootMargin: '200px',
 *   autoPlayOnLoad: true,
 * });
 *
 * return (
 *   <div ref={containerRef}>
 *     {shouldLoad && (
 *       <video ref={videoRef} src="/video.mp4" />
 *     )}
 *   </div>
 * );
 * ```
 */
export function useLazyVideo(options: UseLazyVideoOptions = {}): UseLazyVideoReturn {
  const {
    threshold = 0.1,
    rootMargin = '200px',
    preloadOnInView = true,
    autoPlayOnLoad = false,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isInView, setIsInView] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Set up Intersection Observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);

        // Once in view, start loading (one-time trigger)
        if (inView && preloadOnInView && !shouldLoad) {
          setShouldLoad(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, preloadOnInView, shouldLoad]);

  // Handle video loaded state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlayThrough = () => {
      setIsLoaded(true);
      if (autoPlayOnLoad && isInView) {
        video.play().catch(() => {
          // Autoplay might be blocked by browser
        });
      }
    };

    const handlePlaying = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    // Check if already loaded
    if (video.readyState >= 4) {
      handleCanPlayThrough();
    }

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [autoPlayOnLoad, isInView, shouldLoad]);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (video && isLoaded) {
      try {
        await video.play();
      } catch (error) {
        // Autoplay might be blocked
        console.warn('Video play was blocked:', error);
      }
    }
  }, [isLoaded]);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
  }, []);

  const reset = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, []);

  return {
    containerRef,
    videoRef,
    isInView,
    shouldLoad,
    isLoaded,
    isPlaying,
    play,
    pause,
    reset,
  };
}

/**
 * Hook for preloading a video in the background.
 * Useful for preloading the next video in a carousel.
 *
 * @example
 * ```tsx
 * useVideoPreload('/videos/next-video.mp4');
 * ```
 */
export function useVideoPreload(src: string | null) {
  useEffect(() => {
    if (!src) return;

    // Create a link preload element
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = src;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [src]);
}

/**
 * Hook for managing multiple videos with lazy loading.
 * Only renders videos that are close to the viewport.
 *
 * @example
 * ```tsx
 * const { visibleIndices, containerRefs } = useLazyVideoList(videos.length, {
 *   buffer: 1, // Load 1 video before and after visible ones
 * });
 * ```
 */
export function useLazyVideoList(
  totalCount: number,
  options: {
    buffer?: number;
    rootMargin?: string;
  } = {}
) {
  const { buffer = 1, rootMargin = '100px' } = options;

  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    containerRefs.current.forEach((container, index) => {
      if (!container) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setVisibleIndices((prev) => {
            const next = new Set(prev);
            if (entry.isIntersecting) {
              // Add this index and buffer indices
              for (let i = Math.max(0, index - buffer); i <= Math.min(totalCount - 1, index + buffer); i++) {
                next.add(i);
              }
            }
            return next;
          });
        },
        { rootMargin }
      );

      observer.observe(container);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [totalCount, buffer, rootMargin]);

  const setRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    containerRefs.current[index] = el;
  }, []);

  return {
    visibleIndices,
    setRef,
    isVisible: useCallback((index: number) => visibleIndices.has(index), [visibleIndices]),
  };
}
