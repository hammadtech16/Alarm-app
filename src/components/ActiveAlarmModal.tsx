import React, { useState, useEffect, useRef } from 'react';
import { Alarm, ThemeId, UserProfile, VoiceNote } from '../types';
import { THEMES } from '../utils/themes';
import { 
  speakMaternalMessage, 
  stopSpeaking,
  playVoiceNoteAudio,
  stopVoiceNoteAudio
} from '../utils/audioEngine';
import { 
  getMaternalWakeUpSpeech, 
  getMaternalSnoozeSpeech, 
  getMaternalDismissSpeech 
} from '../utils/maternalWisdom';
import { getLanguageConfig } from '../utils/languages';
import { AppIcon } from './AppIcon';

interface ActiveAlarmModalProps {
  alarm: Alarm;
  profile: UserProfile;
  voiceNotes: VoiceNote[];
  currentTheme?: ThemeId;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

export const ActiveAlarmModal: React.FC<ActiveAlarmModalProps> = ({
  alarm,
  profile,
  voiceNotes,
  currentTheme = 'onyx_minimal',
  onDismiss,
  onSnooze,
}) => {
  const theme = THEMES[currentTheme] || THEMES.onyx_minimal;
  const accent = theme.previewAccent || '#F85E2B';

  const [currentDisplayTime, setCurrentDisplayTime] = useState(new Date());
  const [spokenMessage, setSpokenMessage] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(1.0);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isSnoozing, setIsSnoozing] = useState(false);
  const [isSpeakingNow, setIsSpeakingNow] = useState(true);

  const langConfig = getLanguageConfig(profile.language || 'ur');
  const userLang = profile.language || 'ur';

  const loopTimeoutRef = useRef<any>(null);
  const isDismissingRef = useRef(false);
  const isSnoozingRef = useRef(false);

  useEffect(() => {
    // Current time ticker
    const timer = setInterval(() => setCurrentDisplayTime(new Date()), 1000);

    // Prepare maternal greeting text in user's chosen language
    const message = getMaternalWakeUpSpeech(
      profile.name,
      profile.nickname,
      profile.maternalTone,
      alarm.customMessage,
      userLang
    );
    setSpokenMessage(message);

    // Read the message right away without any chimes music!
    triggerAlarmAudio(message, 1.0);

    return () => {
      clearInterval(timer);
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
      stopSpeaking();
      stopVoiceNoteAudio();
    };
  }, []);

  const triggerAlarmAudio = (message: string, vol: number) => {
    if (isDismissingRef.current || isSnoozingRef.current) return;

    // If alarm is configured with custom recorded voice note
    if (alarm.soundType === 'voice_note' && alarm.voiceNoteId) {
      const vn = voiceNotes.find((v) => v.id === alarm.voiceNoteId);
      if (vn?.audioBlobBase64) {
        playVoiceNoteAudio(vn.audioBlobBase64);
        return;
      }
    }

    // Read Mom's message immediately
    setIsSpeakingNow(true);
    speakMaternalMessage(message, {
      pitch: profile.voicePitch || 1.15,
      rate: userLang === 'ur' ? 0.82 : (profile.voiceRate || 0.88),
      volume: vol,
      lang: userLang,
      onEnd: () => {
        setIsSpeakingNow(false);
        // After Mom finishes speaking, repeat message after a gentle 3.5s pause until dismissed or snoozed
        if (!isDismissingRef.current && !isSnoozingRef.current) {
          loopTimeoutRef.current = setTimeout(() => {
            if (!isDismissingRef.current && !isSnoozingRef.current) {
              triggerAlarmAudio(message, vol);
            }
          }, 3500);
        }
      },
      onError: () => {
        setIsSpeakingNow(false);
        if (!isDismissingRef.current && !isSnoozingRef.current) {
          loopTimeoutRef.current = setTimeout(() => {
            triggerAlarmAudio(message, vol);
          }, 4000);
        }
      }
    });
  };

  // Immediate exit button handler (Back button)
  const handleExitDirectly = () => {
    isDismissingRef.current = true;
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    stopSpeaking();
    stopVoiceNoteAudio();
    onDismiss();
  };

  const handleSnooze = () => {
    isSnoozingRef.current = true;
    setIsSnoozing(true);
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    stopSpeaking();
    stopVoiceNoteAudio();

    const snoozeWords = getMaternalSnoozeSpeech(profile.nickname, userLang);
    speakMaternalMessage(snoozeWords, {
      pitch: profile.voicePitch || 1.15,
      rate: userLang === 'ur' ? 0.82 : (profile.voiceRate || 0.88),
      lang: userLang,
      onEnd: () => {
        onSnooze(alarm.snoozeMinutes || 5);
      },
      onError: () => {
        onSnooze(alarm.snoozeMinutes || 5);
      },
    });
  };

  const handleDismiss = () => {
    isDismissingRef.current = true;
    setIsDismissing(true);
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    stopSpeaking();
    stopVoiceNoteAudio();

    const dismissWords = getMaternalDismissSpeech(profile.nickname, userLang);
    speakMaternalMessage(dismissWords, {
      pitch: profile.voicePitch || 1.15,
      rate: userLang === 'ur' ? 0.82 : (profile.voiceRate || 0.88),
      lang: userLang,
      onEnd: () => {
        onDismiss();
      },
      onError: () => {
        onDismiss();
      },
    });
  };

  // Format time
  const hours = currentDisplayTime.getHours();
  const minutes = currentDisplayTime.getMinutes();
  const hour12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const timeFormatted = `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  const isRtl = userLang === 'ur' || userLang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000001]/95 text-[#C7C6C9] backdrop-blur-2xl animate-in fade-in duration-300 select-none">
      
      {/* Top Left: PROMINENT BACK BUTTON (Smooth Return to App) */}
      <div className="absolute top-5 left-5 sm:top-7 sm:left-7 z-30">
        <button
          type="button"
          onClick={handleExitDirectly}
          className="h-11 px-4 rounded-2xl bg-[#141415] border border-[#16161C] hover:border-zinc-700 text-[#C7C6C9] hover:text-white flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer text-xs font-semibold"
          title="Back to Alarms"
        >
          <AppIcon icon="solar:arrow-left-linear" width={18} height={18} />
          <span>Back</span>
        </button>
      </div>

      {/* Top Right: Quick Close Icon */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-30">
        <button
          type="button"
          onClick={handleExitDirectly}
          className="w-11 h-11 rounded-2xl bg-[#141415] border border-[#16161C] hover:border-zinc-700 text-[#C7C6C9] hover:text-white flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
          title="Close Alarm Screen"
        >
          <AppIcon icon="solar:close-linear" width={20} height={20} />
        </button>
      </div>

      {/* Gentle Pulsing Sunrise Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div 
          style={{ background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)` }}
          className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full blur-3xl animate-pulse" 
        />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center flex flex-col items-center justify-center space-y-6 sm:space-y-8">
        
        {/* Maternal Sun Icon with Gentle Aura */}
        <div className="relative flex items-center justify-center">
          <div 
            style={{ backgroundColor: `${accent}25` }}
            className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full blur-xl animate-ping" 
          />
          <div 
            style={{ borderColor: `${accent}60`, color: accent }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#141415] border shadow-xl flex items-center justify-center"
          >
            <AppIcon icon="solar:sun-2-bold" width={44} height={44} />
          </div>
        </div>

        {/* Alarm Label & Clock */}
        <div className="space-y-2">
          <span 
            style={{ color: accent, borderColor: `${accent}40`, backgroundColor: `${accent}15` }}
            className="text-xs sm:text-sm font-semibold uppercase tracking-widest px-3.5 py-1 rounded-full border"
          >
            {alarm.label || 'Gentle Awakening'}
          </span>
          <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-white tabular-nums">
            {timeFormatted}
            <span className="text-2xl sm:text-3xl ml-2 font-normal text-[#646366]">
              {ampm}
            </span>
          </h1>
        </div>

        {/* Mom's Loving Spoken Note */}
        <div className="w-full max-w-md p-6 rounded-3xl bg-[#141415] border border-[#16161C] shadow-2xl backdrop-blur-md">
          <div 
            style={{ color: accent }}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold mb-3"
          >
            <AppIcon icon="solar:heart-bold" width={14} height={14} />
            <span>Mom speaking in {langConfig.name}</span>
            {isSpeakingNow && (
              <span 
                style={{ backgroundColor: accent }}
                className="inline-flex items-center gap-1 text-[10px] text-white px-2 py-0.5 rounded-full ml-1 animate-pulse"
              >
                <AppIcon icon="solar:volume-loud-bold" width={11} height={11} />
                <span>Speaking</span>
              </span>
            )}
          </div>

          {/* Spoken Text with Proper RTL/LTR Direction */}
          <div 
            dir={isRtl ? 'rtl' : 'ltr'} 
            className="text-center"
            style={{ unicodeBidi: 'plaintext' }}
          >
            <p className="text-base sm:text-lg font-medium italic text-zinc-100 leading-relaxed">
              "{spokenMessage}"
            </p>
          </div>
        </div>

        {/* Tactile Big Action Buttons */}
        <div className="w-full max-w-md space-y-3">
          
          {/* DISMISS BUTTON */}
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isDismissing || isSnoozing}
            style={{ backgroundColor: accent }}
            className="w-full py-4 sm:py-5 px-6 rounded-3xl text-white text-base sm:text-lg font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all transform active:scale-98 shadow-xl cursor-pointer hover:brightness-110"
          >
            <AppIcon icon="solar:stars-linear" width={20} height={20} />
            <span>{isDismissing ? "Mom's blessing you..." : "I'm awake Mom! Good morning ☀️"}</span>
          </button>

          {/* SNOOZE BUTTON */}
          <button
            type="button"
            onClick={handleSnooze}
            disabled={isDismissing || isSnoozing}
            className="w-full py-3.5 sm:py-4 px-6 rounded-3xl bg-[#141415] hover:bg-[#16161C] text-[#C7C6C9] hover:text-white border border-[#16161C] text-sm sm:text-base font-semibold transition-all transform active:scale-98 cursor-pointer"
          >
            {isSnoozing ? `Snoozing for ${alarm.snoozeMinutes || 5} minutes...` : `Just ${alarm.snoozeMinutes || 5} more minutes, Mom 😴`}
          </button>

        </div>

      </div>
    </div>
  );
};
