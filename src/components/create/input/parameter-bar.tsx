'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  aspectRatioOptions,
  durationOptions,
  resolutionOptions,
} from '@/config/create';
import { cn } from '@/lib/utils';
import { useCreateStore } from '@/stores/create-store';
import {
  ArrowUpIcon,
  ChevronDownIcon,
  ClockIcon,
  MoreHorizontalIcon,
  MusicIcon,
  VideoIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ParameterBar() {
  const t = useTranslations('CreatePageNew.input.parameters');
  const {
    aspectRatio,
    setAspectRatio,
    duration,
    setDuration,
    resolution,
    setResolution,
    prompt,
    isGenerating,
  } = useCreateStore();

  const credits = durationOptions.find((d) => d.id === duration)?.credits || 10;

  const paramButtonClass = cn(
    'flex h-9 cursor-pointer items-center rounded-lg px-3 py-2 text-sm transition-colors duration-300',
    'bg-muted/50 hover:bg-muted'
  );

  return (
    <div className="flex items-center justify-between overflow-hidden pt-4">
      {/* Left side - Parameters */}
      <div className="flex h-9 origin-top items-center gap-1 transition-all duration-300 ease-in-out">
        {/* AI Video Select */}
        <Select defaultValue="video">
          <SelectTrigger
            className={cn(
              'h-9 gap-1.5 border-none bg-muted/50 px-3',
              '[&>span]:bg-gradient-to-r [&>span]:from-[#FF8F34] [&>span]:via-[#FF5F62] [&>span]:to-[#FF34AA] [&>span]:bg-clip-text [&>span]:text-transparent'
            )}
          >
            <VideoIcon className="size-5 bg-gradient-to-r from-[#FF8F34] to-[#FF34AA]" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">AI Video</SelectItem>
          </SelectContent>
        </Select>

        {/* Mode Select */}
        <Select defaultValue="text-to-video">
          <SelectTrigger className="h-9 gap-1.5 border-none bg-muted/50 px-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text-to-video">Text/Image to Video</SelectItem>
            <SelectItem value="image-to-video">Image to Video</SelectItem>
          </SelectContent>
        </Select>

        {/* Model Select */}
        <Select defaultValue="wan-2.6">
          <SelectTrigger className="h-9 min-w-16 gap-1 border-none bg-muted/50 px-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wan-2.6">Wan 2.6</SelectItem>
            <SelectItem value="kling-1.6">Kling 1.6</SelectItem>
          </SelectContent>
        </Select>

        {/* Aspect Ratio, Duration, Resolution */}
        <div className={cn(paramButtonClass, 'gap-2')}>
          {/* Aspect Ratio */}
          <div className="flex items-center gap-1">
            <div
              className="border-[1.5px] border-current"
              style={{
                width: '12px',
                aspectRatio:
                  aspectRatioOptions.find((o) => o.id === aspectRatio)?.value ||
                  '16/9',
              }}
            />
            <span>{aspectRatio}</span>
          </div>

          <Separator orientation="vertical" className="h-4" />

          {/* Duration */}
          <div className="flex items-center gap-1">
            <ClockIcon className="size-4" />
            <span>{duration}</span>
          </div>

          <Separator orientation="vertical" className="h-4" />

          {/* Resolution */}
          <span>{resolution}</span>
        </div>

        {/* Audio */}
        <div className={cn(paramButtonClass, 'gap-1.5')}>
          <MusicIcon className="size-4" />
          <span>Audio</span>
        </div>

        {/* More Options */}
        <button type="button" className={cn(paramButtonClass, 'p-2.5')}>
          <MoreHorizontalIcon className="size-4" />
        </button>
      </div>

      {/* Right side - Credits and Submit */}
      <div className="flex h-9 items-center justify-between gap-2">
        <div className="block">
          <div className="flex flex-col items-end gap-[2px]">
            <span className="inline-flex items-center gap-[2px] text-xs leading-none text-muted-foreground">
              {credits} Credits
            </span>
          </div>
        </div>
        <Button
          type="submit"
          size="icon"
          variant="outline"
          className={cn(
            '!size-9 rounded-full border-none',
            prompt.trim()
              ? 'bg-white text-black hover:bg-white/90'
              : 'bg-muted text-muted-foreground'
          )}
          disabled={!prompt.trim() || isGenerating}
        >
          <ArrowUpIcon className="size-5" />
        </Button>
      </div>
    </div>
  );
}
