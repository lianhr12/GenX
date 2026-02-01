'use client';

import type { GalleryItem } from '@/config/create';
import { cn } from '@/lib/utils';
import { EyeIcon, HeartIcon, PlayIcon } from 'lucide-react';
import { useState } from 'react';

interface GalleryVideoCardProps {
  item: GalleryItem;
}

export function GalleryVideoCard({ item }: GalleryVideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-xl bg-muted cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPlaying(false);
      }}
      onClick={() => setIsPlaying(!isPlaying)}
    >
      {/* Thumbnail or Video */}
      {isPlaying ? (
        <video
          src={item.videoUrl}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <>
          {/* Thumbnail placeholder */}
          <div
            className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20"
            style={{
              backgroundImage: item.thumbnailUrl
                ? `url(${item.thumbnailUrl})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Play button overlay */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <PlayIcon
                className="size-5 text-black ml-0.5"
                fill="currentColor"
              />
            </div>
          </div>
        </>
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Info overlay */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        {/* Prompt */}
        <p className="text-white text-xs line-clamp-2 mb-2">{item.prompt}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-white/80 text-xs">
          <span className="flex items-center gap-1">
            <HeartIcon className="size-3" />
            {formatCount(item.likes)}
          </span>
          <span className="flex items-center gap-1">
            <EyeIcon className="size-3" />
            {formatCount(item.views)}
          </span>
          {item.creatorName && (
            <span className="ml-auto truncate">@{item.creatorName}</span>
          )}
        </div>
      </div>

      {/* Model badge */}
      <div className="absolute top-2 left-2">
        <span className="px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm">
          {item.model}
        </span>
      </div>
    </div>
  );
}
