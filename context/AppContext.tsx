import React, { createContext, useContext, ReactNode } from 'react';
import { useStudioConfig, StudioConfigHook, useGallery, GalleryHook } from '../hooks';
import { AppMode } from '../types';

interface AppContextType {
    studio: StudioConfigHook;
    gallery: GalleryHook;
    mode: AppMode;
    setMode: (mode: AppMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const studio = useStudioConfig();
    const gallery = useGallery();
    const [mode, setMode] = React.useState<AppMode>('STUDIO');

    return (
        <AppContext.Provider value={{ studio, gallery, mode, setMode }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
