import { useState, useCallback, useMemo } from 'react';
import { GeneratedImage } from '../types';

/**
 * Hook que gestiona la galería de imágenes generadas.
 * Centraliza la lógica de agregar, seleccionar y gestionar imágenes.
 */
export function useGallery() {
    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Agregar nueva imagen y seleccionarla automáticamente
    const addImage = useCallback((image: GeneratedImage) => {
        setImages(prev => [image, ...prev]);
        setSelectedId(image.id);
    }, []);

    // Agregar imagen desde base64 con metadata automática
    const addFromBase64 = useCallback((base64: string, prompt: string = 'Generación') => {
        const newImage: GeneratedImage = {
            id: Date.now().toString(),
            url: base64,
            prompt,
            timestamp: Date.now()
        };
        addImage(newImage);
        return newImage;
    }, [addImage]);

    // Eliminar imagen
    const removeImage = useCallback((id: string) => {
        setImages(prev => {
            const newImages = prev.filter(img => img.id !== id);
            // Si eliminamos la seleccionada, seleccionar la primera disponible
            if (selectedId === id && newImages.length > 0) {
                setSelectedId(newImages[0].id);
            } else if (newImages.length === 0) {
                setSelectedId(null);
            }
            return newImages;
        });
    }, [selectedId]);

    // Limpiar galería
    const clearGallery = useCallback(() => {
        setImages([]);
        setSelectedId(null);
    }, []);

    // Imagen actualmente seleccionada
    const activeImage = useMemo(() =>
        images.find(img => img.id === selectedId) || null,
        [images, selectedId]
    );

    // Navegación
    const currentIndex = useMemo(() =>
        images.findIndex(img => img.id === selectedId),
        [images, selectedId]
    );

    const selectNext = useCallback(() => {
        if (currentIndex > 0) {
            setSelectedId(images[currentIndex - 1].id);
        }
    }, [currentIndex, images]);

    const selectPrev = useCallback(() => {
        if (currentIndex < images.length - 1) {
            setSelectedId(images[currentIndex + 1].id);
        }
    }, [currentIndex, images]);

    return {
        images,
        selectedId,
        activeImage,
        currentIndex,
        setSelectedId,
        addImage,
        addFromBase64,
        removeImage,
        clearGallery,
        selectNext,
        selectPrev,
        isEmpty: images.length === 0
    };
}

export type GalleryHook = ReturnType<typeof useGallery>;
