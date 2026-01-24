import React, { useCallback } from 'react';
import type { ColorPalette } from '../data/palettes';
import { useDropdown } from '../hooks';

/**
 * Props for the ColorPaletteSelector component.
 */
interface ColorPaletteSelectorProps {
  title: string;
  description: string;
  palettes: ColorPalette[];
  selectedPaletteId: string;
  onSelect: (paletteId: string) => void;
}

/**
 * A small helper component to render the color swatches and name of a palette.
 * This avoids code duplication between the trigger button and the dropdown options.
 */
const PaletteDisplay: React.FC<{ palette: ColorPalette }> = ({ palette }) => (
  <>
    <div className="flex flex-shrink-0 items-center h-5">
      {palette.colors.length > 0 ? (
        palette.colors.slice(0, 4).map((color, index) => (
          <div
            key={index}
            style={{ backgroundColor: color }}
            className={`w-5 h-5 rounded-full border border-slate-500 shadow-sm ${index > 0 ? '-ml-2' : ''}`}
            aria-hidden="true" // Decorative
          ></div>
        ))
      ) : (
        <div className="w-5 h-5 rounded-full border border-slate-500 bg-slate-800 flex items-center justify-center">
          <span className="block w-3 h-[1px] bg-slate-500 rotate-45"></span>
        </div>
      )}
    </div>
    <span className="truncate text-left flex-grow ml-2">{palette.name}</span>
  </>
);

const ColorPaletteSelector: React.FC<ColorPaletteSelectorProps> = ({ title, description, palettes, selectedPaletteId, onSelect }) => {
  const { isOpen, toggle, close, ref } = useDropdown();

  const selectedPalette = palettes.find(p => p.id === selectedPaletteId) || palettes[0];

  const handleSelect = useCallback((paletteId: string) => {
    onSelect(paletteId);
    close();
  }, [onSelect, close]);

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-base font-bold text-white">{title}</label>
      <p className="text-xs text-slate-400 -mt-1">{description}</p>

      <div ref={ref} className="relative mt-1">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={toggle}
          className="w-full flex items-center justify-between appearance-none bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:bg-slate-700"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center">
            <PaletteDisplay palette={selectedPalette} />
          </div>
          <div className={`pointer-events-none flex items-center text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </button>

        {/* Dropdown Options Panel */}
        {isOpen && (
          <div
            className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-auto focus:outline-none custom-scrollbar"
            role="listbox"
          >
            {palettes.map((palette) => (
              <button
                key={palette.id}
                onClick={() => handleSelect(palette.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors border-b border-slate-700 last:border-0
                  ${selectedPaletteId === palette.id
                    ? 'bg-emerald-900/30 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-700'
                  }`}
                role="option"
                aria-selected={selectedPaletteId === palette.id}
              >
                <PaletteDisplay palette={palette} />
                {selectedPaletteId === palette.id && (
                  <span className="ml-auto text-emerald-500">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPaletteSelector;
