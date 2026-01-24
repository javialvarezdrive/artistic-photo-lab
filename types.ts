
export enum AspectRatio {
  Square = "1:1",
  Portrait_3_4 = "3:4",
  Landscape_4_3 = "4:3",
  Portrait_9_16 = "9:16",
  Landscape_16_9 = "16:9",
}

export enum ImageSize {
  Size_1K = "1K",
  Size_2K = "2K",
  Size_4K = "4K",
}

export enum ModelAge {
  Original = "Original",
  Child = "Niña (6-9 años)",
  PreTeen = "Pre-adol. (10-12 años)",
  Teen = "Adolescente (13-16 años)",
  YoungAdult = "Joven (18-25 años)",
  Adult = "Adulta (25+ años)",
}

export enum ShotType {
  Wide = "WIDE",
  FullBody = "FULL_BODY",
  American = "AMERICAN",
  Medium = "MEDIUM",
  MediumCloseUp = "MEDIUM_CLOSE_UP",
  CloseUp = "CLOSE_UP",
  ExtremeCloseUp = "EXTREME_CLOSE_UP",
  Detail = "DETAIL"
}

export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  timestamp: number;
}

export interface GenerationConfig {
  garmentImage: string | null; // Base64
  modelImage: string | null; // Base64

  age: ModelAge;
  background: string;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  colorPalette: string; // ID from colorPalettes
  longSleeves: boolean;
  shotType: ShotType;
  customPrompt: string;
}

export type AppMode = 'STUDIO' | 'DESCRIBER';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
