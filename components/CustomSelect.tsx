import React, { useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useDropdown } from '../hooks';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label: string;
  description?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  description,
  options,
  value,
  onChange,
  placeholder = "Seleccionar..."
}) => {
  const { isOpen, toggle, close, ref } = useDropdown();

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = useCallback((optionValue: string) => {
    onChange(optionValue);
    close();
  }, [onChange, close]);

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-base font-bold text-white">{label}</label>
      {description && <p className="text-xs text-slate-400 -mt-1">{description}</p>}

      <div ref={ref} className="relative mt-1">
        <button
          type="button"
          onClick={toggle}
          className={`w-full flex items-center justify-between bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all hover:bg-slate-700 hover:border-slate-500 ${isOpen ? 'ring-2 ring-emerald-500/50 border-emerald-500' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={selectedOption ? 'text-white' : 'text-slate-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-xl max-h-60 overflow-auto custom-scrollbar animate-fadeInUp">
            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-all border-b border-slate-700 last:border-0
                    ${isSelected
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};