export interface Suggestion {
  text: string;
  prompt: string;
}

const basePrompts: { text: string; prompt: string }[] = [
  {
    text: 'Vibe Siren',
    prompt:
      'A glamorous young woman striking a confident, flirtatious pose, stylish high-fashion outfit, soft cinematic lighting, flawless skin and hair details, subtle sensuality, dreamy blurred background, photorealistic, 8K, highly detailed, editorial fashion photography vibe',
  },
  {
    text: 'Birthday Card',
    prompt:
      'A festive birthday card illustration, cute and cheerful style, colorful balloons, confetti, cakes, and gifts, whimsical typography space for a message, bright and joyful atmosphere, hand-drawn or digital art style, 8K, detailed and charming, perfect for celebration.',
  },
  {
    text: 'Moon Carry',
    prompt:
      'moon-interaction concepts: holding the moon above their hands, carrying the moon on their shoulder, hugging the moon, lifting the moon like a balloon, wearing the moon as a hat. Scene set in a deep blue cinematic night sky with warm golden moonlight reflecting onto the person. Surreal, whimsical, dreamy, postcard-style aesthetic.',
  },
  {
    text: 'Pet on Trip',
    prompt:
      'The image shows a gray puppy against the backdrop of the Sydney Opera House in Australia, highlighting its fine fur, backlighting, blue sky, grass, and happy puppy. The photo has a realistic, real-life feel. A mobile phone is mounted on a tripod in the picture, taking a picture of the puppy.',
  },
  {
    text: 'Neon Phone Clash',
    prompt:
      'A bold young woman leaning out of a public phone booth, thrusting a classic green telephone receiver toward the camera, extreme ultra-wide fisheye perspective from a low angle, rainy urban night with glowing red and blue neon signs reflecting on wet pavement, gritty lo-fi cinematic vibe, high contrast, film grain, moody atmosphere, photorealistic, ultra-detailed textures, editorial street photography style, 8K.',
  },
  {
    text: 'CCD Christmas Mood',
    prompt:
      'A vertical two-panel indoor Christmas portrait with CCD film grain texture and candid photography style, soft lighting with gentle glow effect. Person near Christmas tree, smiling and relaxed, background featuring lit Christmas tree with red bows and warm yellow string lights. Fuji film color tone with subtle cool-warm Winter Christmas atmosphere.',
  },
  {
    text: 'Pet Magazine',
    prompt:
      'A luxurious magazine-style portrait featuring the subject lounging confidently in an elegant vintage armchair. The subject is styled with spa-like accessories such as a white bathrobe, towel turban, or sunglasses, giving a humorous yet refined celebrity aesthetic. Warm studio lighting creates soft shadows and golden highlights.',
  },
  {
    text: 'Tokyo Hotline Rush',
    prompt:
      'A dramatic street-style portrait shot with exaggerated fisheye lens distortion, a confident girl aggressively reaching toward the camera with a green phone receiver, rainy Tokyo night setting, glossy reflections on asphalt, cinematic lighting with cool highlights and neon color spill, Wong Kar-wai inspired mood, lo-fi aesthetics, hyper-realistic details, 8K photorealism.',
  },
  {
    text: 'Album Cover',
    prompt:
      'Transform the image into a retro-style cassette album set displayed on a full wooden tabletop. Cassette tape case featuring a portrait, a transparent cassette tape deck/player with visible reels, and wired earphones casually placed on the wooden table. Realistic lighting and shadows, warm tones, and a nostalgic analogue mood.',
  },
  {
    text: 'Into the Wild',
    prompt:
      'A lush Western forest landscape in cool teal-green tones, panoramic wide view, dense evergreen trees, misty air, clear streams and mossy rocks, soft diffused daylight, calm and refreshing atmosphere, rich cyan and emerald greens, cinematic composition, ultra-realistic textures, 8K resolution, perfect for desktop wallpaper.',
  },
];

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomSuggestions(count = 5): Suggestion[] {
  const shuffledPrompts = shuffle(basePrompts);

  return shuffledPrompts.slice(0, count).map((item) => ({
    text: item.text,
    prompt: item.prompt,
  }));
}
