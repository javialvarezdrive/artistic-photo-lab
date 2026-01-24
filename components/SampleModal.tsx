import React from 'react';
import { X } from 'lucide-react';
import { Sample } from '../data/samples';

interface SampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  samples: Sample[];
  onSelect: (url: string) => void;
}

export const SampleModal: React.FC<SampleModalProps> = ({ isOpen, onClose, title, samples, onSelect }) => {
  if (!isOpen) return null;

  const handleSelect = async (url: string) => {
    try {
        // Fetch the image to convert to base64 (Cross-Origin might be an issue with direct URL in canvas if not handled, 
        // but for display in img tag URL is fine. However, Gemini needs Base64 or compatible inline data. 
        // Since we use the 'url' in the ImageUploader which expects base64 usually for file uploads but also handles URLs in img src...
        // The logic in App.tsx expects a string that works as src. 
        // BUT geminiService splits by ',' to get base64 data. We need to convert these URLs to base64.
        
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                onSelect(reader.result);
                onClose();
            }
        };
        reader.readAsDataURL(blob);
    } catch (e) {
        console.error("Error converting sample to base64", e);
        // Fallback if fetch fails (e.g. CORS), though these postimg links usually work or we hope so.
        // If it fails, we might just pass the URL, but Gemini Service expects base64 format with "data:image...".
        alert("No se pudo cargar la muestra. Intente otra imagen.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-4 custom-scrollbar">
          {samples.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelect(sample.url)}
              className="group relative aspect-square rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-500 transition-all"
            >
              <img 
                src={sample.url} 
                alt={sample.name} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium truncate w-full text-left">{sample.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};