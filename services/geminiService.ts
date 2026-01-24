
import { GoogleGenAI, GenerateContentResponse, SafetySetting, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { GenerationConfig, ShotType } from "../types";
import { colorPalettes } from "../data/palettes";
import { photoStudioPrompt, photoStudioNegativePrompt } from "../data/prompts";

// ==========================================
// 1. CONFIGURACIÓN GENERAL
// ==========================================

const WEBHOOK_URL = 'https://n8n-n8n.hy9ar6.easypanel.host/webhook/photo-lab';
const SEMILLA_ESTUDIO = 123456;

// ==========================================
// 2. HERRAMIENTAS INTERNAS
// ==========================================

const obtenerClienteIA = () => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || "AIzaSy..."; // Placeholder o env
  if (!apiKey) throw new Error("Falta la API Key.");
  return new GoogleGenAI({ apiKey });
};

const extraerMimeType = (base64: string): string => {
  const match = base64.match(/data:(.*?);base64/);
  return match ? match[1] : 'image/png';
};

const limpiarBase64 = (base64: string): string => {
  if (base64.includes(',')) {
    return base64.split(',')[1];
  }
  return base64;
};

const bloqueEncuadre = (shotType: ShotType): string => {
  switch (shotType) {
    case ShotType.Wide: return "Extreme Long Shot.";
    case ShotType.FullBody: return "Full Body Shot, head to toe.";
    case ShotType.American: return "American Shot, mid-thighs up.";
    case ShotType.Medium: return "Medium Shot, waist up.";
    case ShotType.MediumCloseUp: return "Medium Close-Up.";
    case ShotType.CloseUp: return "Close-Up photography.";
    case ShotType.ExtremeCloseUp: return "Extreme Close-Up.";
    case ShotType.Detail: return "Macro Detail Shot of fabric texture.";
    default: return "Full Body Shot.";
  }
};

const bloquePrenda = (longSleeves: boolean, garmentImgIndex: number, modelImgIndex: number): string => {
  let instrucciones = `
**WARDROBE TRANSFORMATION - MANDATORY PROTOCOL:**
1. **SOURCE OF TRUTH:** Use Image ${garmentImgIndex} as the ONLY source for the clothing. Replicate its exact pattern, fabric texture, and decorative elements (logos/graphics).
2. **REPLACEMENT:** You MUST remove any existing clothing from the person in Image ${modelImgIndex > 0 ? modelImgIndex : 'the scene'} and replace it entirely with the garment from Image ${garmentImgIndex}.
3. **FIT & ANATOMY:** The garment must have a **PERFECT FIT**, adapting flawlessy to the model's anatomy (skin-tight if it's athletic wear). Ensure it follows the pose structure exactly.
  `;

  if (longSleeves) {
    instrucciones += `\n4. **MODIFICATION:** Extend the design to create long sleeves that reach the wrists, maintaining the original pattern style.`;
  }

  return instrucciones;
};

const bloqueColor = (paletteId: string): string => {
  if (!paletteId || paletteId === 'none') return "";
  const palette = colorPalettes.find(p => p.id === paletteId);
  if (!palette || palette.colors.length === 0) return "";
  return `**COLOR OVERLAY:** Adjust the final image to match this color story: [${palette.colors.join(', ')}].`;
};

const procesarRespuesta = (response: GenerateContentResponse): string => {
  if (response.promptFeedback?.blockReason) {
    throw new Error(`Solicitud bloqueada por: ${response.promptFeedback.blockReason}`);
  }

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("La API no devolvió ninguna respuesta válida.");

  if (candidate.finishReason === 'SAFETY') {
    throw new Error("Imagen bloqueada por filtros de seguridad.");
  }

  const parts = candidate.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No se recibió ninguna imagen.");
};

async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (error.message?.includes('SAFETY')) throw error;
      if (i < maxRetries) {
        await new Promise(res => setTimeout(res, 1000 * (i + 1)));
      }
    }
  }
  throw lastError;
}

// ==========================================
// 5. FUNCIONES PRINCIPALES
// ==========================================

export const generateFashionImage = async (config: GenerationConfig): Promise<string> => {
  return retryOperation(async () => {
    const ai = obtenerClienteIA();
    const parts: any[] = [];
    let promptRefSection = "\n**VISUAL REFERENCES:**";
    let imgIndex = 1;
    let garmentIndex = -1;
    let modelIndex = -1;
    let poseIndex = -1;

    if (config.garmentImage) {
      parts.push({ inlineData: { data: limpiarBase64(config.garmentImage), mimeType: extraerMimeType(config.garmentImage) } });
      garmentIndex = imgIndex++;
      promptRefSection += `\n- Image ${garmentIndex}: THE ONLY SOURCE FOR CLOTHING DESIGN.`;
    }

    if (config.modelImage) {
      parts.push({ inlineData: { data: limpiarBase64(config.modelImage), mimeType: extraerMimeType(config.modelImage) } });
      modelIndex = imgIndex++;
      promptRefSection += `\n- Image ${modelIndex}: MODEL'S PHYSICAL APPEARANCE.`;
    }



    // CONSTRUCTION OF THE STRUCTURED PROMPT
    let prompt = `**TASK:** VIRTUAL TRY-ON (STRICT REPLACEMENT).
**GOAL:** Transfer the garment from Image ${garmentIndex} onto the person in Image ${modelIndex}.

**TARGET ENVIRONMENT / BACKGROUND:**
"""
${config.background}
"""

**SOURCE 1: THE GARMENT (Image ${garmentIndex})**
- **ROLE:** TEXTURE & DESIGN SOURCE.
- **ACTION:** Extract this EXACT garment (cut, pattern, fabric).
- **CONSTRAINT:** Ignore the model/dummy inside this image.

**SOURCE 2: THE TARGET MODEL (Image ${modelIndex})**
- **ROLE:** ANATOMY & POSE SOURCE.
- **ACTION:** Retain the face, hair, body shape, and EXACT pose.
- **CRITICAL CONSTRAINT:** **REMOVE** the original background from this image.
- **CRITICAL CONSTRAINT:** **DELETE** the clothing this person is wearing.

**GENERATION INSTRUCTIONS:**
1. **SCENE:** GENERATE the following background strictly: "${config.background}". REPLACE the original background.
2. **SUBJECT:** Place the model from Source 2 into this new environment.
3. **CLOTHING:** Dress the model with the garment from Source 1.
4. **INTEGRATION:** Ensure lighting from the new environment matches the subject.
5. **RENDER:** Photorealistic finish. Shot: ${bloqueEncuadre(config.shotType)}.

${bloquePrenda(config.longSleeves, garmentIndex, modelIndex)}
${bloqueColor(config.colorPalette)}

${config.customPrompt ? `**STYLE NOTE:** ${config.customPrompt}` : ''}

**FINAL VALIDATION:**
- Is the background EXACTLY as described in TARGET ENVIRONMENT?
- Is the person the model from Image ${modelIndex}?
- Is the clothing the garment from Image ${garmentIndex}?`;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts },
      config: {
        seed: config.background === photoStudioPrompt ? SEMILLA_ESTUDIO : undefined,
        imageConfig: { aspectRatio: config.aspectRatio, imageSize: config.imageSize },
        safetySettings: [{ category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }]
      }
    });

    const resultImage = procesarRespuesta(response);
    enviarAWebhook(resultImage, 'GENERATION', { task: "virtual_try_on" });
    return resultImage;
  });
};

export const refineImage = async (originalImageBase64: string, instruction: string, aspectRatio: string = "1:1"): Promise<string> => {
  return retryOperation(async () => {
    const ai = obtenerClienteIA();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: limpiarBase64(originalImageBase64), mimeType: extraerMimeType(originalImageBase64) } },
          { text: `Edit this fashion image: ${instruction}. Maintain the model's identity.` }
        ]
      },
      config: { imageConfig: { aspectRatio: aspectRatio as any } }
    });
    return procesarRespuesta(response);
  }, 1);
};

export const describeImage = async (imageBase64: string): Promise<string> => {
  return retryOperation(async () => {
    const ai = obtenerClienteIA();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: limpiarBase64(imageBase64), mimeType: extraerMimeType(imageBase64) } },
          { text: "Analyze this fashion image. Detail: Garment type, patterns, material, and color codes." }
        ]
      }
    });
    return response.text || "No hay descripción disponible.";
  }, 1);
};

export const enviarAWebhook = async (base64Image: string, tipo: string, metadatos: any) => {
  try {
    const formData = new FormData();
    const fetchResponse = await fetch(base64Image);
    const blob = await fetchResponse.blob();
    formData.append('file', blob, `output.png`);
    formData.append('type', tipo);
    formData.append('metadata', JSON.stringify(metadatos));
    fetch(WEBHOOK_URL, { method: 'POST', body: formData, mode: 'no-cors' }).catch(() => { });
  } catch (e) { }
};
