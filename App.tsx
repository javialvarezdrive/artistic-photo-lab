
import React, { useState, useRef, useCallback, memo } from 'react';
import {
  Camera, Wand2, Layers
} from 'lucide-react';
import { ApiKeyGate } from './components/ApiKeyGate';
import { CameraCapture } from './components/CameraCapture';
import { SampleModal } from './components/SampleModal';
import { ImageLightbox } from './components/ImageLightbox';
import { StudioPanel } from './components/studio/StudioPanel';
import { GalleryPanel } from './components/gallery/GalleryPanel';
import { DescriberPanel } from './components/describer/DescriberPanel';
import { useApp } from './context/AppContext';
import { garmentSamples, modelSamples } from './data/samples';

// Memoize sub-panels to prevent irrelevant re-renders
const MemoizedStudioPanel = memo(StudioPanel);
const MemoizedGalleryPanel = memo(GalleryPanel);
const MemoizedDescriberPanel = memo(DescriberPanel);

export function App() {
  const { mode, setMode, studio, gallery } = useApp();

  // SHARED UI STATE
  const [showCamera, setShowCamera] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'garment' | 'model'>('garment');
  const [showSamples, setShowSamples] = useState(false);
  const [sampleType, setSampleType] = useState<'garment' | 'model'>('garment');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const externalUploadRef = useRef<HTMLInputElement>(null);

  // HANDLERS
  const handleCameraCapture = useCallback((base64: string) => {
    if (cameraTarget === 'garment') studio.setGarmentImage(base64);
    else studio.setModelImage(base64);
    setShowCamera(false);
  }, [cameraTarget, studio]);

  const handleSampleSelect = useCallback((base64: string) => {
    if (sampleType === 'garment') studio.setGarmentImage(base64);
    else studio.setModelImage(base64);
    setShowSamples(false);
  }, [sampleType, studio]);

  const openCamera = useCallback((target: 'garment' | 'model') => {
    setCameraTarget(target);
    setShowCamera(true);
  }, []);

  const openSampleModal = useCallback((type: 'garment' | 'model') => {
    setSampleType(type);
    setShowSamples(true);
  }, []);

  const handleExternalUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        gallery.addFromBase64(reader.result as string, "Imagen externa subida para edición");
      };
      reader.readAsDataURL(e.target.files[0]);
    }
    if (externalUploadRef.current) externalUploadRef.current.value = '';
  }, [gallery]);

  return (
    <ApiKeyGate>
      <div className="h-screen flex flex-col bg-slate-950 text-slate-200 font-sans overflow-hidden">

        {/* Header */}
        <header className="py-4 px-6 flex items-center justify-between bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Camera className="text-emerald-500 w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Aristic Photo Lab</h1>
              <p className="text-slate-500 text-xs">Tu director IA de fotografía</p>
            </div>
          </div>

          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setMode('STUDIO')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 
                  ${mode === 'STUDIO' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Wand2 className="w-3 h-3" /> Estudio
            </button>
            <button
              onClick={() => setMode('DESCRIBER')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 
                  ${mode === 'DESCRIBER' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Layers className="w-3 h-3" /> Análisis
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {mode === 'STUDIO' ? (
            <>
              {/* LEFT PANEL: CONTROLS */}
              <aside className="w-full lg:w-1/3 flex-shrink-0 border-r border-slate-800 overflow-y-auto custom-scrollbar bg-slate-950 p-6">
                <MemoizedStudioPanel
                  onOpenCamera={openCamera}
                  onOpenSamples={openSampleModal}
                />
              </aside>

              {/* RIGHT PANEL: RESULTS */}
              <section className="flex-1 bg-slate-900 flex flex-col relative overflow-hidden" id="results-panel">
                <MemoizedGalleryPanel
                  onExternalUpload={() => externalUploadRef.current?.click()}
                  onOpenLightbox={() => setIsLightboxOpen(true)}
                />
              </section>
            </>
          ) : (
            <MemoizedDescriberPanel onOpenCamera={() => openCamera('garment')} />
          )}
        </main>

        {/* HIDDEN INPUTS & MODALS */}
        <input
          type="file"
          ref={externalUploadRef}
          onChange={handleExternalUpload}
          accept="image/*"
          className="hidden"
        />

        <footer className="hidden lg:flex absolute bottom-2 right-4 text-slate-600 text-[10px] items-center gap-1 pointer-events-none z-30">
          Aristic v1.1 - Optimized
        </footer>

        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}

        <SampleModal
          isOpen={showSamples}
          onClose={() => setShowSamples(false)}
          title={sampleType === 'garment' ? "Elige una prenda" : "Elige una modelo"}
          samples={sampleType === 'garment' ? garmentSamples : modelSamples}
          onSelect={handleSampleSelect}
        />

        {isLightboxOpen && gallery.selectedId && (
          <ImageLightbox
            images={gallery.images}
            selectedId={gallery.selectedId}
            onClose={() => setIsLightboxOpen(false)}
            onSelect={gallery.setSelectedId}
          />
        )}
      </div>
    </ApiKeyGate>
  );
}
