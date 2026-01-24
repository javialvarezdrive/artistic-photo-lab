import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook reutilizable para manejar dropdowns/selectores.
 * Elimina código duplicado entre CustomSelect y ColorPaletteSelector.
 */
export function useDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggle = useCallback(() => setIsOpen(prev => !prev), []);
    const close = useCallback(() => setIsOpen(false), []);
    const open = useCallback(() => setIsOpen(true), []);

    return { isOpen, setIsOpen, toggle, close, open, ref };
}
