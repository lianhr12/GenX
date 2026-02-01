'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useGalleryFavorite } from '@/hooks/use-gallery';
import { cn } from '@/lib/utils';
import { Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface GalleryFavoriteButtonProps {
  galleryItemId: number;
  initialIsFavorite: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function GalleryFavoriteButton({
  galleryItemId,
  initialIsFavorite,
  className,
  size = 'md',
}: GalleryFavoriteButtonProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const { mutate: toggleFavorite, isPending } = useGalleryFavorite();

  // Optimistic state
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }

    if (isPending) return;

    // Optimistic update
    const newIsFavorite = !isFavorite;
    setIsFavorite(newIsFavorite);

    toggleFavorite(galleryItemId, {
      onError: () => {
        // Revert on error
        setIsFavorite(isFavorite);
      },
    });
  };

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'flex items-center gap-1 transition-colors',
        isFavorite
          ? 'text-yellow-500'
          : 'text-muted-foreground hover:text-yellow-500',
        isPending && 'opacity-50 cursor-not-allowed',
        className
      )}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Bookmark
        className={cn(
          sizeClasses[size],
          'transition-all',
          isFavorite && 'fill-current scale-110'
        )}
      />
    </button>
  );
}
