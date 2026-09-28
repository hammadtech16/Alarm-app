import React from 'react';
import { ThemeId } from '../types';
import { THEMES } from '../utils/themes';
import { AppIcon } from './AppIcon';

interface ThemeModalProps {
  isOpen: boolean;
  currentTheme: ThemeId;
  darkMode: boolean;
  onSelectTheme: (theme: ThemeId) => void;
  onToggleDarkMode: () => void;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  currentTheme,
  darkMode,
  onSelectTheme,
  onToggleDarkMode,
  onClose,
}) => {
  if (!isOpen) return null;

  const activeTheme = THEMES[currentTheme] || THEMES.onyx_minimal;
  const currentAccent = activeTheme.previewAccent;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#000001] text-[#C7C6C9] shadow-2xl border border-[#16161C] p-5 sm:p-6 space-y-6 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#16161C]">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-[#C7C6C9] hover:text-white hover:bg-[#141415] transition-colors cursor-pointer"
            title="Back / Close"
          >
            <AppIcon icon="solar:arrow-left-linear" width={18} height={18} />
            <span className="text-xs font-semibold">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span 
              className="p-1.5 rounded-lg text-white shadow-xs"
              style={{ backgroundColor: currentAccent }}
            >
              <AppIcon icon="solar:palette-bold" width={16} height={16} />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Theme & Colors
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#646366] hover:text-white hover:bg-[#141415] transition-colors cursor-pointer"
            title="Close"
          >
            <AppIcon icon="solar:close-linear" width={18} height={18} />
          </button>
        </div>

        {/* 1. Signature Flagship Themes (Onyx Studio & Studio Light) */}
        <div className="space-y-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#646366]">
            Signature Studio Themes
          </label>
          
          {/* Onyx Studio Card (NO HEX CODES SHOWN) */}
          <button
            type="button"
            onClick={() => onSelectTheme('onyx_minimal')}
            style={
              currentTheme === 'onyx_minimal'
                ? { borderColor: '#F85E2B', boxShadow: '0 0 0 2px rgba(248, 94, 43, 0.35)' }
                : undefined
            }
            className={`w-full p-4 rounded-2xl border text-left transition-all relative cursor-pointer group ${
              currentTheme === 'onyx_minimal'
                ? 'bg-[#141415] border-transparent shadow-lg'
                : 'border-[#16161C] bg-[#141415] hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#F85E2B] shadow-xs shrink-0" />
                <span className="text-sm font-bold text-white">
                  Onyx Studio (Signature Dark)
                </span>
              </div>
              {currentTheme === 'onyx_minimal' && (
                <span className="text-xs font-bold text-[#F85E2B] flex items-center gap-1">
                  <AppIcon icon="solar:check-circle-bold" width={16} height={16} />
                  Active
                </span>
              )}
            </div>

            <p className="text-xs text-[#646366] mt-0.5 leading-relaxed">
              Deep black and shadow grey with sunset orange accent
            </p>

            {/* Visual Swatch Dots Preview (Without any hex text) */}
            <div className="flex items-center gap-2 pt-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#000001] border border-zinc-700 shadow-xs" title="Deep Black" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#141415] border border-zinc-700 shadow-xs" title="Onyx Card" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#16161C] border border-zinc-700 shadow-xs" title="Shadow Grey" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#C7C6C9] shadow-xs" title="Pale Slate" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#F85E2B] shadow-xs" title="Sunset Orange Accent" />
            </div>
          </button>

          {/* Studio Minimal Light Card */}
          <button
            type="button"
            onClick={() => onSelectTheme('studio_light')}
            style={
              currentTheme === 'studio_light'
                ? { borderColor: '#F85E2B', boxShadow: '0 0 0 2px rgba(248, 94, 43, 0.35)' }
                : undefined
            }
            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
              currentTheme === 'studio_light'
                ? 'bg-[#141415] border-transparent shadow-lg'
                : 'border-[#16161C] bg-[#141415] hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F0F0F3] border border-zinc-300 flex items-center justify-center text-zinc-900 text-sm font-bold shrink-0">
                ☀️
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Studio Minimal Light
                </div>
                <div className="text-xs text-[#646366] mt-0.5">
                  Clean chalk backdrop with high-contrast highlight cards
                </div>
              </div>
            </div>
            {currentTheme === 'studio_light' && (
              <span className="text-xs font-bold text-[#F85E2B] flex items-center gap-1">
                <AppIcon icon="solar:check-circle-bold" width={16} height={16} />
                Active
              </span>
            )}
          </button>
        </div>

        {/* 2. Gentle Morning Atmospheres (Pastels shown as beautiful cards) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#646366]">
              Gentle Morning Atmospheres
            </label>
            <span className="text-[10px] text-zinc-500 font-medium">
              Pastel Moods for Awakening
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(['lavender', 'peach', 'sage', 'rose', 'sky', 'sunbeam'] as ThemeId[]).map((id) => {
              const theme = THEMES[id];
              const isSelected = currentTheme === id;
              const accent = theme.previewAccent;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectTheme(id)}
                  style={
                    isSelected
                      ? {
                          borderColor: accent,
                          boxShadow: `0 0 0 2px ${accent}45`,
                        }
                      : undefined
                  }
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between overflow-hidden group ${
                    isSelected
                      ? 'bg-[#141415] border-transparent shadow-lg'
                      : 'border-[#16161C] bg-[#141415] hover:border-zinc-700'
                  }`}
                >
                  {/* Visual ambient gradient swatch line */}
                  <div
                    className="h-1.5 w-full rounded-full mb-3"
                    style={{
                      background: `linear-gradient(90deg, ${theme.previewBg}, ${accent})`,
                    }}
                  />

                  {/* Title & Color Swatch Dot */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-bold text-white tracking-tight">
                      {theme.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: accent }}
                      />
                      {isSelected && (
                        <AppIcon
                          icon="solar:check-circle-bold"
                          width={16}
                          height={16}
                          className="text-white shrink-0"
                        />
                      )}
                    </div>
                  </div>

                  {/* Poetic Emotional Tagline */}
                  <p className="text-xs text-[#646366] line-clamp-2 mt-1 leading-relaxed">
                    {theme.tagline}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Low Light Bedside Mode Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141415] border border-[#16161C]">
          <div>
            <div className="text-xs sm:text-sm font-bold text-white">
              Low-Light Bedside Dark Mode
            </div>
            <div className="text-[11px] text-[#646366]">
              Soothing contrast for eyes on bedside nightstands
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl bg-[#16161C] border border-zinc-800 text-[#C7C6C9] hover:text-white cursor-pointer transition-colors"
          >
            <AppIcon icon={darkMode ? 'solar:sun-2-bold' : 'solar:moon-bold'} width={18} height={18} />
          </button>
        </div>

        {/* Done / Close Button */}
        <div>
          <button
            type="button"
            onClick={onClose}
            style={{ backgroundColor: currentAccent }}
            className="w-full py-3.5 rounded-2xl text-xs font-bold text-white transition-all shadow-lg hover:brightness-110 active:scale-98 cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
