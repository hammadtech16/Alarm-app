import React, { useState, useEffect } from 'react';
import { Alarm, ThemeId, UserProfile } from '../types';
import { DailyMaternalMessage, fetchDailyMaternalMessage } from '../utils/maternalWisdom';
import { getLanguageConfig } from '../utils/languages';
import { speakMaternalMessage, stopSpeaking } from '../utils/audioEngine';
import { Button, Chip } from '@heroui/react';
import { Volume2, VolumeX, Sparkles, RefreshCw, Bell, Play, Heart, Sun } from 'lucide-react';

interface ClockDisplayProps {
  profile: UserProfile;
  alarms: Alarm[];
  currentTheme: ThemeId;
  onPreviewAlarm: () => void;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({
  profile,
  alarms,
  currentTheme,
  onPreviewAlarm,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyMessage, setDailyMessage] = useState<DailyMaternalMessage | null>(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [isSpeakingMessage, setIsSpeakingMessage] = useState(false);
  const [use24Hour, setUse24Hour] = useState(false);

  const langConfig = getLanguageConfig(profile.language || 'ur');

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load maternal daily affirmation on mount or profile tone / language update
  useEffect(() => {
    loadDailyMessage();
  }, [profile.maternalTone, profile.name, profile.language]);

  const loadDailyMessage = async () => {
    setIsLoadingMessage(true);
    try {
      const msg = await fetchDailyMaternalMessage(
        profile.name,
        profile.nickname,
        profile.maternalTone,
        profile.language || 'ur'
      );
      setDailyMessage(msg);
    } catch (e) {
      console.warn('Error fetching daily message', e);
    } finally {
      setIsLoadingMessage(false);
    }
  };

  const handleSpeakDaily = () => {
    if (isSpeakingMessage) {
      stopSpeaking();
      setIsSpeakingMessage(false);
      return;
    }

    if (!dailyMessage) return;

    setIsSpeakingMessage(true);
    speakMaternalMessage(dailyMessage.spokenGreeting, {
      pitch: profile.voicePitch || 1.15,
      rate: profile.language === 'ur' ? 0.82 : (profile.voiceRate || 0.88),
      lang: profile.language || 'ur',
      onEnd: () => setIsSpeakingMessage(false),
      onError: () => setIsSpeakingMessage(false),
    });
  };

  // Find next enabled alarm
  const getNextAlarmInfo = (): { alarm: Alarm; diffFormatted: string } | null => {
    const enabledAlarms = alarms.filter((a) => a.enabled);
    if (enabledAlarms.length === 0) return null;

    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.getDay();

    let shortestMinutesDiff = Infinity;
    let nextAlarm: Alarm | null = null;

    for (const alarm of enabledAlarms) {
      const [h, m] = alarm.time.split(':').map(Number);
      const alarmMinutesOfDay = h * 60 + m;

      if (!alarm.days || alarm.days.length === 0) {
        // One-time alarm
        let diff = alarmMinutesOfDay - currentMinutes;
        if (diff <= 0) diff += 24 * 60; // tomorrow
        if (diff < shortestMinutesDiff) {
          shortestMinutesDiff = diff;
          nextAlarm = alarm;
        }
      } else {
        // Repeating on specific days
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const targetDay = (currentDay + dayOffset) % 7;
          if (alarm.days.includes(targetDay)) {
            let diff = dayOffset * 24 * 60 + (alarmMinutesOfDay - currentMinutes);
            if (diff <= 0) {
              diff += 7 * 24 * 60;
            }
            if (diff < shortestMinutesDiff) {
              shortestMinutesDiff = diff;
              nextAlarm = alarm;
            }
            break;
          }
        }
      }
    }

    if (!nextAlarm) return null;

    const hours = Math.floor(shortestMinutesDiff / 60);
    const minutes = shortestMinutesDiff % 60;
    const diffFormatted =
      hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`;

    return { alarm: nextAlarm, diffFormatted };
  };

  const nextAlarmInfo = getNextAlarmInfo();

  // Format time display
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  
  const displayHours = use24Hour 
    ? String(hours).padStart(2, '0') 
    : String(hours % 12 || 12).padStart(2, '0');
  const displayMinutes = String(minutes).padStart(2, '0');
  const displaySeconds = String(seconds).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="w-full space-y-6">
      {/* Central Maternal Breathing Clock Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border transition-all duration-300 bg-white/70 dark:bg-zinc-900/70 border-zinc-200/80 dark:border-zinc-800/80 shadow-sm backdrop-blur-md">
        
        {/* Soothing Radial Glow in Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-200/20 dark:bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Date & Sun Greeting */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium tracking-wide uppercase text-zinc-500 dark:text-zinc-400 mb-2">
            <Sun size={15} className="text-amber-500 animate-spin-slow" />
            <span>{dateString}</span>
          </div>

          {/* Large Clock Display */}
          <div className="flex items-baseline justify-center select-none font-sans font-light tracking-tight text-zinc-900 dark:text-zinc-50 my-2">
            <span className="text-6xl sm:text-8xl md:text-9xl font-semibold tabular-nums">
              {displayHours}
            </span>
            <span className="text-5xl sm:text-7xl md:text-8xl mx-1 font-extralight text-zinc-400 dark:text-zinc-600 animate-pulse">
              :
            </span>
            <span className="text-6xl sm:text-8xl md:text-9xl font-semibold tabular-nums">
              {displayMinutes}
            </span>
            
            <div className="flex flex-col items-start ml-2 sm:ml-3 text-left">
              {!use24Hour && (
                <span className="text-base sm:text-2xl font-bold tracking-wider text-zinc-600 dark:text-zinc-300">
                  {ampm}
                </span>
              )}
              <span className="text-xs sm:text-sm font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
                :{displaySeconds}
              </span>
            </div>
          </div>

          {/* Next Alarm Countdown Pill */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {nextAlarmInfo ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm bg-zinc-100 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                <Bell size={13} className="text-amber-500 shrink-0" />
                <span>
                  Waking up in <strong>{nextAlarmInfo.diffFormatted}</strong> ({nextAlarmInfo.alarm.time})
                </span>
                <span className="hidden sm:inline text-zinc-400 dark:text-zinc-500">• Sweet dreams</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                <Bell size={12} className="opacity-50" />
                <span>No alarms active • Rest as long as your heart needs</span>
              </div>
            )}

            {/* Quick Test / Preview Wake-Up Button */}
            <button
              type="button"
              onClick={onPreviewAlarm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
              title="Test the gentle maternal waking experience right now"
            >
              <Play size={11} className="fill-current text-amber-500" />
              <span>Preview Wake-Up</span>
            </button>
          </div>

        </div>
      </div>

      {/* Maternal Daily Wisdom & Affirmation Note */}
      {dailyMessage && (
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border bg-white/80 dark:bg-zinc-900/80 border-zinc-200/80 dark:border-zinc-800/80 shadow-xs transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30">
                <Heart size={15} className="fill-current" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {dailyMessage.headline}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                  <span>From Mom to {profile.nickname || profile.name || 'her sweetheart'}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/40">
                    {langConfig.flag} Spoken in {langConfig.name} ({langConfig.englishName})
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons: Listen & Regenerate */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleSpeakDaily}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
                  isSpeakingMessage
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs animate-pulse'
                    : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
                title={isSpeakingMessage ? 'Stop speaking' : `Listen to Mom speak in ${langConfig.englishName}`}
              >
                {isSpeakingMessage ? (
                  <>
                    <VolumeX size={13} />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={13} />
                    <span>Listen to Mom</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={loadDailyMessage}
                disabled={isLoadingMessage}
                className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title="Get a new maternal message for today"
              >
                <RefreshCw size={14} className={isLoadingMessage ? 'animate-spin text-amber-500' : ''} />
              </button>
            </div>
          </div>

          {/* Maternal Spoken Greeting Quote */}
          <blockquote className="text-sm sm:text-base font-serif italic text-zinc-700 dark:text-zinc-300 leading-relaxed pl-3 border-l-2 border-amber-300 dark:border-amber-500 my-3">
            "{dailyMessage.spokenGreeting}"
          </blockquote>

          {/* English Affirmation if spoken in another language */}
          {dailyMessage.affirmation && (
            <div className="text-xs text-zinc-600 dark:text-zinc-400 italic pl-3 mb-2">
              "{dailyMessage.affirmation}"
            </div>
          )}

          {/* Maternal Daily Tip */}
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-500 shrink-0" />
              <span>Mom's Tip: {dailyMessage.maternalTip}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
