'use client';

import { cn } from '@/lib/utils';
import {
  Download,
  EyeIcon,
  Heart,
  HeartIcon,
  ImageIcon,
  Play,
  PlayIcon,
  Trash2,
  Video as VideoIcon,
  ZoomIn,
} from 'lucide-react';
import { useState } from 'react';

export interface GalleryItemData {
  id: string | number;
  uuid?: string;
  // Media type - 'video' or 'image'
  mediaType?: 'video' | 'image';
  videoUrl: string;
  thumbnailUrl: string;
  // For images - array of image URLs
  imageUrls?: string[];
  prompt: string;
  category?: string;
  artStyle?: string;
  model?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  likes?: number;
  likesCount?: number;
  views?: number;
  viewsCount?: number;
  creatorName?: string | null;
  creatorAvatar?: string | null;
  isLiked?: boolean;
  isFavorite?: boolean;
  createdAt?: Date;
  // Management fields
  status?: 'COMPLETED' | 'GENERATING' | 'PENDING' | 'UPLOADING' | 'FAILED';
  duration?: number;
  resolution?: string;
}

interface GalleryVideoCardProps {
  item: GalleryItemData;
  onClick?: (item: GalleryItemData) => void;
  // Management mode props
  isManagementMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onDownload?: () => void;
}

export function GalleryVideoCard({
  item,
  onClick,
  isManagementMode = false,
  isSelected = false,
  onToggleSelect,
  onDelete,
  onToggleFavorite,
  onDownload,
}: GalleryVideoCardProps) {
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

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    } else if (!isManagementMode) {
      setIsPlaying(!isPlaying);
    }
  };

  const statusColors: Record<string, string> = {
    COMPLETED: 'bg-green-500',
    GENERATING: 'bg-yellow-500',
    PENDING: 'bg-yellow-500',
    UPLOADING: 'bg-blue-500',
    FAILED: 'bg-red-500',
  };

  // Management mode card
  if (isManagementMode) {
    return (
      <div
        className={cn(
          'group relative aspect-video rounded-lg overflow-hidden border bg-muted transition-all cursor-pointer',
          isSelected ? 'border-primary ring-2 ring-primary' : 'border-border'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Checkbox */}
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect?.();
            }}
            className="w-4 h-4 rounded border-border bg-background/80 backdrop-blur-sm"
          />
        </div>

        {/* Favorite Badge */}
        {item.isFavorite && (
          <div className="absolute top-2 right-2 z-10">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          </div>
        )}

        {/* Thumbnail */}
        {item.thumbnailUrl ? (
          <div
            className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20"
            style={{
              backgroundImage: `url(${item.thumbnailUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {item.mediaType === 'image' ? (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            ) : (
              <VideoIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        )}

        {/* Play Icon Overlay - Only for videos */}
        {item.mediaType !== 'image' &&
          item.status === 'COMPLETED' &&
          item.videoUrl &&
          !isHovered && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
            </div>
          )}

        {/* Status Badge */}
        {item.status && item.status !== 'COMPLETED' && (
          <div className="absolute bottom-2 left-2">
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium text-white',
                statusColors[item.status] || 'bg-gray-500'
              )}
            >
              {item.status}
            </span>
          </div>
        )}

        {/* Duration Badge */}
        {item.duration && item.status === 'COMPLETED' && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-0.5 rounded bg-black/60 text-white text-xs">
              {item.duration}s
            </span>
          </div>
        )}

        {/* Hover Overlay with Actions */}
        <div
          className={cn(
            'absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center gap-2',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(item);
            }}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            title="View details"
          >
            <ZoomIn className="h-5 w-5 text-white" />
          </button>
          {(item.videoUrl || (item.imageUrls && item.imageUrls.length > 0)) &&
            onDownload && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload();
                }}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                title="Download"
              >
                <Download className="h-5 w-5 text-white" />
              </button>
            )}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              title={
                item.isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <Heart
                className={cn(
                  'h-5 w-5',
                  item.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                )}
              />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-5 w-5 text-white" />
            </button>
          )}
        </div>

        {/* Model Badge */}
        {item.model && (
          <div
            className={cn(
              'absolute bottom-2 right-2 transition-opacity',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <span className="px-2 py-0.5 rounded bg-black/60 text-white text-xs">
              {item.model}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Gallery mode card (original behavior)
  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-xl bg-muted cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPlaying(false);
      }}
      onClick={handleClick}
    >
      {/* Thumbnail or Video */}
      {isPlaying && item.mediaType !== 'image' ? (
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

          {/* Hover overlay - Play for video, Zoom for image */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              {item.mediaType === 'image' ? (
                <ZoomIn className="size-5 text-black" />
              ) : (
                <PlayIcon
                  className="size-5 text-black ml-0.5"
                  fill="currentColor"
                />
              )}
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
            {formatCount(item.likes ?? item.likesCount ?? 0)}
          </span>
          <span className="flex items-center gap-1">
            <EyeIcon className="size-3" />
            {formatCount(item.views ?? item.viewsCount ?? 0)}
          </span>
          {item.creatorName && (
            <span className="ml-auto truncate">@{item.creatorName}</span>
          )}
        </div>
      </div>

      {/* Model badge */}
      {(item.model || item.artStyle) && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm">
            {item.model || item.artStyle}
          </span>
        </div>
      )}
    </div>
  );
}
