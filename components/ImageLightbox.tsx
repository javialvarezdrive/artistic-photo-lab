
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Calendar, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageLightboxProps {
  images: GeneratedImage[];
  selectedId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ 
  images, 
  selectedId, 
  onClose, 
  onSelect 
}) => {
  const currentIndex = images.findIndex(img => img.id === selectedId);
  const currentImage = images[currentIndex];

  // Zoom & Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  // Reset zoom when changing images
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [selectedId]);

  const handleNext = useCallback(() => {
    if (currentIndex > 0) {
      onSelect(images[currentIndex - 1].id);
    }
  }, [currentIndex, images, onSelect]);

  const handlePrev = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onSelect(images[currentIndex + 1].id);
    }
  }, [currentIndex, images, onSelect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // Only navigate with arrows if not zoomed in (to avoid conflict with panning desire)
      if (scale === 1) {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose, scale]);

  // Zoom Handlers
  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 4));
  const handleZoomOut = () => {
    setScale(s => {
      const newScale = Math.max(s - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 }); // Reset pos if fully zoomed out
      return newScale;
    });
  };
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const onWheel = (e: React.WheelEvent) => {
    e.stopPropagation(); // Prevent background scroll
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  };

  // Drag Handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  if (!currentImage) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-auto">
        <div className="text-white/80 text-sm font-medium">
          {images.length - currentIndex} / {images.length}
        </div>
        <div className="flex items-center gap-4">
          <a 
            href={currentImage.url}
            download={`aristic-design-${currentImage.id}.png`}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Descargar"
          >
            <Download className="w-6 h-6" />
          </a>
          <button 
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden w-full h-full">
        
        {/* Navigation Button Left - Hidden if zoomed in to prioritize panning */}
        {scale === 1 && (
          <button
            onClick={handlePrev}
            disabled={currentIndex === images.length - 1}
            className={`absolute left-4 p-3 rounded-full bg-black/50 border border-white/10 text-white hover:bg-emerald-600 hover:border-emerald-500 transition-all disabled:opacity-0 disabled:pointer-events-none z-20`}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Image Container for Zoom/Pan */}
        <div 
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <img 
            src={currentImage.url} 
            alt="View" 
            draggable={false}
            className="max-w-full max-h-[calc(100vh-180px)] object-contain transition-transform duration-75 ease-linear shadow-2xl drop-shadow-[0_0_50px_rgba(0,0,0,0.5)] select-none"
            style={{ 
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          />
        </div>

        {/* Navigation Button Right */}
        {scale === 1 && (
          <button
            onClick={handleNext}
            disabled={currentIndex === 0}
            className={`absolute right-4 p-3 rounded-full bg-black/50 border border-white/10 text-white hover:bg-emerald-600 hover:border-emerald-500 transition-all disabled:opacity-0 disabled:pointer-events-none z-20`}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        {/* Zoom Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-2 rounded-full border border-slate-700 shadow-xl">
           <button 
             onClick={handleZoomOut} 
             disabled={scale <= 1}
             className="p-2 hover:bg-slate-700 rounded-full text-white disabled:opacity-30 transition-colors"
           >
             <ZoomOut className="w-5 h-5" />
           </button>
           
           <span className="text-xs font-mono text-emerald-400 min-w-[3rem] text-center">
             {Math.round(scale * 100)}%
           </span>

           <button 
             onClick={handleZoomIn} 
             disabled={scale >= 4}
             className="p-2 hover:bg-slate-700 rounded-full text-white disabled:opacity-30 transition-colors"
           >
             <ZoomIn className="w-5 h-5" />
           </button>

           <div className="w-px h-4 bg-slate-700 mx-1"></div>

           <button 
             onClick={handleReset}
             disabled={scale === 1}
             className="p-2 hover:bg-slate-700 rounded-full text-white disabled:opacity-30 transition-colors"
             title="Restablecer vista"
           >
             <RotateCcw className="w-4 h-4" />
           </button>
           
           {scale > 1 && (
             <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 ml-2 px-2 border-l border-slate-700">
               <Move className="w-3 h-3" /> Arrastra para mover
             </div>
           )}
        </div>
      </div>

      {/* Bottom Details Panel - Hidden if deeply zoomed to give space */}
      {scale < 2 && (
        <div className="bg-black/80 border-t border-white/10 p-6 backdrop-blur-sm z-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                 <h3 className="text-white font-semibold text-lg mb-1">Detalles de la Generación</h3>
                 <p className="text-slate-400 text-sm line-clamp-2">{currentImage.prompt}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                <Calendar className="w-3 h-3" />
                {new Date(currentImage.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
