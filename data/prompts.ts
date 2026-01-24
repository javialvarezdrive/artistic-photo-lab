
/**
 * @file This file centralizes the complex prompt strings used for generating background images.
 * This improves maintainability by separating large text blocks from component logic.
 */

/**
 * Prompt to generate a professional, minimalist photography studio background.
 * UPDATED: Optimized for Gemini 3 "Nano Banana Pro" reasoning capabilities.
 * Defines physics, lighting, and camera parameters for absolute consistency.
 */
export const photoStudioPrompt = `
**Concept:** A technical, infinite cyclorama photography background.
**Subject:** Empty studio space with a seamless floor-to-wall curve (infinity cove).
**Material Logic:** Matte, non-reflective architectural paint. Light grey (Hex #E0E0E0).
**Physics & Lighting:** Global illumination, high-key softbox lighting from top-down. No hard shadows, no specular highlights, no vignetting. The lighting must be mathematically flat and even across the entire surface.
**Camera:** 50mm lens, f/8, focus at infinity.
**Constraint:** The image must look like a raw, unedited blank slate waiting for a product. Minimalist, sterile, 8k resolution.
`;

/**
 * Negative prompt to prevent common studio artifacts.
 * Use this to clean up the generation logic.
 */
export const photoStudioNegativePrompt = `
equipment, props, tripods, light stands, windows, corners, baseboards, textures, grain, noise, vignette, dark shadows, gradients, color tint, blue cast, warm cast, 3d render artifacts, glossy floor, reflections.
`;

/**
 * Prompt to generate a panoramic night view of a city from a skyscraper terrace.
 * Focuses on a cinematic, "Blade Runner" aesthetic with significant bokeh to create a dreamy, out-of-focus background.
 */
export const nightCityTerracePrompt = `**Subject:** The background of a panoramic night view of a modern and vibrant city, taken from the terrace of a luxury skyscraper.
**Style:** Professional night photography, with a cinematic and moody aesthetic. Influence of Blade Runner and high-end architectural photography.
**Composition:** The point of view is eye-level as if a person is standing on the terrace, looking straight out towards the city skyline. The immediate foreground should be almost empty, showing only the sleek, dark floor of the terrace (perhaps polished concrete or teak wood) subtly reflecting the city lights. A minimalist, near-invisible glass railing could be at the edge. The city should feel vast and immersive.
**Background (The City):**
*   An endless skyline of a dense metropolis like Tokyo or New York at night. Skyscrapers with varied lighting: warm office lights, cyan and magenta neon advertisements, and red aviation lights on rooftops.
*   **Key Element:** The entire city must be out of focus. The goal is to create a spectacular and dreamy "wall of bokeh." The points of light should become large, soft circles of color.
*   Below, on the streets, light trails from traffic should be hinted at (long exposure effect).
**Lighting:** The only light source is the ambient glow from the city itself, illuminating the scene from below and the front. There are no strong artificial lights on the terrace. This creates a dramatic, high-contrast atmosphere with a soft uplight.
**Color Palette:** A base of deep blues and blacks for the sky and shadows, punctuated by a vibrant spectrum of colors from the city lights: oranges, yellows, electric blues, purples, and whites.
**Technical Details:**
*   **Camera:** Emulation of a digital cinema camera (like an ARRI Alexa) with a 50mm lens at an f/1.4 aperture to maximize the bokeh effect.
*   **Quality:** Movie poster quality, extreme photorealism, 8K resolution, no digital grain, sharp details in reflections.`;

/**
 * Prompt to generate a modern and impeccably lit pattern-making and sewing workshop.
 * Focuses on a clean, professional, and creative atmosphere for designing high-end athletic wear.
 */
export const garmentDesignWorkshopPrompt = `**Subject:** An empty, modern, and impeccably lit pattern-making and sewing workshop specializing in high-end athletic wear like for figure skating and artistic gymnastics.
**Style:** High-end atelier, minimalist, clean, professional, and photorealistic, with a subtle depth of field.
**Composition:** Wide shot capturing the spacious and open-plan layout. The perspective should showcase the efficient workflow with distinct zones. The camera's focus is locked on the main cutting and sewing tables in the mid-ground, allowing the elements in the distant background (like the back wall or windows) to be slightly and softly out of focus. No people are present, emphasizing the meticulousness of the space itself.
**Environment & Details:**
*   **Architecture:** The space has pristine white walls and a polished, light-reflecting micro-cement floor. Large windows filter in soft, natural light.
*   **Pattern-Making Area:** Several large, light-wood cutting tables are strategically placed. On them, meticulously drawn paper patterns, high-precision scissors, rotary cutters, and curved rulers are neatly organized.
*   **Sewing Station:** A dedicated area features state-of-the-art industrial sewing machines and overlockers. Racks display spools of vibrant thread (electric blues, fuchsia pinks, shimmering silvers, and golds). Transparent containers hold organized supplies like invisible zippers, elastics, and embellishments (Swarovski crystals, sequins).
*   **Display Area:** Matte black or white mannequins showcase avant-garde garments made from shiny, stretch fabrics with intricate crystal patterns. Floating shelves nearby hold samples of technical fabrics like lycra, stretch mesh, and velvet in a brilliant color palette.
*   **Decor:** Minimalist potted plants and abstract art pieces on the walls add a touch of sophistication.
**Lighting:** A dual lighting system is key. Abundant, soft natural light flows from the large windows. This is perfectly complemented by recessed ceiling spotlights that provide uniform, shadow-free illumination across the entire workshop, highlighting the textures of the fabrics and the sparkle of the crystals.
**Color Palette:** A primarily neutral base of immaculate white, light gray, and natural wood. This clean backdrop is punctuated by vibrant, energetic pops of color from the threads, fabrics, and embellishments.
**Technical Details:**
*   **Camera:** Emulate a full-frame mirrorless camera with a 50mm lens at an f/2.8 aperture. This will create a shallow depth of field, rendering the central workspace in sharp detail while the background has a pleasing and subtle blur (soft bokeh).
*   **Quality:** Ultra-detailed, 8K resolution, editorial magazine quality, with a clear and sharp focal point.`;
