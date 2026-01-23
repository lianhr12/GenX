'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Video } from '@/db';

interface UseVideoGenerationOptions {
  onComplete?: (video: Video) => void;
  onError?: (error: string) => void;
  pollInterval?: number;
}

interface GenerateVideoParams {
  prompt: string;
  model: string;
  duration: number;
  aspectRatio?: string;
  quality?: string;
  imageUrl?: string;
}

export function useVideoGeneration(options: UseVideoGenerationOptions = {}) {
  const { onComplete, onError, pollInterval = 5000 } = options;

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const videoUuidRef = useRef<string | null>(null);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Poll video status
  const pollVideoStatus = useCallback(async () => {
    if (!videoUuidRef.current) return;

    try {
      const response = await fetch(
        `/api/v1/video/${videoUuidRef.current}/status`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }

      const result = await response.json();
      const data = result.data;

      if (data.status === 'COMPLETED') {
        stopPolling();

        // Fetch full video data
        const videoResponse = await fetch(
          `/api/v1/video/${videoUuidRef.current}`
        );
        if (videoResponse.ok) {
          const videoResult = await videoResponse.json();
          const video = videoResult.data as Video;
          setCurrentVideo(video);
          setIsGenerating(false);
          setProgress(100);
          onComplete?.(video);
        }
      } else if (data.status === 'FAILED') {
        stopPolling();
        const errMsg = data.error || 'Video generation failed';
        setError(errMsg);
        setIsGenerating(false);
        onError?.(errMsg);
      } else {
        // Still generating, update progress
        setProgress((p) => Math.min(p + 5, 95));
      }
    } catch (err) {
      console.error('Failed to poll video status:', err);
    }
  }, [stopPolling, onComplete, onError]);

  // Start polling
  const startPolling = useCallback(
    (videoUuid: string) => {
      videoUuidRef.current = videoUuid;
      setProgress(10);

      // Initial poll after short delay
      setTimeout(pollVideoStatus, 2000);

      // Set up interval polling
      pollingRef.current = setInterval(pollVideoStatus, pollInterval);
    },
    [pollVideoStatus, pollInterval]
  );

  // Generate video
  const generate = useCallback(
    async (params: GenerateVideoParams): Promise<{ videoUuid: string } | null> => {
      setIsGenerating(true);
      setError(null);
      setCurrentVideo(null);
      setProgress(0);

      try {
        const response = await fetch('/api/v1/video/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate video');
        }

        const result = await response.json();
        const videoUuid = result.data.videoUuid;

        // Start polling for status
        startPolling(videoUuid);

        return { videoUuid };
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Generation failed';
        setError(errMsg);
        setIsGenerating(false);
        onError?.(errMsg);
        return null;
      }
    },
    [startPolling, onError]
  );

  // Reset state
  const reset = useCallback(() => {
    stopPolling();
    setIsGenerating(false);
    setCurrentVideo(null);
    setError(null);
    setProgress(0);
    videoUuidRef.current = null;
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    generate,
    reset,
    isGenerating,
    currentVideo,
    error,
    progress,
  };
}
