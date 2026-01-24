import React, { useEffect, useState } from 'react';
import { Key, Lock } from 'lucide-react';

interface ApiKeyGateProps {
  children: React.ReactNode;
}

export const ApiKeyGate: React.FC<ApiKeyGateProps> = ({ children }) => {
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkKey = async () => {
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for development environments without the wrapper
        console.warn("AI Studio wrapper not found. Assuming dev environment or manual key injection.");
        // Use import.meta.env for Vite compatibility
        const devKey = (import.meta as any).env?.VITE_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
        setHasKey(!!devKey);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setError("Failed to verify API key status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        // Assume success after interaction, or re-check
        await checkKey();
        setHasKey(true); // Optimistic update based on instructions
      }
    } catch (e: any) {
      if (e.message && e.message.includes("Requested entity was not found")) {
        // Reset and retry
        setHasKey(false);
        handleSelectKey();
      } else {
        setError("Failed to select API key. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse">Initializing Security...</div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center">
          <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold mb-4">Authentication Required</h1>
          <p className="text-slate-400 mb-8">
            Aristic Photo Lab requires a valid paid API key to access the high-fidelity <span className="text-emerald-400">Gemini 3 Pro</span> imaging models.
          </p>

          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            Select API Key
          </button>

          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800">
            <a
              href="https://ai.google.dev/gemini-api/docs/billing"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-slate-300 underline"
            >
              View Billing Documentation
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
