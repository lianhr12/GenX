/**
 * Art Styles UI Configuration
 * Defines visual assets and styling for art style display components
 */

import {
  Brush,
  Film,
  type LucideIcon,
  Palette,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface ArtStyleUI {
  id: string;
  slug: string;
  icon: LucideIcon;
  gradientColor: string;
  gradient: string;
  iconColor: string;
  bgColor: string;
  bgColorSolid: string;
  borderColor: string;
  hoverBorderColor: string;
  video: string;
  poster: string;
  seoKeywords: string[];
}

export const artStylesUI: ArtStyleUI[] = [
  {
    id: 'cyberpunk',
    slug: 'cyberpunk',
    icon: Zap,
    gradientColor: 'from-cyan-500 to-purple-500',
    gradient: 'from-purple-600 via-pink-500 to-cyan-400',
    iconColor: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    bgColorSolid: 'bg-purple-950',
    borderColor: 'border-cyan-500/20',
    hoverBorderColor: 'hover:border-cyan-500/50',
    video: 'https://asset.genx.art/home/video/1769828074664.mp4',
    poster: 'https://asset.genx.art/home/styles/cyberpunk.png',
    seoKeywords: [
      'cyberpunk video',
      'neon art',
      'futuristic video',
      'sci-fi video generator',
    ],
  },
  {
    id: 'watercolor',
    slug: 'watercolor',
    icon: Brush,
    gradientColor: 'from-blue-400 to-teal-400',
    gradient: 'from-blue-400 via-teal-300 to-emerald-400',
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    bgColorSolid: 'bg-blue-950',
    borderColor: 'border-blue-400/20',
    hoverBorderColor: 'hover:border-blue-400/50',
    video: 'https://asset.genx.art/home/video/1769828795276.mp4',
    poster: 'https://asset.genx.art/home/styles/watercolor.png',
    seoKeywords: [
      'watercolor video',
      'painting animation',
      'artistic video',
      'watercolor effect',
    ],
  },
  {
    id: 'oilPainting',
    slug: 'oil-painting',
    icon: Palette,
    gradientColor: 'from-amber-500 to-orange-500',
    gradient: 'from-amber-600 via-orange-500 to-yellow-400',
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    bgColorSolid: 'bg-amber-950',
    borderColor: 'border-amber-500/20',
    hoverBorderColor: 'hover:border-amber-500/50',
    video: 'https://asset.genx.art/home/video/1769829229563.mp4',
    poster: 'https://asset.genx.art/home/styles/painting1.png',
    seoKeywords: [
      'oil painting video',
      'classic art video',
      'renaissance style',
      'painting animation',
    ],
  },
  {
    id: 'anime',
    slug: 'anime',
    icon: Sparkles,
    gradientColor: 'from-pink-500 to-rose-500',
    gradient: 'from-pink-500 via-rose-400 to-red-400',
    iconColor: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    bgColorSolid: 'bg-pink-950',
    borderColor: 'border-pink-500/20',
    hoverBorderColor: 'hover:border-pink-500/50',
    video: 'https://asset.genx.art/home/video/1769829499967.mp4',
    poster: 'https://asset.genx.art/home/styles/cartoon.png',
    seoKeywords: [
      'anime video',
      'anime style generator',
      'japanese animation',
      'manga video',
    ],
  },
  {
    id: 'fluidArt',
    slug: 'fluid-art',
    icon: Film,
    gradientColor: 'from-violet-500 to-fuchsia-500',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    iconColor: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    bgColorSolid: 'bg-indigo-950',
    borderColor: 'border-violet-500/20',
    hoverBorderColor: 'hover:border-violet-500/50',
    video: 'https://asset.genx.art/home/video/176982969377601.mp4',
    poster: 'https://asset.genx.art/home/styles/fluid-art.png',
    seoKeywords: [
      'fluid art video',
      'abstract video',
      'color flow animation',
      'psychedelic video',
    ],
  },
];

export const validStyleSlugs = artStylesUI.map((s) => s.slug);

export function getStyleBySlug(slug: string): ArtStyleUI | undefined {
  return artStylesUI.find((s) => s.slug === slug);
}

export function getStyleById(id: string): ArtStyleUI | undefined {
  return artStylesUI.find((s) => s.id === id);
}
