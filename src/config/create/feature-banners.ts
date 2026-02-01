import type { FeatureBanner } from './types';

export const featureBanners: FeatureBanner[] = [
  {
    id: 'image-to-video',
    titleKey: 'imageToVideo.title',
    descriptionKey: 'imageToVideo.description',
    image: '/images/banners/image-to-video.jpg',
    href: '/create/image-to-video',
    gradient: 'from-purple-600 via-pink-500 to-red-500',
    badge: 'hot',
  },
  {
    id: 'text-to-video',
    titleKey: 'textToVideo.title',
    descriptionKey: 'textToVideo.description',
    image: '/images/banners/text-to-video.jpg',
    href: '/create/text-to-video',
    gradient: 'from-blue-600 via-cyan-500 to-teal-500',
    badge: 'new',
  },
  {
    id: 'ai-effects',
    titleKey: 'aiEffects.title',
    descriptionKey: 'aiEffects.description',
    image: '/images/banners/ai-effects.jpg',
    href: '/create/effects',
    gradient: 'from-orange-600 via-amber-500 to-yellow-500',
  },
  {
    id: 'video-extend',
    titleKey: 'videoExtend.title',
    descriptionKey: 'videoExtend.description',
    image: '/images/banners/video-extend.jpg',
    href: '/create/extend',
    gradient: 'from-green-600 via-emerald-500 to-teal-500',
  },
];
