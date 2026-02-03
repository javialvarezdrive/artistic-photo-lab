import React, { useState } from 'react';
import { Download, Maximize2, Upload, Wand2, Plus, MessageSquare, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { refineImage } from '../../services/geminiService';

interface GalleryPanelProps {
    onExternalUpload: () => void;
    onOpenLightbox: () => void;
}

export const GalleryPanel: React.FC<GalleryPanelProps> = ({ onExternalUpload, onOpenLightbox }) => {
    const { gallery, studio } = useApp();
    const [refinePrompt, setRefinePrompt] = useState("");
    const [isRefining, setIsRefining] = useState(false);

    const handleRefine = async () => {
        if (!gallery.activeImage || !refinePrompt.trim()) return;

        setIsRefining(true);
        try {
            const refinedBase64 = await refineImage(
                gallery.activeImage.url,
                refinePrompt,
                studio.config.aspectRatio
            );
            gallery.addFromBase64(refinedBase64, `Edición: ${refinePrompt}`);
            setRefinePrompt("");
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Error editando la imagen.");
        } finally {
            setIsRefining(false);
        }
    };

    if (gallery.isEmpty) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                <div className="w-24 h-24 mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                    <Wand2 className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-300 mb-2">El estudio está vacío</h3>
                <p className="text-slate-500 max-w-md mb-6">Configura tu sesión en el panel izquierdo y pulsa generar.</p>

                <button
                    onClick={onExternalUpload}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-sm font-medium transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    O sube una imagen para editar
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full">
            {/* Main Image Area */}
            <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-4 overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                {gallery.activeImage && (
                    <div
                        className="relative max-w-full max-h-full cursor-zoom-in transition-transform duration-300"
                        onClick={onOpenLightbox}
                    >
                        <img
                            src={gallery.activeImage.url}
                            alt="Result"
                            className="max-w-full max-h-[calc(100vh-180px)] object-contain shadow-2xl drop-shadow-2xl"
                        />

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2">
                                <Maximize2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Ampliar</span>
                            </div>
                        </div>

                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={e => e.stopPropagation()}>
                            <a
                                href={gallery.activeImage.url}
                                download={`aristic-design-${gallery.activeImage.id}.png`}
                                className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg block transition-transform hover:scale-110"
                                title="Descargar imagen"
                            >
                                <Download className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Control Bar */}
            <div className="shrink-0 glass border-t border-slate-700/50 p-4 flex flex-col gap-4 z-20">

                {/* Refinement Input */}
                <div className="flex gap-2 max-w-4xl mx-auto w-full">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={refinePrompt}
                            onChange={(e) => setRefinePrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                            placeholder="Escribe aquí para editar la imagen actual..."
                            className="w-full bg-slate-800/80 border border-slate-700 text-white text-sm rounded-xl py-3.5 pl-5 pr-14 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder-slate-500 hover:bg-slate-800"
                        />
                        <button
                            onClick={handleRefine}
                            disabled={isRefining || !refinePrompt}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 bg-slate-700 hover:bg-emerald-600 rounded-lg text-white disabled:opacity-30 disabled:bg-transparent transition-all hover:scale-105"
                        >
                            {isRefining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Thumbnails Strip */}
                <div className="flex gap-2 overflow-x-auto pb-1 justify-center custom-scrollbar min-h-[60px] items-center">
                    <button
                        onClick={onExternalUpload}
                        className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:border-emerald-500 hover:bg-emerald-900/20 transition-all duration-300 shrink-0 hover:scale-105"
                        title="Subir imagen externa para editar"
                    >
                        <Plus className="w-5 h-5" />
                    </button>

                    {gallery.images.map((img, index) => (
                        <button
                            key={img.id}
                            onClick={() => gallery.setSelectedId(img.id)}
                            className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 shrink-0 group ${gallery.selectedId === img.id
                                ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-110 z-10 shadow-lg shadow-emerald-500/20'
                                : 'border-slate-700 opacity-70 hover:opacity-100 hover:scale-105 hover:border-slate-500'}`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <img src={img.url} className="w-full h-full object-cover" alt="thumbnail" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
