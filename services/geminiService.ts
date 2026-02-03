
import { GoogleGenAI, GenerateContentResponse, SafetySetting, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { GenerationConfig, ShotType, ModelAge } from "../types";
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

const bloqueEdad = (age: ModelAge): string => {
  if (!age || age === ModelAge.Original) return "";
  let ageDescription = "";
  switch (age) {
    case ModelAge.Child: ageDescription = "6-9 year old child"; break;
    case ModelAge.PreTeen: ageDescription = "10-12 year old pre-teen"; break;
    case ModelAge.Teen: ageDescription = "13-16 year old teenager"; break;
    case ModelAge.YoungAdult: ageDescription = "18-25 year old young adult"; break;
    case ModelAge.Adult: ageDescription = "25+ year old adult"; break;
  }
  return `**MODEL AGE TRANSFORMATION:** The model MUST appear as a ${ageDescription}. Adjust facial features and body proportions accordingly while maintaining the base identity from the reference image.`;
};

const bloquePrenda = (longSleeves: boolean, garmentImgIndex: number, modelImgIndex: number): string => {
  let instrucciones = `
**CLOTHING TRANSFER PROTOCOL:**
1. **SOURCE:** The swimsuit/maillot worn by the person in Image ${garmentImgIndex}.
2. **TARGET:** The person in Image ${modelImgIndex > 0 ? modelImgIndex : 'the scene'} - this person must wear the swimsuit from Image ${garmentImgIndex}.
3. **ACCURACY:** The transferred swimsuit must be IDENTICAL to the one in Image ${garmentImgIndex} - same colors, pattern, cut, logos.
4. **FIT:** The swimsuit must fit the target person's body naturally, following their pose and anatomy.
  `;

  if (longSleeves) {
    instrucciones += `\n5. **MODIFICATION:** Extend the design to create long sleeves that reach the wrists, maintaining the original pattern style.`;
  }

  return instrucciones;
};

const bloqueColor = (paletteId: string): string => {
  if (!paletteId || paletteId === 'none') return "";
  const palette = colorPalettes.find(p => p.id === paletteId);
  if (!palette || palette.colors.length === 0) return "Original colors from references.";
  return `STRICTLY USE THIS PALETTE: [${palette.colors.join(', ')}]. Apply these tones everywhere.`;
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



    // CONSTRUCTION OF THE STRUCTURED PROMPT - CLOTHES TRANSFER
    let prompt = `
##############################################################################
#                    🔴 MISSION-CRITICAL INSTRUCTION 🔴                       #
##############################################################################

You are performing a **CLOTHING TRANSFER** operation.

**THE MISSION:**
Look at Image ${garmentIndex}. There is a person wearing a SWIMSUIT/MAILLOT.
Your job is to:
1. COPY that EXACT swimsuit/maillot (the clothing, NOT the person)
2. PUT that swimsuit/maillot on the person from Image ${modelIndex}

**RESULT:** The person from Image ${modelIndex} must be wearing the SAME swimsuit/maillot that the person in Image ${garmentIndex} is wearing.

---

**IMAGE ${garmentIndex} - CLOTHING SOURCE:**
- This image shows a person wearing a swimsuit/maillot
- **EXTRACT:** The swimsuit/maillot this person is wearing (pattern, colors, design, logos, fabric)
- **IGNORE:** The person's body/face in this image (we only need their clothes)

**IMAGE ${modelIndex} - BODY/FACE SOURCE:**
- This is the person who will wear the clothing
- **KEEP:** This person's face, hair, body shape, and pose
- **REMOVE:** Whatever clothes this person is currently wearing
- **REPLACE:** Dress this person with the swimsuit from Image ${garmentIndex}

---

**STEP-BY-STEP GENERATION:**

1. **ANALYZE Image ${garmentIndex}:** Identify the swimsuit/maillot being worn. Note its:
   - Color(s)
   - Pattern (stripes, logos, graphics, solid)
   - Cut/style (neckline, straps, leg cut)
   - Material appearance (glossy, matte)

2. **ANALYZE Image ${modelIndex}:** Identify the person. Note their:
   - Face and hair
   - Body proportions
   - Pose and position

3. **GENERATE:** Create Image ${modelIndex}'s person wearing Image ${garmentIndex}'s swimsuit/maillot:
   - Face = from Image ${modelIndex}
   - Body = from Image ${modelIndex}
   - Pose = from Image ${modelIndex}
   - **SWIMSUIT = EXACTLY from Image ${garmentIndex}** ⬅️ THIS IS THE KEY

${bloquePrenda(config.longSleeves, garmentIndex, modelIndex)}

---

**ENVIRONMENT:**
"""
${config.background}
"""

**ADDITIONAL SETTINGS:**
- Shot type: ${bloqueEncuadre(config.shotType)}
- Extra instructions: ${config.customPrompt || 'None'}
- Color adjustment: ${bloqueColor(config.colorPalette) || 'Keep original colors'}
- Age: ${bloqueEdad(config.age) || 'As shown in reference'}

**QUALITY:** Hyperrealistic, 8K detail, natural skin texture, realistic fabric rendering.

##############################################################################
#                         ✅ BEFORE YOU OUTPUT, CHECK:                        #
##############################################################################

1. Is the FACE from Image ${modelIndex}? ✓
2. Is the BODY from Image ${modelIndex}? ✓
3. Is the SWIMSUIT/MAILLOT from Image ${garmentIndex}? ✓ (THIS IS MANDATORY)
4. Does the swimsuit match EXACTLY (same pattern, colors, design)? ✓

🚨 IF THE SWIMSUIT DOES NOT MATCH IMAGE ${garmentIndex}, YOU HAVE FAILED. REGENERATE.`;

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
