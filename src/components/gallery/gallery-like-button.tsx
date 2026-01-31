'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useGalleryLike } from '@/hooks/use-gallery';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface GalleryLikeButtonProps {
  galleryItemId: number;
  initialLikesCount: number;
  initialIsLiked: boolean;
  className?: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function GalleryLikeButton({
  galleryItemId,
  initialLikesCount,
  initialIsLiked,
  className,
  showCount = true,
  size = 'md',
}: GalleryLikeButtonProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const { mutate: toggleLike, isPending } = useGalleryLike();

  // Optimistic state
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }

    if (isPending) return;

    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked
      ? likesCount + 1
      : Math.max(likesCount - 1, 0);
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    toggleLike(galleryItemId, {
      onError: () => {
        // Revert on error
        setIsLiked(isLiked);
        setLikesCount(likesCount);
      },
    });
  };

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'flex items-center gap-1 transition-colors',
        isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500',
        isPending && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Heart
        className={cn(
          sizeClasses[size],
          'transition-all',
          isLiked && 'fill-current scale-110'
        )}
      />
      {showCount && <span className={textSizeClasses[size]}>{likesCount}</span>}
    </button>
  );
}
