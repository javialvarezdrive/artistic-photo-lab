import { useState, useCallback, useMemo } from 'react';
import {
    AspectRatio, ImageSize, ModelAge, GenerationConfig, ShotType
} from '../types';
import { PREDEFINED_BACKGROUNDS } from '../constants';
import { colorPalettes } from '../data/palettes';

/**
 * Configuración inicial por defecto para el estudio.
 */
const defaultConfig: GenerationConfig = {
    garmentImage: null,
    modelImage: null,
    age: ModelAge.Original,
    background: PREDEFINED_BACKGROUNDS[0].value,
    aspectRatio: AspectRatio.Portrait_9_16,
    imageSize: ImageSize.Size_1K,
    colorPalette: colorPalettes[0].id,
    longSleeves: false,
    shotType: ShotType.FullBody,
    customPrompt: ''
};

/**
 * Hook que centraliza todo el estado de configuración del estudio.
 * Evita tener ~15 useState dispersos en App.tsx.
 */
export function useStudioConfig() {
    const [config, setConfig] = useState<GenerationConfig>(defaultConfig);

    // Setter genérico para cualquier campo
    const updateField = useCallback(<K extends keyof GenerationConfig>(
        field: K,
        value: GenerationConfig[K]
    ) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    }, []);

    // Setters específicos para conveniencia
    const setGarmentImage = useCallback((img: string | null) =>
        updateField('garmentImage', img), [updateField]);

    const setModelImage = useCallback((img: string | null) =>
        updateField('modelImage', img), [updateField]);

    const setAge = useCallback((age: ModelAge) =>
        updateField('age', age), [updateField]);

    const setAspectRatio = useCallback((ratio: AspectRatio) =>
        updateField('aspectRatio', ratio), [updateField]);

    const setImageSize = useCallback((size: ImageSize) =>
        updateField('imageSize', size), [updateField]);

    const setShotType = useCallback((shot: ShotType) =>
        updateField('shotType', shot), [updateField]);

    const setBackground = useCallback((bg: string) =>
        updateField('background', bg), [updateField]);

    const setColorPalette = useCallback((palette: string) =>
        updateField('colorPalette', palette), [updateField]);

    const setCustomPrompt = useCallback((prompt: string) =>
        updateField('customPrompt', prompt), [updateField]);

    const setLongSleeves = useCallback((value: boolean) =>
        updateField('longSleeves', value), [updateField]);

    const toggleLongSleeves = useCallback(() =>
        setConfig(prev => ({ ...prev, longSleeves: !prev.longSleeves })), []);

    // Resetear a valores por defecto
    const resetConfig = useCallback(() => setConfig(defaultConfig), []);

    // Verificar si se puede generar
    const canGenerate = useMemo(() => !!config.garmentImage, [config.garmentImage]);

    return {
        config,
        updateField,
        setGarmentImage,
        setModelImage,
        setAge,
        setAspectRatio,
        setImageSize,
        setShotType,
        setBackground,
        setColorPalette,
        setCustomPrompt,
        setLongSleeves,
        toggleLongSleeves,
        resetConfig,
        canGenerate
    };
}

export type StudioConfigHook = ReturnType<typeof useStudioConfig>;
