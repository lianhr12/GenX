'use client';

import type { GalleryItem } from '@/hooks/use-gallery';
import { cn } from '@/lib/utils';
import { Eye, Play } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';
import { GalleryLikeButton } from './gallery-like-button';

interface GalleryCardProps {
  item: GalleryItem;
  onClick?: () => void;
  showCreator?: boolean;
}

export function GalleryCard({
  item,
  onClick,
  showCreator = true,
}: GalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border bg-muted"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
    >
      {/* Thumbnail */}
      <Image
        src={item.thumbnailUrl}
        alt={item.prompt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        loading="lazy"
      />

      {/* Hover Overlay */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Play Button */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 text-white" fill="white" />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2">
          {/* Style Badge */}
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {item.artStyle}
          </span>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GalleryLikeButton
                galleryItemId={item.id}
                initialLikesCount={item.likesCount}
                initialIsLiked={item.isLiked}
                className="text-white/80 hover:text-red-400"
                size="sm"
              />
              <div className="flex items-center gap-1 text-white/80">
                <Eye className="h-3.5 w-3.5" />
                <span className="text-xs">{item.viewsCount}</span>
              </div>
            </div>
            {showCreator && item.creatorName && (
              <span className="text-xs text-white/60 truncate max-w-[100px]">
                {item.creatorName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Always visible stats on mobile */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent sm:hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/80 px-2 py-0.5 rounded-full bg-white/10">
            {item.artStyle}
          </span>
          <div className="flex items-center gap-2">
            <GalleryLikeButton
              galleryItemId={item.id}
              initialLikesCount={item.likesCount}
              initialIsLiked={item.isLiked}
              className="text-white/80"
              size="sm"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton for loading state
export function GalleryCardSkeleton() {
  return <div className="aspect-video rounded-xl bg-muted animate-pulse" />;
}
