import React, { useState } from 'react';
import { UserProfile, MaternalTone, ThemeId } from '../types';
import { AppLogo } from './AppLogo';
import { AppIcon } from './AppIcon';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../utils/languages';
import { speakMaternalMessage, stopSpeaking } from '../utils/audioEngine';
import { 
  X, 
  User, 
  Volume2, 
  Sliders, 
  Moon, 
  Sun, 
  Sparkles, 
  Download, 
  Heart,
  Palette,
  Check,
  Globe
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  profile: UserProfile;
  currentTheme: ThemeId;
  darkMode: boolean;
  onSaveProfile: (profile: UserProfile) => void;
  onToggleDarkMode: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  profile,
  currentTheme,
  darkMode,
  onSaveProfile,
  onToggleDarkMode,
  onClose,
}) => {
  const [language, setLanguage] = useState<string>(profile.language || 'ur');
  const [name, setName] = useState(profile.name);
  const [nickname, setNickname] = useState(profile.nickname);
  const [maternalTone, setMaternalTone] = useState<MaternalTone>(profile.maternalTone);
  const [voicePitch, setVoicePitch] = useState(profile.voicePitch || 1.15);
  const [voiceRate, setVoiceRate] = useState(profile.voiceRate || 0.88);
  const [wakeUpGoal, setWakeUpGoal] = useState(profile.wakeUpGoal);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [iconVariant, setIconVariant] = useState<'monochrome' | 'warm' | 'pastel'>('monochrome');

  if (!isOpen) return null;

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    let testPhrase = '';
    if (language === 'ur') {
      testPhrase = `صبح بخیر ${nickname || name || 'بیٹا'}! امی کی آواز صبح آپ کو اس طرح پیار سے جگائے گی۔ اللہ آپ کو ہر قدم پر خوش اور سلامت رکھے۔`;
    } else {
      testPhrase = `Good morning ${nickname || name || 'sweetheart'}! This is how Mom's voice will sound when gently waking you. Take a deep, peaceful breath.`;
    }

    speakMaternalMessage(testPhrase, {
      pitch: voicePitch,
      rate: language === 'ur' ? 0.82 : voiceRate,
      lang: language,
      onEnd: () => setIsTestingVoice(false),
      onError: () => setIsTestingVoice(false),
    });
  };

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      language,
      name: name.trim() || 'My Child',
      nickname: nickname.trim() || (language === 'ur' ? 'بیٹا' : 'Sweetheart'),
      maternalTone,
      voicePitch,
      voiceRate,
      wakeUpGoal,
    };
    onSaveProfile(updated);
    onClose();
  };

  const handleDownloadIconSvg = () => {
    const svgElement = document.getElementById('maternal-app-icon-preview');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mimi_minimalist_app_icon_${iconVariant}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-2.5 rounded-xl flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Back / Close"
          >
            <AppIcon icon="solar:arrow-left-linear" width={18} height={18} />
            <span className="text-xs font-semibold">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <User size={16} />
            </span>
            <h2 className="text-base sm:text-lg font-bold">
              Settings & Profile
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close"
          >
            <AppIcon icon="solar:close-linear" width={18} height={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Mother's Voice Language Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs uppercase font-semibold text-zinc-400 tracking-wider">
                Mother's Voice Language
              </label>
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                <Globe size={13} />
                <span>Global & Urdu Support</span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(SUPPORTED_LANGUAGES).map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLanguage(l.code);
                    if (l.code === 'ur' && (nickname === 'Sweetheart' || !nickname)) {
                      setNickname('بیٹا');
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    language === l.code
                      ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-2xs font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{l.flag}</span>
                    <span className="text-xs font-semibold">{l.name}</span>
                  </div>
                  {language === l.code && <Check size={12} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* User Name & Nickname */}
          <div className="space-y-3">
            <label className="block text-xs uppercase font-semibold text-zinc-400 tracking-wider">
              Profile & Endearments
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Your First Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Mom's Pet Name For You
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Sweetheart, Sunshine"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Maternal Tone Style */}
          <div className="space-y-2">
            <label className="block text-xs uppercase font-semibold text-zinc-400 tracking-wider">
              Mom's Tone of Voice
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'gentle', label: 'Gentle Whisper' },
                { id: 'warm', label: 'Warm & Loving' },
                { id: 'cozy', label: 'Cozy Morning' },
                { id: 'cheerful', label: 'Morning Sunshine' },
                { id: 'grounding', label: 'Stillness & Peace' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setMaternalTone(t.id as any)}
                  className={`p-2.5 text-xs font-medium rounded-xl border text-center transition-all ${
                    maternalTone === t.id
                      ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-2xs'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Cadence & Pitch Sliders */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Sliders size={14} className="text-amber-500" />
                <span>Maternal Voice Synthesis Tuning</span>
              </span>
              <button
                type="button"
                onClick={handleTestVoice}
                disabled={isTestingVoice}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 shadow-2xs hover:bg-zinc-100"
              >
                <Volume2 size={12} className={isTestingVoice ? 'animate-pulse text-amber-500' : ''} />
                <span>{isTestingVoice ? 'Speaking...' : 'Test Voice'}</span>
              </button>
            </div>

            {/* Pitch */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Vocal Warmth / Pitch</span>
                <span>{voicePitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.9"
                max="1.35"
                step="0.05"
                value={voicePitch}
                onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Speed */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Speaking Rate (Calm & Unhurried)</span>
                <span>{voiceRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.1"
                step="0.05"
                value={voiceRate}
                onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Minimalist App Icon Showcase Card (Requested in brief) */}
          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Minimalist App Icon
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Maternal embrace motif cradling a gentle rising sun.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadIconSvg}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Download SVG vector file"
              >
                <Download size={13} />
                <span>Export SVG</span>
              </button>
            </div>

            {/* Icon Preview */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
              <div id="maternal-app-icon-preview">
                <AppLogo size={96} variant={iconVariant === 'monochrome' ? 'monochrome' : 'warm'} />
              </div>

              <div className="space-y-2 text-left">
                <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Choose Aesthetic Variant:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIconVariant('monochrome')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                      iconVariant === 'monochrome'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    B&W Minimalist
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconVariant('warm')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                      iconVariant === 'warm'
                        ? 'bg-amber-500 text-white'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    Warm Pastel Sun
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconVariant('pastel')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                      iconVariant === 'pastel'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    Lilac Blossom
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Low Light & Dark Mode Bedside Option */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Low-Light Bedside Dark Mode
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Softens glow for night-stand display and tired eyes
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100"
            >
              {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
};
