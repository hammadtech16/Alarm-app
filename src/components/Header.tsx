import React, { useState } from 'react';
import { AppLogo } from './AppLogo';
import { AppIcon } from './AppIcon';
import { ThemeId, UserProfile } from '../types';
import { THEMES } from '../utils/themes';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../utils/languages';

interface HeaderProps {
  profile: UserProfile;
  currentTheme: ThemeId;
  darkMode: boolean;
  onThemeChange: (theme: ThemeId) => void;
  onToggleDarkMode: () => void;
  onLanguageChange: (language: string) => void;
  onOpenSettings: () => void;
  onOpenThemes?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentTheme,
  darkMode,
  onThemeChange,
  onToggleDarkMode,
  onLanguageChange,
  onOpenSettings,
  onOpenThemes,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langConfig = getLanguageConfig(profile.language || 'ur');
  const activeTheme = THEMES[currentTheme] || THEMES.onyx_minimal;
  const currentAccent = activeTheme.previewAccent;

  return (
    <header className="w-full border-b transition-colors duration-300 backdrop-blur-xl sticky top-0 z-40 bg-white/90 dark:bg-[#000001]/90 border-zinc-200/80 dark:border-[#16161C]">
      {/* 4pt spacing: h-18/h-20, px-4 sm:px-6 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Left: Brand ONLY (Static, non-clickable, with NO Maternal Alarm tag/button) */}
        <div className="flex items-center gap-3 select-none">
          <AppLogo size={40} variant="warm" accentColor={currentAccent} />
          <span className="font-extrabold text-2xl tracking-tight text-[#000001] dark:text-white">
            Mimi
          </span>
        </div>

        {/* Right: Consistent Rectangular Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* 1. Voice Dropdown (Consistent Rectangular Button matching Add Alarm style) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="h-12 px-3.5 sm:px-4 rounded-2xl bg-white dark:bg-[#141415] border border-zinc-200 dark:border-[#16161C] hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs flex items-center gap-2 text-zinc-900 dark:text-[#C7C6C9] hover:text-black dark:hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Select Mother's Voice Language"
            >
              <span className="text-lg leading-none shrink-0">{langConfig.flag}</span>
              <span className="text-xs font-semibold tracking-tight hidden xs:inline sm:inline">
                {langConfig.name}
              </span>
              <AppIcon icon="solar:alt-arrow-down-linear" width={16} height={16} className="text-zinc-400 dark:text-[#646366]" />
            </button>

            {/* Language Selection Menu */}
            {showLangMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowLangMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-white dark:bg-[#141415] shadow-2xl border border-zinc-200 dark:border-[#16161C] z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-bold text-zinc-400 dark:text-[#646366] uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5">
                    <AppIcon icon="solar:global-linear" width={14} height={14} />
                    <span>Mom's Spoken Language</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {Object.values(SUPPORTED_LANGUAGES).map((lang) => {
                      const isSelected = (profile.language || 'ur') === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            onLanguageChange(lang.code);
                            setShowLangMenu(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-100 dark:bg-[#16161C] font-bold text-zinc-900 dark:text-white'
                              : 'hover:bg-zinc-50 dark:hover:bg-[#16161C]/50 text-zinc-700 dark:text-[#C7C6C9]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{lang.flag}</span>
                            <div className="text-left">
                              <div className="font-semibold text-zinc-900 dark:text-white">
                                {lang.name}
                              </div>
                              <div className="text-[10px] text-zinc-400 dark:text-[#646366]">
                                {lang.englishName}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <span style={{ color: currentAccent }}>
                              <AppIcon icon="solar:check-circle-bold" width={16} height={16} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 2. Theme Atmosphere Button (Matching Rectangular Form Factor) */}
          {onOpenThemes && (
            <button
              type="button"
              onClick={onOpenThemes}
              className="w-12 h-12 rounded-2xl bg-white dark:bg-[#141415] border border-zinc-200 dark:border-[#16161C] hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs flex items-center justify-center text-zinc-700 dark:text-[#C7C6C9] hover:text-black dark:hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Themes & Atmosphere"
            >
              <AppIcon icon="solar:palette-linear" width={20} height={20} />
            </button>
          )}

          {/* 3. Settings Button (Rectangular Button matching Add Alarm style) */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-[#141415] border border-zinc-200 dark:border-[#16161C] hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs flex items-center justify-center text-zinc-700 dark:text-[#C7C6C9] hover:text-black dark:hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Settings & Profile"
          >
            <AppIcon icon="solar:settings-linear" width={20} height={20} />
          </button>

        </div>

      </div>
    </header>
  );
};
