// src/components/generator/config/home-prompts.ts

export interface HomePrompt {
  id: string;
  title: string;
  prompt: string;
  category: 'video' | 'image';
}

export const HOME_PROMPTS: HomePrompt[] = [
  {
    id: 'modern-intimate',
    title: 'Modern Intimate 💿',
    prompt:
      'Intimate close-up shot in a cozy, softly lit bedroom. The man is sitting on the edge of the bed, facing the camera, speaking directly with sincere and engaged expressions. The woman sits behind him on the bed, leaning slightly forward, listening intently. One hand rests lightly on her knee, while her other hand playfully rests on the back of his head. Subtle, slow hand and head movements, natural eye contact. Warm, cinematic lighting, shallow depth of field, realistic textures.',
    category: 'video',
  },
  {
    id: 'neon-drift',
    title: 'Neon Drift',
    prompt:
      'Cinematic shot of a neon-lit street race. A sleek, heavily customized tuner car drifts around a tight corner at night, its tires smoking, neon underglow streaking through the mist. The camera follows in a smooth arc, blurring the background neon signs and cityscape for added speed and drama. Light trails from traffic and distant headlights. Smoke, sparks, vibrant pinks, purples, and blues. Urban night racing atmosphere, high energy, sharp focus on the car, motion blur on surroundings.',
    category: 'video',
  },
  {
    id: 'epic-fantasy',
    title: 'Epic Fantasy',
    prompt:
      'Cinematic wide-angle low-angle shot of a lone warrior standing at the edge of a cliff, silhouetted against a massive glowing sunset. A towering dragon circles in the distance, wings outstretched, casting a vast shadow over ancient ruins below. Wind gently moves the warrior\'s cloak, sword held steady. Dramatic lighting with warm oranges and deep purples. Mystical atmosphere, fantasy landscape, high detail in armor and dragon scales. Mist rolling through the valley. Heroic, epic tone.',
    category: 'video',
  },
  {
    id: 'saiyan-transformation',
    title: 'Saiyan Transformation',
    prompt:
      'Anime-style close-up as a warrior undergoes a dramatic transformation. Muscles ripple and expand, hair lifts and shifts color from black to glowing gold, and eyes flare with intense energy. Surrounding air crackles with electrical arcs and bursts of light. Dust and rubble lift from the ground. Background blurs with motion lines and radiant beams. Explosive power aura surrounds the character. Vibrant colors, sharp highlights, dramatic shadows. High-energy DBZ-inspired transformation scene, 2D animated style.',
    category: 'video',
  },
  {
    id: 'doorstep-trumpeter',
    title: 'Doorstep Trumpeter 🎺',
    prompt:
      'Video footage First-person view from a doorbell camera. A man in a bright costume stands on a front porch, raising a trumpet to his lips. He plays a short, lively tune, then lowers the instrument, waves cheerfully at the camera, and walks off-screen. Overcast suburban morning. Soft natural daylight, realistic home exterior, doormat visible in frame. Casual, lighthearted tone, no background music, only trumpet sound. Real-world candid feel, typical suburban doorstep setup.',
    category: 'video',
  },
  {
    id: 'bodycam-christmas',
    title: 'Bodycam Christmas',
    prompt:
      'Body camera footage style. First-person perspective walking through a dimly lit home filled with Christmas decorations. Handheld, shaky motion. The camera moves past a glowing tree with flickering lights, then down a narrow hallway. A shadowy figure briefly appears at the end of the corridor before vanishing. Red and green holiday lights cast eerie, shifting patterns on walls. Low contrast, grainy texture, tense atmosphere. Silent except for footsteps and faint creaking. Horror tone with festive setting.',
    category: 'video',
  },
  {
    id: 'crowning',
    title: '👑 Crowning',
    prompt:
      'A royal ceremony captured in a grand hall. A figure draped in elegant robes kneels before an ornate throne. Above them, a golden crown slowly descends, held by an unseen hand or floating in mid-air, radiating soft divine light. The crown gently settles onto the figure\'s head. Camera slowly zooms in. Torches flicker on stone walls, casting warm amber light. Majestic, cinematic atmosphere. Rich textures in fabric, metal, and stone. Slow, deliberate motion, reverent tone. Medieval or fantasy setting, regal and ceremonial.',
    category: 'video',
  },
  {
    id: 'hat4pet',
    title: 'Hat4Pet',
    prompt:
      'Playful close-up of a small pet (cat or dog) sitting calmly on a soft surface. A tiny novelty hat—such as a sombrero, wizard hat, or party hat—gently descends from above and lands perfectly on the pet\'s head. The pet blinks, tilts its head slightly, or twitches its ears in mild confusion, but remains still. Bright, soft natural lighting. Clean background, warm and cozy indoor setting. Cute, lighthearted tone. Realistic fur texture, shallow depth of field, charming and endearing.',
    category: 'video',
  },
  {
    id: 'reverse-lighting',
    title: 'Reverse Lighting',
    prompt:
      'Cinematic portrait in a dark room. A single bright light source positioned behind the subject creates a strong rim light, outlining their silhouette in glowing edges. The face remains in shadow, with only subtle detail visible. Minimal front lighting—just a faint glow from a distant window or candle. Dramatic, moody atmosphere. High contrast, deep blacks, sharp highlights. Subject turns head slowly, light traces along hair and shoulders. Mysterious, artistic tone. Shallow depth of field, muted or monochrome color palette.',
    category: 'video',
  },
  {
    id: 'winter-storytown',
    title: 'Winter Storytown 🏔️🎥',
    prompt:
      'Aerial cinematic shot of a snow-covered alpine village at dusk. Warm golden light glows from cozy cabin windows, smoke rises gently from chimneys into the cold evening air. Snow blankets rooftops, streets, and surrounding pine trees. The camera slowly glides over the village, revealing winding cobblestone paths and a central square with a softly lit Christmas tree. Peaceful, nostalgic atmosphere. Muted blues and warm oranges. Realistic snow textures, soft focus in distance, serene and magical winter mood.',
    category: 'video',
  },
  {
    id: 'family-talk-show',
    title: 'Family Talk Show 🎬',
    prompt:
      'Multi-camera television studio setup. A warmly lit talk show stage with a cozy couch and two armchairs arranged in a semi-circle. A friendly host sits in the center, gesturing as they speak to a family seated on the couch—parents and one or two children. Everyone is casually dressed, smiling, engaged in conversation. Audience visible in soft-focus background, clapping occasionally. Bright studio lighting, professional broadcast quality, warm color tones. Clean, polished aesthetic. Wholesome, lighthearted family-friendly tone.',
    category: 'video',
  },
  {
    id: 'pet-weightlift',
    title: 'Pet Weightlift',
    prompt:
      'Humorous close-up of a small pet (cat or hamster) positioned next to a tiny toy barbell. The pet\'s paws rest on the bar as if gripping it. The barbell slowly lifts a few inches off the surface, held by an invisible string or the pet\'s slight movement. The animal looks directly at the camera with a serious or determined expression. Bright, playful lighting. Clean, simple background. Fun, comedic tone with realistic pet behavior and expressions. Cute, internet-style pet content.',
    category: 'video',
  },
  {
    id: 'playhouse-builder',
    title: 'Playhouse Builder 🎈',
    prompt:
      'Time-lapse or sped-up footage of a cardboard fort being assembled in a living room. Hands quickly fold, tape, and stack colorful boxes and sheets. Windows and doors are cut out. Markers draw decorations. A child\'s toys and blankets are added inside. The camera stays stationary, capturing the entire process from overhead or corner angle. Bright indoor lighting, warm homey atmosphere. Playful, wholesome family activity vibe. Creative, DIY aesthetic. No background music, just ambient sounds of tape and movement.',
    category: 'video',
  },
  {
    id: 'spoken-to-the-wind',
    title: 'Spoken to the Wind 🎬',
    prompt:
      'Cinematic slow-motion scene of a person standing on a windswept hillside at sunset. They speak quietly, but their words are carried away by the wind—hair and clothing ripple dramatically. The camera slowly orbits around them as they look off into the distance, expression thoughtful or melancholic. Golden hour lighting, lens flare from the setting sun. Tall grass sways in waves. Emotional, poetic tone. Shallow depth of field, rich warm colors, contemplative atmosphere. Indie film aesthetic.',
    category: 'video',
  },
  {
    id: 'kitchen-asmr',
    title: 'Kitchen ASMR 🧄',
    prompt:
      'First-person overhead view of a clean kitchen counter. Hands carefully peel and chop fresh garlic cloves on a wooden cutting board. Each motion is slow and deliberate. The sound of the knife tapping rhythmically on the board is prominent. Soft natural window light. Minimalist, aesthetic kitchen setup with neutral tones—white, wood, and green herbs nearby. Calming, sensory-focused video. No music, only the crisp sounds of chopping. Relaxing, ASMR-style cooking content.',
    category: 'video',
  },
  {
    id: 'astro-cat-falls',
    title: 'Astro Cat Falls 🐱🚀',
    prompt:
      'Zero-gravity interior of a futuristic spacecraft. A cat in a tiny custom space suit floats weightlessly in the cabin, slowly tumbling end over end in mid-air. Its paws flail slightly, ears perk up inside the clear helmet. The camera slowly rotates around the floating cat. Soft blue and white lighting from control panels and windows showing distant stars. Whimsical, lighthearted tone. Realistic space environment with floating objects—pens, tablets, food pouches. Charming and playful sci-fi pet content.',
    category: 'video',
  },
  {
    id: 'stardew-valley-style',
    title: 'Stardew Valley Style',
    prompt:
      'Top-down 2D pixel art animation of a small farm. A character walks across the screen, waters crops with a watering can, and pets a chicken. The crops sway gently. A dog runs in from the side, tail wagging. Bright, cheerful colors—lush green grass, blue sky, brown soil. Simple, clean pixel aesthetic with soft outlines and gentle animations. Calm, cozy farming game vibe. No dialogue, ambient outdoor sounds like wind and birds. Wholesome, nostalgic indie game style.',
    category: 'video',
  },
  {
    id: 'soft-tease',
    title: 'Soft Tease',
    prompt:
      'Close-up cinematic portrait of a person looking directly into the camera with a subtle, knowing smile. They tilt their head slightly, raise one eyebrow, and gently bite their lower lip. Soft, diffused lighting from the side casts delicate shadows across their face. Shallow depth of field, blurred background. Warm or neutral tones. Slow, deliberate facial movements. Intimate, playful, slightly flirtatious tone. High detail in eyes and skin texture. Fashion or beauty editorial style.',
    category: 'video',
  },
  {
    id: 'dino-arrival',
    title: 'Dino Arrival',
    prompt:
      'Cinematic wide-angle shot from ground level in a dense jungle clearing. The earth rumbles, trees sway, and birds scatter into the sky. A massive dinosaur—triceratops or T-rex—steps into view from the mist, its silhouette backlit by hazy sunlight filtering through the canopy. The camera slowly tilts upward to reveal its full scale. Heavy footsteps shake the ground, leaves and dust fall. Dramatic prehistoric atmosphere, earthy greens and browns, realistic reptilian textures. Jurassic, epic tone.',
    category: 'video',
  },
  {
    id: 'upset',
    title: 'UPSET 😤',
    prompt:
      'Extreme close-up of a person\'s face showing frustration. Eyebrows furrow tightly, nostrils flare, jaw clenches. They exhale sharply and look away from the camera, shaking their head slightly. Shallow depth of field focuses sharply on the eyes and expression. Harsh or neutral lighting emphasizes tension. Muted or cool color grading. Minimal movement, maximum emotion in facial micro-expressions. Relatable, emotional, short-form content style. No dialogue, just visible emotion and breath.',
    category: 'video',
  },
  {
    id: 'minimal-motion',
    title: 'Minimal Motion',
    prompt:
      'Cinematic underwater realism. A woman floats motionless in deep water, suspended as if time has stopped. Only subtle breathing and barely perceptible hair movement are visible. Soft blue-green light filters from above, illuminating her face while the background fades into darkness. Her eyes are open, calm, and introspective, unfocused, as if lost in thought. Fine particles drift slowly, enhancing silence and depth. Locked camera, slow emotional tone, realistic skin texture.',
    category: 'video',
  },
  {
    id: 'frozen-air-ride',
    title: 'Frozen Air Ride 🥶',
    prompt:
      'Steady pace with near buildings, streetlights, and utility poles providing layered parallax and occasional near foreground occluders. Using a 35mm lens with shallow depth of field, the rider and bike remain sharply isolated against the gently blurred street and sky backdrop. Evening light blends with subtle streetlamp glows that cast soft highlights on the bike frame and rider\'s clothes. The shot finishes on a dynamic three-quarter angle emphasizing both the action and environment, anchored by floating dust particles that read cleanly in the ultra-slow frozen scene.',
    category: 'video',
  },
  {
    id: 'church-stained-glass',
    title: 'Church Stained Glass',
    prompt:
      'Multicolored light projects soft geometric patterns onto the ancient stone floor, dust drifting in visible light beams. A woman in a flowing white silk gown walks into the illuminated area, seen as a soft silhouette against the window, her side profile subtly defined by delicate rim light. The camera slowly pushes in to her hand as she gently reaches toward the light; at the moment her fingertips touch it, the glow softly trembles and releases faint blue halo particles. Cool blue and purple tones dominate, accented by stained-glass colors. Soft natural light, low contrast, dreamlike atmosphere. Ultra-realistic, cinematic, 4K.',
    category: 'video',
  },

  // ======== Image Prompts ========
  {
    id: 'vibe-siren',
    title: 'Vibe Siren 🎭',
    prompt:
      'A glamorous young woman striking a confident, flirtatious pose, stylish high-fashion outfit, soft cinematic lighting, flawless skin and hair details, subtle sensuality, dreamy blurred background, photorealistic, 8K, highly detailed, editorial fashion photography vibe',
    category: 'image',
  },
  {
    id: 'birthday-card',
    title: 'Birthday Card 🎂',
    prompt:
      'A festive birthday card illustration, cute and cheerful style, colorful balloons, confetti, cakes, and gifts, whimsical typography space for a message, bright and joyful atmosphere, hand-drawn or digital art style, 8K, detailed and charming, perfect for celebration.',
    category: 'image',
  },
  {
    id: 'moon-carry',
    title: 'Moon Carry 🌙',
    prompt:
      'moon-interaction concepts: holding the moon above their hands, carrying the moon on their shoulder, pinching the moon between fingers, hugging the moon, pushing the moon away, pulling the moon with a rope, dragging the moon closer, kicking the moon, balancing the moon on their foot, resting their cheek on the moon, lifting the moon like a balloon, wearing the moon as a hat, holding the moon in their palm, rolling the moon on the ground, dribbling the moon like a ball, pulling a moon out of a bag, kissing the moon, tossing the moon into the air, using the moon as a lantern, screwing the moon into the sky like a lightbulb, walking a moon on a leash, hiding behind the moon, revealing the moon by opening sky-curtains, juggling multiple moons, stacking moons like stones, riding the moon, leaning back onto the moon as a chair, using the moon as a spotlight, catching the moon with a net, or catching a falling moon. Scene set in a deep blue cinematic night sky with warm golden moonlight reflecting onto the person. Surreal, whimsical, dreamy, postcard-style aesthetic.',
    category: 'image',
  },
  {
    id: 'pet-on-trip',
    title: 'Pet on Trip 🐶',
    prompt:
      'The image shows a gray puppy against the backdrop of the Sydney Opera House in Australia, highlighting its fine fur, backlighting, blue sky, grass, and happy puppy. The photo has a realistic, real-life feel. A mobile phone is mounted on a tripod in the picture, taking a picture of the puppy. You can see the phone screen, which displays the corresponding perspective.',
    category: 'image',
  },
  {
    id: 'neon-phone-clash',
    title: 'Neon Phone Clash 📱',
    prompt:
      'A bold young woman leaning out of a public phone booth, thrusting a classic green telephone receiver toward the camera, extreme ultra-wide fisheye perspective from a low angle, dynamic motion and intense depth distortion, rainy urban night with glowing red and blue neon signs reflecting on wet pavement, cold fluorescent booth lighting contrasting with vibrant city lights, stylish winter outfit with chunky boots, gritty lo-fi cinematic vibe, high contrast, film grain, moody atmosphere, photorealistic, ultra-detailed textures, editorial street photography style, 8K.',
    category: 'image',
  },
  {
    id: 'ccd-christmas-mood',
    title: 'CCD Christmas Mood 🎄',
    prompt:
      'A vertical two-panel indoor Christmas portrait with CCD film grain texture and candid photography style, soft lighting with gentle glow effect. Top panel: person near Christmas tree, smiling and relaxed, face turned to the left side, background featuring lit Christmas tree with red bows and warm yellow string lights, static artistic composition. Bottom panel: same person in sitting position, holding a wrapped Christmas gift box, facing camera with smile, slightly tilted head, relaxed and healing expression, background showing the same Christmas decorated indoor space with photo wall, warm lights and Christmas tree decorations. Both panels maintain unified style but different poses, natural soft hair with slight airy feel. Fuji film color tone with subtle cool-warm Winter Christmas atmosphere, presented as realistic candid shooting effect. Output images only, no text.',
    category: 'image',
  },
  {
    id: 'pet-magazine',
    title: 'Pet Magazine 🐾',
    prompt:
      'A luxurious magazine-style portrait featuring the subject lounging confidently in an elegant vintage armchair. The subject is styled with spa-like accessories such as a white bathrobe, towel turban, or sunglasses, giving a humorous yet refined celebrity aesthetic. Warm studio lighting creates soft shadows and golden highlights. Background remains minimal and classy, emphasizing premium lifestyle photography. Add subtle magazine typography at the top, clean layout, and balanced composition. Ultra-realistic, high-end editorial photography, rich texture details, cozy luxury atmosphere.',
    category: 'image',
  },
  {
    id: 'tokyo-hotline-rush',
    title: 'Tokyo Hotline Rush 🌸',
    prompt:
      'A dramatic street-style portrait shot with exaggerated fisheye lens distortion, a confident girl aggressively reaching toward the camera with a green phone receiver, stretched coiled cable leading back into a neon-lit phone booth, rainy Tokyo night setting, glossy reflections on asphalt, cinematic lighting with cool highlights and neon color spill, fashion-forward outfit, strong attitude and motion energy, Wong Kar-wai inspired mood, lo-fi aesthetics, hyper-realistic details, shallow depth of field, cinematic composition, 8K photorealism.',
    category: 'image',
  },
  {
    id: 'album-cover',
    title: 'Album Cover 🎸🎤',
    prompt:
      'Transform the image into a retro-style cassette album set displayed on a full wooden tabletop. The scene must include three key objects arranged naturally: Cassette tape case featuring the subject\'s portrait from the neck up, printed as an album-style headshot. The cover should include realistic album details such as: album title, artist name, track label, release date, and other small printed text typical of cassette packaging. The subject\'s facial features, hairstyle, and accessories must remain identical to the input photo. A transparent cassette tape deck/player, placed beside the case, with visible reels and mechanical details. Wired earphones, casually placed on the wooden table to reinforce the retro music aesthetic. Use realistic lighting and shadows, warm tones, and a nostalgic analogue mood. The wooden tabletop background must be fully visible across the entire image, not cropped or partial. Output image only, no additional text.',
    category: 'image',
  },
  {
    id: 'into-the-wild',
    title: 'Into the Wild 🦌🌿',
    prompt:
      'A lush Western forest landscape in cool teal-green tones, panoramic wide view, dense evergreen trees, misty air, clear streams and mossy rocks, soft diffused daylight, calm and refreshing atmosphere, rich cyan and emerald greens, cinematic composition, ultra-realistic textures, 8K resolution, perfect for desktop wallpaper.',
    category: 'image',
  },
];
