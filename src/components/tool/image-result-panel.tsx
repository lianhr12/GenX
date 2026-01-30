'use client';

/**
 * Image Result Panel Component
 * Displays generated images in a grid layout
 */

import { Download, Loader2, Sparkles, Trash2, ZoomIn } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  createdAt: Date;
}

interface ImageResultPanelProps {
  images: GeneratedImage[];
  isGenerating?: boolean;
  onClear?: () => void;
}

export function ImageResultPanel({
  images,
  isGenerating = false,
  onClear,
}: ImageResultPanelProps) {
  const t = useTranslations('ToolPage.result');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    null
  );

  // Empty state
  if (!isGenerating && images.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-lg">
          {/* Decorative element */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-3xl" />
            <div className="relative bg-muted/80 border border-border rounded-2xl p-8 backdrop-blur-sm">
              <div className="text-5xl mb-4">🎨</div>
              <h4 className="text-lg font-semibold text-foreground mb-1">
                {t('imageEmptyTitle')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t('imageEmptyDescription')}
              </p>
            </div>
          </div>

          {/* Main text */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">
              {t('readyToCreate')}
            </h3>
          </div>

          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            {t('imageReadyDescription')}
          </p>

          {/* Feature highlights */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {t('featureMultiModel')}
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {t('featureHighRes')}
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground" />
              {t('featureFast')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Generating state
  if (isGenerating && images.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t('generatingImages')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t('generatingImagesDescription')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">
          {t('generatedImages')} ({images.length})
        </h3>
        {images.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('clearAll')}
          </button>
        )}
      </div>

      {/* Image Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Generating placeholder */}
          {isGenerating && (
            <div className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  {t('generating')}
                </p>
              </div>
            </div>
          )}

          {/* Generated images */}
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onSelect={() => setSelectedImage(image)}
            />
          ))}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <ImagePreviewModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

interface ImageCardProps {
  image: GeneratedImage;
  onSelect: () => void;
}

function ImageCard({ image, onSelect }: ImageCardProps) {
  const t = useTranslations('ToolPage.result');

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const retryCount = Number(img.dataset.retryCount || 0);
    if (retryCount < 3) {
      img.dataset.retryCount = String(retryCount + 1);
      setTimeout(
        () => {
          img.src = `${image.url}${image.url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
        },
        1000 * (retryCount + 1)
      );
    }
  };

  return (
    <div className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
      <img
        src={image.url}
        alt={image.prompt}
        className="w-full h-full object-cover"
        onError={handleImageError}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
        <button
          onClick={onSelect}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          title={t('preview')}
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>
        <a
          href={image.url}
          download={`image-${image.id}.png`}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          title={t('download')}
        >
          <Download className="w-5 h-5 text-white" />
        </a>
      </div>

      {/* Model badge */}
      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-xs">
        {image.model}
      </div>
    </div>
  );
}

interface ImagePreviewModalProps {
  image: GeneratedImage;
  onClose: () => void;
}

function ImagePreviewModal({ image, onClose }: ImagePreviewModalProps) {
  const t = useTranslations('ToolPage.result');

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const retryCount = Number(img.dataset.retryCount || 0);
    if (retryCount < 3) {
      img.dataset.retryCount = String(retryCount + 1);
      setTimeout(
        () => {
          img.src = `${image.url}${image.url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
        },
        1000 * (retryCount + 1)
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-card rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <img
          src={image.url}
          alt={image.prompt}
          className="max-w-full max-h-[70vh] object-contain"
          onError={handleImageError}
        />

        {/* Info */}
        <div className="p-4 border-t border-border">
          <p className="text-sm text-foreground mb-2 line-clamp-2">
            &ldquo;{image.prompt}&rdquo;
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t('model')}: {image.model}
            </span>
            <a
              href={image.url}
              download={`image-${image.id}.png`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t('download')}
            </a>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default ImageResultPanel;
