
import { AspectRatio, ImageSize, ModelAge, ShotType } from './types';
import { colorPalettes } from './data/palettes';
import { photoStudioPrompt, nightCityTerracePrompt, garmentDesignWorkshopPrompt } from './data/prompts';

export const PREDEFINED_BACKGROUNDS = [
  {
    label: "Estudio Fotográfico Minimalista",
    value: photoStudioPrompt
  },
  {
    label: "Terraza Ciudad Nocturna (Bokeh)",
    value: nightCityTerracePrompt
  },
  {
    label: "Taller de Diseño de Moda",
    value: garmentDesignWorkshopPrompt
  },
  {
    label: "Urbano minimalista (Simple)",
    value: "Minimalist urban street background, blurred, day time."
  },
  {
    label: "Pasarela de moda (Simple)",
    value: "Fashion runway with spotlights, dark background, crowd in shadows."
  },
  {
    label: "Paisaje natural atardecer (Simple)",
    value: "Natural landscape with sunset light, golden hour, soft focus background."
  },
  {
    label: "Fondo abstracto neon (Simple)",
    value: "Abstract geometric background with neon lights, futuristic style."
  }
];

export const AGE_OPTIONS = [
  { value: ModelAge.Original, label: "Original (Mantener edad)" },
  { value: ModelAge.Child, label: "Niña (6-9)" },
  { value: ModelAge.PreTeen, label: "Pre-adol. (10-12)" },
  { value: ModelAge.Teen, label: "Adolescente (13-16)" },
  { value: ModelAge.YoungAdult, label: "Joven (18-25)" },
  { value: ModelAge.Adult, label: "Adulta (25+)" },
];

export const RATIO_OPTIONS = [
  { value: AspectRatio.Portrait_9_16, label: "9:16 (Vertical - Historia/Móvil)" },
  { value: AspectRatio.Square, label: "1:1 (Cuadrado - Post)" },
  { value: AspectRatio.Portrait_3_4, label: "3:4 (Retrato)" },
  { value: AspectRatio.Landscape_4_3, label: "4:3 (Paisaje)" },
  { value: AspectRatio.Landscape_16_9, label: "16:9 (Cine)" },
];

export const SIZE_OPTIONS = [
  { value: ImageSize.Size_1K, label: "Estándar (1K)" },
  { value: ImageSize.Size_2K, label: "Alta Resolución (2K)" },
  { value: ImageSize.Size_4K, label: "Ultra Calidad (4K)" },
];

export const SHOT_OPTIONS = [
  { value: ShotType.Wide, label: "Gran Plano General (Paisaje)" },
  { value: ShotType.FullBody, label: "Plano General (Entero)" },
  { value: ShotType.American, label: "Plano Americano (3/4)" },
  { value: ShotType.Medium, label: "Plano Medio (Cintura)" },
  { value: ShotType.MediumCloseUp, label: "Plano Medio Corto (Busto)" },
  { value: ShotType.CloseUp, label: "Primer Plano (Rostro)" },
  { value: ShotType.ExtremeCloseUp, label: "Primerísimo Primer Plano" },
  { value: ShotType.Detail, label: "Plano Detalle" },
];

export const COLOR_OPTIONS = colorPalettes.map(palette => ({
  value: palette.id,
  label: palette.name,
  colors: palette.colors
}));
