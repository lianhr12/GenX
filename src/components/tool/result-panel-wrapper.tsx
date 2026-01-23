'use client';

import type { Video } from '@/db';
import { useCallback, useEffect, useState } from 'react';
import { ResultPanel } from './result-panel';

interface ResultPanelWrapperProps {
  currentVideo?: Video | null;
  isGenerating?: boolean;
  videoUuid?: string | null;
  onVideoComplete?: (video: Video) => void;
  onGenerationFailed?: (error?: string) => void;
  onRegenerate?: () => void;
}

export function ResultPanelWrapper({
  currentVideo,
  isGenerating = false,
  videoUuid,
  onVideoComplete,
  onGenerationFailed,
  onRegenerate,
}: ResultPanelWrapperProps) {
  const [progress, setProgress] = useState(0);
  const [pollCount, setPollCount] = useState(0);

  // Poll for video status
  const pollStatus = useCallback(async () => {
    if (!videoUuid || !isGenerating) return;

    try {
      const response = await fetch(`/api/v1/video/${videoUuid}/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }

      const result = await response.json();
      const data = result.data;

      if (data.status === 'COMPLETED' && data.videoUrl) {
        // Fetch full video details
        const videoResponse = await fetch(`/api/v1/video/${videoUuid}`);
        if (videoResponse.ok) {
          const videoResult = await videoResponse.json();
          onVideoComplete?.(videoResult.data);
        }
      } else if (data.status === 'FAILED') {
        onGenerationFailed?.(data.error);
      } else {
        // Still generating, update progress
        setPollCount((c) => c + 1);
        // Simulate progress (actual progress would come from the API)
        setProgress((p) => Math.min(p + 5, 90));
      }
    } catch (error) {
      console.error('Failed to poll status:', error);
    }
  }, [videoUuid, isGenerating, onVideoComplete, onGenerationFailed]);

  // Set up polling interval
  useEffect(() => {
    if (!videoUuid || !isGenerating) {
      setProgress(0);
      setPollCount(0);
      return;
    }

    // Start with some initial progress
    setProgress(10);

    // Poll every 5 seconds
    const interval = setInterval(pollStatus, 5000);

    // Initial poll
    pollStatus();

    return () => clearInterval(interval);
  }, [videoUuid, isGenerating, pollStatus]);

  return (
    <ResultPanel
      currentVideo={currentVideo}
      isGenerating={isGenerating}
      generatingProgress={progress}
      onRegenerate={onRegenerate}
    />
  );
}
