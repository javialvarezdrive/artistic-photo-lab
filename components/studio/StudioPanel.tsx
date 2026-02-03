import React, { useState } from 'react';
import { Wand2, RefreshCw } from 'lucide-react';
import { ImageUploader } from '../ImageUploader';
import { CustomSelect } from '../CustomSelect';
import ColorPaletteSelector from '../ColorPaletteSelector';
import { useApp } from '../../context/AppContext';
import {
    AGE_OPTIONS, RATIO_OPTIONS, SIZE_OPTIONS, PREDEFINED_BACKGROUNDS, SHOT_OPTIONS
} from '../../constants';
import { garmentSamples, modelSamples } from '../../data/samples';
import { colorPalettes } from '../../data/palettes';
import { generateFashionImage } from '../../services/geminiService';
import { ModelAge, ShotType, AspectRatio, ImageSize } from '../../types';

interface StudioPanelProps {
    onOpenCamera: (target: 'garment' | 'model' | 'pose') => void;
    onOpenSamples: (type: 'garment' | 'model') => void;
}

export const StudioPanel: React.FC<StudioPanelProps> = ({ onOpenCamera, onOpenSamples }) => {
    const { studio, gallery } = useApp();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!studio.canGenerate) {
            alert("Por favor sube el diseño de la prenda.");
            return;
        }

        setIsGenerating(true);
        try {
            const resultBase64 = await generateFashionImage(studio.config);
            gallery.addFromBase64(resultBase64, "Generación Inicial");

            if (window.innerWidth < 1024) {
                document.getElementById('results-panel')?.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Error generando la imagen.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* 1. Garment */}
            <div>
                <ImageUploader
                    label="1. Sube la Prenda (Diseño)"
                    description="Esta es la imagen con el diseño a aplicar."
                    onImageSelect={studio.setGarmentImage}
                    selectedImage={studio.config.garmentImage}
                    onCameraRequest={() => onOpenCamera('garment')}
                />

                <div className="grid grid-cols-2 gap-3 mb-2">
                    <div
                        className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center gap-3 hover:border-slate-700 transition-colors cursor-pointer"
                        onClick={studio.toggleLongSleeves}
                    >
                        <div
                            className={`w-4 h-4 border rounded flex items-center justify-center transition-colors shrink-0 ${studio.config.longSleeves ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 bg-slate-800'}`}
                        >
                            {studio.config.longSleeves && <span className="text-white text-[10px] font-bold">✓</span>}
                        </div>
                        <span className="text-xs text-slate-200 font-medium select-none">Mangas Largas</span>
                    </div>
                </div>

                <button onClick={() => onOpenSamples('garment')} className="text-xs text-emerald-500 hover:text-emerald-400 font-medium mt-1 block">
                    + Usar diseño de muestra
                </button>
            </div>

            {/* 2. Model */}
            <div>
                <ImageUploader
                    label="2. Sube la Modelo (Referencia)"
                    description="Esta es la modelo que vestirá la prenda."
                    onImageSelect={studio.setModelImage}
                    selectedImage={studio.config.modelImage}
                    onCameraRequest={() => onOpenCamera('model')}
                />
                <button onClick={() => onOpenSamples('model')} className="text-xs text-emerald-500 hover:text-emerald-400 font-medium mt-1 block">
                    + Usar modelo de muestra
                </button>
            </div>



            <CustomSelect
                label="4. Ajusta la edad"
                options={AGE_OPTIONS}
                value={studio.config.age}
                onChange={(val) => studio.setAge(val as ModelAge)}
            />

            <CustomSelect
                label="5. Encuadre / Tipo de Plano"
                options={SHOT_OPTIONS}
                value={studio.config.shotType}
                onChange={(val) => studio.setShotType(val as ShotType)}
            />

            <div className="grid grid-cols-2 gap-4">
                <CustomSelect
                    label="6. Formato"
                    options={RATIO_OPTIONS}
                    value={studio.config.aspectRatio}
                    onChange={(val) => studio.setAspectRatio(val as AspectRatio)}
                />
                <div className="space-y-2">
                    <label className="block text-base font-bold text-white">Resolución</label>
                    <CustomSelect
                        label=""
                        options={SIZE_OPTIONS}
                        value={studio.config.imageSize}
                        onChange={(val) => studio.setImageSize(val as ImageSize)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-base font-bold text-white mb-2">7. Instrucciones extra</label>
                <textarea
                    value={studio.config.customPrompt}
                    onChange={(e) => studio.setCustomPrompt(e.target.value)}
                    placeholder="Ej: 'haz que sonría', 'iluminación dramática'..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors min-h-[80px] resize-y"
                />
            </div>

            <CustomSelect
                label="8. Escenario / Fondo"
                options={PREDEFINED_BACKGROUNDS}
                value={studio.config.background}
                onChange={studio.setBackground}
            />

            <ColorPaletteSelector
                title="9. Paleta de Colores"
                description="Fuerza el uso de estos tonos."
                palettes={colorPalettes}
                selectedPaletteId={studio.config.colorPalette}
                onSelect={studio.setColorPalette}
            />

            <button
                onClick={handleGenerate}
                disabled={isGenerating || !studio.canGenerate}
                className={`w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 btn-premium relative overflow-hidden
                    ${studio.canGenerate && !isGenerating ? 'animate-glow hover:shadow-emerald-500/30 hover:shadow-xl' : ''}`}
            >
                {isGenerating ? (
                    <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span className="relative z-10">Creando Magia...</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                    </>
                ) : (
                    <>
                        <Wand2 className="w-5 h-5" />
                        <span className="relative z-10">Generar Fotografía</span>
                    </>
                )}
            </button>

            <div className="h-8"></div>
        </div>
    );
};
