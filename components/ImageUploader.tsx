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
        className={`relative group w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden
          ${dragActive ? 'border-emerald-500 bg-emerald-900/20 scale-[1.02]' : 'border-slate-600 bg-slate-800/30 hover:border-emerald-500/50 hover:bg-slate-800/50'}
        `}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {selectedImage ? (
          <>
            <img src={selectedImage} alt="Preview" className="w-full h-full object-contain p-2 animate-fadeInUp" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
              <button
                onClick={clearImage}
                className="p-3 bg-red-500 rounded-xl text-white hover:bg-red-600 transition-all hover:scale-110 shadow-lg"
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
            <div className="p-3 bg-slate-700/50 rounded-xl mb-3 group-hover:bg-emerald-500/20 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <span className="text-sm font-medium text-center px-4">{placeholderText}</span>
            <span className="text-[10px] uppercase tracking-wide mt-1 text-slate-500">PNG, JPG, WEBP</span>

            <div className="w-20 h-px bg-slate-700 my-3 relative">
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 px-2 text-[10px] text-slate-500">O</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onCameraRequest();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-emerald-600 rounded-lg text-sm transition-all hover:scale-105 border border-slate-600 hover:border-emerald-500"
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