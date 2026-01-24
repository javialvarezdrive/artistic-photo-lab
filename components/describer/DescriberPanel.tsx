import React, { useState } from 'react';
import { RefreshCw, Layers } from 'lucide-react';
import { ImageUploader } from '../ImageUploader';
import { describeImage } from '../../services/geminiService';

interface DescriberPanelProps {
    onOpenCamera: () => void;
}

export const DescriberPanel: React.FC<DescriberPanelProps> = ({ onOpenCamera }) => {
    const [describerImg, setDescriberImg] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const [isDescribing, setIsDescribing] = useState(false);

    const handleDescribe = async () => {
        if (!describerImg) return;
        setIsDescribing(true);
        try {
            const text = await describeImage(describerImg);
            setDescription(text);
        } catch (e) {
            alert("Error analizando la imagen.");
        } finally {
            setIsDescribing(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full">
            {/* Controls */}
            <div className="w-full lg:w-1/3 p-6 space-y-6 border-r border-slate-800 overflow-y-auto bg-slate-950">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-xl font-bold mb-4 text-white">Análisis Técnico</h2>
                    <ImageUploader
                        label="Sube una imagen para analizar"
                        placeholderText="Sube cualquier referencia"
                        onImageSelect={setDescriberImg}
                        selectedImage={describerImg}
                        onCameraRequest={onOpenCamera}
                    />
                    <button
                        onClick={handleDescribe}
                        disabled={isDescribing || !describerImg}
                        className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isDescribing ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Analizar Imagen"}
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-900">
                <div className="max-w-3xl mx-auto bg-slate-950 border border-slate-800 rounded-xl p-8 shadow-lg">
                    <h3 className="text-xl font-serif font-bold text-emerald-400 mb-6 flex items-center gap-2">
                        <Layers className="w-5 h-5" /> Informe de Análisis
                    </h3>
                    {description ? (
                        <div className="prose prose-invert max-w-none">
                            <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-light">
                                {description}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-600 py-12">
                            <Layers className="w-12 h-12 mb-4 opacity-20" />
                            <p>El resultado del análisis técnico aparecerá aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
