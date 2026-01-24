import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Circle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No se pudo acceder a la cámara. Verifique los permisos.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="w-full max-w-2xl p-4 flex flex-col items-center relative">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-4 p-2 bg-slate-800 text-white rounded-full hover:bg-red-500 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        {error ? (
          <div className="text-red-400 p-4 text-center">{error}</div>
        ) : (
          <div className="relative w-full aspect-[3/4] md:aspect-[4/3] bg-black rounded-lg overflow-hidden shadow-2xl">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <button 
                onClick={capturePhoto}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-slate-300 hover:scale-105 transition-transform active:scale-95"
              >
                <Circle className="w-12 h-12 text-slate-900 fill-slate-900/20" />
              </button>
            </div>
          </div>
        )}
        
        <p className="text-slate-400 mt-4 text-sm">Asegúrate de tener buena iluminación</p>
      </div>
    </div>
  );
};