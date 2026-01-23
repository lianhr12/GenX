/**
 * Art Styles Configuration
 * Defines available art styles for video generation
 */

export interface ArtStyle {
  id: string;
  name: string;
  icon: string;
  description: string;
  promptSuffix: string;
  previewImage?: string;
}

export const artStyles: ArtStyle[] = [
  {
    id: 'default',
    name: 'Default',
    icon: '✨',
    description: 'AI auto style',
    promptSuffix: '',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    icon: '🌃',
    description: 'Neon future',
    promptSuffix:
      ', cyberpunk style, neon lights, futuristic city, digital rain, glowing effects',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    icon: '🎨',
    description: 'Poetic flow',
    promptSuffix:
      ', watercolor painting style, soft brush strokes, colors bleeding and mixing, dreamy atmosphere',
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    icon: '🖼️',
    description: 'Timeless classic',
    promptSuffix:
      ', oil painting style, visible brush strokes, classical art lighting, renaissance mood',
  },
  {
    id: 'anime',
    name: 'Anime',
    icon: '🎌',
    description: 'Anime portal',
    promptSuffix:
      ', anime style, studio ghibli inspired, vibrant colors, flowing hair, soft lens flare',
  },
  {
    id: 'fluid-art',
    name: 'Fluid Art',
    icon: '🌊',
    description: 'Dancing colors',
    promptSuffix:
      ', fluid art style, colors swirling like liquid marble, organic flowing patterns, mesmerizing motion',
  },
];

/**
 * Get art style by ID
 */
export function getArtStyleById(id: string): ArtStyle | undefined {
  return artStyles.find((style) => style.id === id);
}

/**
 * Get default art style
 */
export function getDefaultArtStyle(): ArtStyle {
  if (artStyles.length === 0) {
    // Fallback if array is somehow empty
    return {
      id: 'default',
      name: 'Default',
      icon: '✨',
      description: 'AI auto style',
      promptSuffix: '',
    };
  }
  return artStyles[0];
}

/**
 * Apply art style to prompt
 */
export function applyArtStyleToPrompt(prompt: string, styleId: string): string {
  const style = getArtStyleById(styleId);
  if (!style || style.id === 'default') {
    return prompt;
  }
  return prompt + style.promptSuffix;
}
