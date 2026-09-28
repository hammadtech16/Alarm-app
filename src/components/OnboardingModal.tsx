import React, { useState } from 'react';
import { AppLogo } from './AppLogo';
import { MaternalTone, ThemeId, UserProfile } from '../types';
import { THEMES } from '../utils/themes';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../utils/languages';
import { speakMaternalMessage, stopSpeaking } from '../utils/audioEngine';
import { Button, Chip } from '@heroui/react';
import { Heart, Volume2, Sparkles, ArrowRight, Check, Globe } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile, selectedTheme: ThemeId) => void;
  currentTheme: ThemeId;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  currentTheme,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [language, setLanguage] = useState<string>('ur'); // Default to Urdu for Pakistani customization
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('Beta');
  const [customNickname, setCustomNickname] = useState('');
  const [maternalTone, setMaternalTone] = useState<MaternalTone>('gentle');
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(currentTheme);
  const [wakeUpGoal, setWakeUpGoal] = useState('A calm, peaceful morning without rushing');
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);

  if (!isOpen) return null;

  const currentLangConfig = getLanguageConfig(language);
  const effectiveNickname = customNickname.trim() || nickname || currentLangConfig.defaultPetName;
  const effectiveName = firstName.trim() || 'My Child';

  // Switch voice language
  const handleSelectLanguage = (code: string) => {
    setLanguage(code);
    const cfg = getLanguageConfig(code);
    setNickname(cfg.defaultPetName);
    setCustomNickname('');
  };

  const handleTestVoice = () => {
    setIsPlayingGreeting(true);
    let greeting = '';
    if (language === 'ur') {
      greeting = `السلام علیکم ${effectiveName}! صبح بخیر۔ اٹھ جاؤ میرے پیارے ${effectiveNickname}، اللہ آپ کا دن برکت اور خوشیوں سے بھر دے۔ ماں آپ کے لیے ہمیشہ دعا گو ہے۔`;
    } else if (language === 'hi') {
      greeting = `सुप्रभात ${effectiveName}! उठ जाओ मेरे प्यारे ${effectiveNickname}, नया सवेरा आपका स्वागत कर रहा है। माँ आपसे बहुत प्यार करती है।`;
    } else if (language === 'ar') {
      greeting = `صباح الخير يا ${effectiveName}! استيقظ بهدوء يا ${effectiveNickname}، أمك تدعو لك بيوم مبارك وسعيد.`;
    } else {
      greeting = `Good morning ${effectiveName}! It is so wonderful to meet you, ${effectiveNickname}. Mom will wake you up gently in your language tomorrow morning.`;
    }

    speakMaternalMessage(greeting, {
      pitch: 1.15,
      rate: language === 'ur' ? 0.82 : 0.88,
      lang: language,
      onEnd: () => setIsPlayingGreeting(false),
      onError: () => setIsPlayingGreeting(false),
    });
  };

  const handleFinish = () => {
    stopSpeaking();
    const profile: UserProfile = {
      name: effectiveName,
      nickname: effectiveNickname,
      maternalTone,
      wakeUpGoal,
      onboarded: true,
      voicePitch: 1.15,
      voiceRate: language === 'ur' ? 0.85 : 0.9,
      language,
    };
    onComplete(profile, selectedTheme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white text-zinc-900 shadow-2xl border border-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header aura */}
        <div className="bg-gradient-to-b from-amber-50 to-white dark:from-zinc-800 dark:to-zinc-900 p-6 sm:p-7 text-center border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex justify-center mb-2.5">
            <AppLogo size={52} variant={selectedTheme === 'monochrome' ? 'monochrome' : 'warm'} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight">
            Welcome to Mimi
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
            A gentle maternal alarm clock that speaks like a loving mother to start your day with peace.
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-7 bg-zinc-900 dark:bg-zinc-100'
                    : s < step
                    ? 'w-3 bg-zinc-400 dark:bg-zinc-600'
                    : 'w-2 bg-zinc-200 dark:bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Body (All English UI) */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[60vh] overflow-y-auto">
          
          {/* STEP 1: Mother's Voice Language Selection */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Choose Mom's Voice Language
                  </label>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Select the native language Mom will speak when waking you up.
                  </p>
                </div>
                <Chip size="sm" variant="soft" color="warning" className="inline-flex items-center gap-1">
                  <Globe size={12} className="inline mr-1" />
                  <span>Global Voices</span>
                </Chip>
              </div>

              {/* Language Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.values(SUPPORTED_LANGUAGES).map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/90 shadow-xs ring-1 ring-zinc-900 dark:ring-zinc-100'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <span>{lang.name}</span>
                            {lang.code === 'ur' && (
                              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
                                Pakistan
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {lang.englishName}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Spoken Voice Preview Test Button */}
              <button
                type="button"
                onClick={handleTestVoice}
                disabled={isPlayingGreeting}
                className="w-full py-2.5 px-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-100/60 text-amber-900 dark:text-amber-300 flex items-center justify-center gap-2 text-xs font-semibold transition-all"
              >
                <Volume2 size={16} className={isPlayingGreeting ? 'animate-pulse text-amber-600' : ''} />
                <span>
                  {isPlayingGreeting 
                    ? 'Mom is speaking in your language...' 
                    : `Listen to Mom speak in ${currentLangConfig.englishName}`}
                </span>
              </button>
            </div>
          )}

          {/* STEP 2: Name and Nickname */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  What is your first name?
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Hammad, Alex, Sarah, Ali"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                  autoFocus
                />
                <p className="text-xs text-zinc-400 mt-1">
                  Mom will tenderly say your name when it's time to wake up.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  What pet name would you like Mom to call you?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {currentLangConfig.petNameSuggestions.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setNickname(preset);
                        setCustomNickname('');
                      }}
                      className={`px-3 py-2 text-xs sm:text-sm rounded-xl font-medium border transition-all text-center ${
                        nickname === preset && !customNickname
                          ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                          : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <input
                    type="text"
                    value={customNickname}
                    onChange={(e) => setCustomNickname(e.target.value)}
                    placeholder="Or type a custom nickname (e.g. Beta, Champ, Little Bear)"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Maternal Tone */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Choose Mom's Morning Tone:
                </label>
                <div className="space-y-2.5">
                  {[
                    {
                      id: 'gentle',
                      title: 'Gentle & Tender Whisper',
                      desc: 'Soft, slow, calming words with no pressure.',
                    },
                    {
                      id: 'warm',
                      title: 'Warm & Encouraging',
                      desc: 'Loving motherly hugs, proud affirmations, and quiet strength.',
                    },
                    {
                      id: 'cozy',
                      title: 'Cozy Morning Bed',
                      desc: 'Snug, sweet wake-up with slow stretches and calm smiles.',
                    },
                    {
                      id: 'cheerful',
                      title: 'Morning Sunshine',
                      desc: 'Uplifting, optimistic, and smiling start to the day.',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMaternalTone(item.id as MaternalTone)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                        maternalTone === item.id
                          ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/80 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                      {maternalTone === item.id && (
                        <div className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shrink-0 ml-2 mt-0.5">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice preview test button */}
              <button
                type="button"
                onClick={handleTestVoice}
                disabled={isPlayingGreeting}
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium transition-all"
              >
                <Volume2 size={16} className={isPlayingGreeting ? 'animate-pulse text-amber-500' : ''} />
                <span>{isPlayingGreeting ? 'Speaking gently...' : `Hear Mom say hello in ${currentLangConfig.name}`}</span>
              </button>
            </div>
          )}

          {/* STEP 4: Theme Selection */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Select Visual Atmosphere:
                  </label>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {THEMES[selectedTheme].name}
                  </span>
                </div>

                {/* Primary B&W Theme Card */}
                <div
                  onClick={() => setSelectedTheme('monochrome')}
                  className={`cursor-pointer p-3.5 mb-3 rounded-2xl border transition-all flex items-center justify-between ${
                    selectedTheme === 'monochrome'
                      ? 'border-zinc-950 bg-zinc-900 text-white shadow-md'
                      : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-black border border-zinc-700 flex items-center justify-center text-white text-xs font-bold">
                      B&W
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        Noir & White (Primary Minimalist)
                      </div>
                      <div className="text-xs opacity-75">
                        Clean maternal typography, zero clutter
                      </div>
                    </div>
                  </div>
                  {selectedTheme === 'monochrome' && (
                    <div className="w-5 h-5 rounded-full bg-white text-zinc-900 flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Soft Pastel Themes */}
                <div className="grid grid-cols-2 gap-2.5">
                  {(Object.keys(THEMES) as ThemeId[])
                    .filter((id) => id !== 'monochrome')
                    .map((id) => {
                      const theme = THEMES[id];
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setSelectedTheme(id)}
                          className={`p-3 rounded-2xl border text-left transition-all relative ${
                            selectedTheme === id
                              ? 'border-zinc-900 ring-2 ring-zinc-900 dark:border-zinc-100 dark:ring-zinc-100 shadow-sm'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                          }`}
                          style={{ backgroundColor: theme.previewBg }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-900">
                              {theme.name}
                            </span>
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10"
                              style={{ backgroundColor: theme.previewAccent }}
                            />
                          </div>
                          <p className="text-[11px] text-zinc-600 line-clamp-1 mt-1">
                            {theme.tagline}
                          </p>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls (All in English) */}
        <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Back
            </button>
          ) : (
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Heart size={13} className="text-rose-400" />
              <span>Personalized for you</span>
            </div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm flex items-center gap-2 transition-all"
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm flex items-center gap-2 transition-all"
            >
              <Sparkles size={14} />
              <span>Begin Gentle Mornings</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
