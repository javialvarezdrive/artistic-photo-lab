import React, { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  description?: string;
  onImageSelect: (base64: string | null) => void;
  onCameraRequest: () => void;
  selectedImage: string | null;
  placeholderText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  description, 
  onImageSelect, 
  onCameraRequest,
  selectedImage,
  placeholderText = "Haz clic para subir o arrastra una imagen"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="mb-6">
      <label className="block text-base font-bold text-white mb-1">{label}</label>
      {description && <p className="text-xs text-slate-400 mb-3">{description}</p>}
      
      <div
        className={`relative group w-full h-48 border border-dashed rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
          ${dragActive ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'}
        `}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {selectedImage ? (
          <>
            <img src={selectedImage} alt="Preview" className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <button 
                onClick={clearImage}
                className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </>
        ) : (
          <div 
            className="flex flex-col items-center text-slate-400 w-full h-full justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-6 h-6 mb-3 text-slate-400" />
            <span className="text-sm font-medium text-center px-4">{placeholderText}</span>
            <span className="text-[10px] uppercase tracking-wide mt-1 text-slate-500">PNG, JPG, WEBP</span>
            
            <div className="w-24 h-px bg-slate-700 my-3 relative">
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-1 text-[10px] text-slate-500">O</span>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCameraRequest();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded text-sm transition-colors border border-slate-600"
            >
              <Camera className="w-4 h-4" />
              Usar Cámara
            </button>
          </div>
        )}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleChange}
        />
      </div>
    </div>
  );
};