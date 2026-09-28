import React, { useState, useEffect } from 'react';
import { Alarm, ThemeId, UserProfile, VoiceNote } from '../types';
import { THEMES } from '../utils/themes';
import { DailyMaternalMessage, fetchDailyMaternalMessage } from '../utils/maternalWisdom';
import { speakMaternalMessage, stopSpeaking } from '../utils/audioEngine';
import { getLanguageConfig } from '../utils/languages';
import { AppIcon } from './AppIcon';

interface MainAlarmsViewProps {
  profile: UserProfile;
  alarms: Alarm[];
  voiceNotes: VoiceNote[];
  currentTheme: ThemeId;
  darkMode: boolean;
  onToggleAlarm: (id: string) => void;
  onEditAlarm: (alarm: Alarm) => void;
  onAddNewAlarm: () => void;
  onDeleteAlarm: (id: string) => void;
  onPreviewAlarm: () => void;
}

export const MainAlarmsView: React.FC<MainAlarmsViewProps> = ({
  profile,
  alarms,
  voiceNotes,
  currentTheme,
  darkMode,
  onToggleAlarm,
  onEditAlarm,
  onAddNewAlarm,
  onDeleteAlarm,
  onPreviewAlarm,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyMessage, setDailyMessage] = useState<DailyMaternalMessage | null>(null);
  const [isSpeakingDaily, setIsSpeakingDaily] = useState(false);

  const theme = THEMES[currentTheme] || THEMES.onyx_minimal;
  const highlightColor = theme.previewAccent || '#F85E2B';
  const langConfig = getLanguageConfig(profile.language || 'ur');

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch daily maternal quote
  useEffect(() => {
    fetchDailyMaternalMessage(
      profile.name,
      profile.nickname,
      profile.maternalTone,
      profile.language || 'ur'
    ).then((msg) => setDailyMessage(msg));
  }, [profile.language, profile.maternalTone, profile.name]);

  // Format main current app time
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const h12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'pm' : 'am';
  const timeFormatted = `${h12}:${String(minutes).padStart(2, '0')}`;
  
  // Format date e.g. "Tue, 29 Apr"
  const dateFormatted = currentTime.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  // Calculate upcoming next alarm
  const getUpcomingAlarmId = () => {
    const enabledAlarms = alarms.filter((a) => a.enabled);
    if (enabledAlarms.length === 0) return null;

    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    let closestAlarm: Alarm | null = null;
    let minDiff = Infinity;

    for (const a of enabledAlarms) {
      const [h, m] = a.time.split(':').map(Number);
      const alarmMins = h * 60 + m;
      let diff = alarmMins - now;
      if (diff <= 0) diff += 24 * 60; // Next day
      if (diff < minDiff) {
        minDiff = diff;
        closestAlarm = a;
      }
    }
    return closestAlarm ? closestAlarm.id : enabledAlarms[0].id;
  };

  const upcomingAlarmId = getUpcomingAlarmId();

  // Helper to format countdown relative text
  const getRelativeAlarmTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    let diff = h * 60 + m - now;
    if (diff <= 0) diff += 24 * 60;

    const hoursLeft = Math.floor(diff / 60);
    const minsLeft = diff % 60;

    if (hoursLeft === 0) return `in ${minsLeft}m`;
    if (minsLeft === 0) return `in ${hoursLeft}h`;
    return `in ${hoursLeft}h ${minsLeft}m`;
  };

  // Helper to format 12h time for alarms
  const formatAlarmTime12 = (time24: string) => {
    const [hStr, mStr] = time24.split(':');
    const h = parseInt(hStr, 10);
    const h12 = h % 12 || 12;
    const a = h >= 12 ? 'pm' : 'am';
    return { time: `${h12}:${mStr}`, ampm: a };
  };

  const handleSpeakDaily = () => {
    if (isSpeakingDaily) {
      stopSpeaking();
      setIsSpeakingDaily(false);
      return;
    }
    if (!dailyMessage) return;

    setIsSpeakingDaily(true);
    speakMaternalMessage(dailyMessage.spokenGreeting, {
      pitch: profile.voicePitch || 1.15,
      rate: profile.language === 'ur' ? 0.82 : 0.88,
      lang: profile.language || 'ur',
      onEnd: () => setIsSpeakingDaily(false),
      onError: () => setIsSpeakingDaily(false),
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header & Main Bold App Time (Matching Left Image) */}
      <div className="pt-2 sm:pt-4">
        
        {/* Category Label */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-[#646366]">
            World Clock & Alarms
          </span>
          <button
            type="button"
            onClick={onPreviewAlarm}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-[#C7C6C9] dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AppIcon icon="solar:play-circle-linear" width={16} height={16} />
            <span>Test Alarm</span>
          </button>
        </div>

        {/* Big Bold Heading Time (Matching "5:15pm" and "Tue, 29 Apr") */}
        <div className="text-center sm:text-left py-2">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-[#000001] dark:text-white tabular-nums leading-none">
            {timeFormatted}
            <span className="text-3xl sm:text-4xl font-normal ml-1 text-zinc-500 dark:text-[#C7C6C9]">
              {ampm}
            </span>
          </h1>
          <p className="text-sm sm:text-base font-medium text-zinc-500 dark:text-[#646366] mt-2 tracking-wide">
            {dateFormatted}
          </p>
        </div>

        {/* Mom's Daily Spoken Wisdom Banner */}
        {dailyMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-[#141415] border border-zinc-200/80 dark:border-[#16161C] shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                style={{ backgroundColor: highlightColor }}
              >
                <AppIcon icon="solar:heart-bold" width={20} height={20} />
              </div>
              <div className="text-left overflow-hidden">
                <div className="text-[11px] font-bold text-zinc-400 dark:text-[#646366] uppercase tracking-wider">
                  Mom's Note • {langConfig.name}
                </div>
                <p 
                  dir={profile.language === 'ur' || profile.language === 'ar' ? 'rtl' : 'ltr'}
                  className="text-xs sm:text-sm font-serif italic text-zinc-800 dark:text-[#C7C6C9] truncate"
                >
                  "{dailyMessage.spokenGreeting}"
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSpeakDaily}
              className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                isSpeakingDaily
                  ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                  : 'bg-zinc-100 dark:bg-[#16161C] text-zinc-700 dark:text-[#C7C6C9] border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
              title="Listen to Mom speak"
            >
              <AppIcon icon={isSpeakingDaily ? 'solar:volume-cross-linear' : 'solar:volume-loud-linear'} width={18} height={18} />
            </button>
          </div>
        )}

      </div>

      {/* Alarms Section (Replaced Locations from the image) */}
      <div className="space-y-3">
        
        {/* Section Heading: "Alarms" (Replacing "Locations" heading from image) */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-[#C7C6C9]">
            Alarms
          </h2>
          <span className="text-xs text-zinc-400 dark:text-[#646366]">
            {alarms.filter((a) => a.enabled).length} Active
          </span>
        </div>

        {/* Alarms Cards List */}
        <div className="space-y-3">
          {alarms.length === 0 ? (
            <div 
              onClick={onAddNewAlarm}
              className="p-8 rounded-3xl bg-white dark:bg-[#141415] border border-dashed border-zinc-300 dark:border-[#16161C] text-center cursor-pointer hover:border-zinc-400 transition-colors"
            >
              <div 
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white mb-3"
                style={{ backgroundColor: highlightColor }}
              >
                <AppIcon icon="solar:add-linear" width={24} height={24} />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                No Alarms Set Yet
              </h3>
              <p className="text-xs text-zinc-400 dark:text-[#646366] mt-1">
                Tap to create your first gentle awakening alarm
              </p>
            </div>
          ) : (
            alarms.map((alarm) => {
              const isUpcoming = alarm.id === upcomingAlarmId && alarm.enabled;
              const { time, ampm } = formatAlarmTime12(alarm.time);
              const relative = getRelativeAlarmTime(alarm.time);

              return (
                <div
                  key={alarm.id}
                  style={
                    isUpcoming
                      ? { backgroundColor: highlightColor }
                      : undefined
                  }
                  className={`relative p-5 rounded-3xl transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer select-none group ${
                    isUpcoming
                      ? 'text-white shadow-lg scale-[1.01]'
                      : 'bg-white dark:bg-[#141415] border border-zinc-200/80 dark:border-[#16161C] text-zinc-900 dark:text-[#C7C6C9] hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs'
                  }`}
                  onClick={() => onEditAlarm(alarm)}
                >
                  {/* Left Side: Alarm Label & Countdown/Repeat */}
                  <div className="flex-1 min-w-0 pr-2">
                    <h3
                      className={`text-base sm:text-lg font-bold truncate ${
                        isUpcoming
                          ? 'text-white'
                          : 'text-[#000001] dark:text-white'
                      }`}
                    >
                      {alarm.label || 'Gentle Awakening'}
                    </h3>
                    <p
                      className={`text-xs font-medium mt-0.5 truncate ${
                        isUpcoming
                          ? 'text-white/80'
                          : 'text-zinc-500 dark:text-[#646366]'
                      }`}
                    >
                      {alarm.enabled ? `${relative} • ${alarm.repeatText || 'Every Day'}` : 'Alarm is off'}
                    </p>
                  </div>

                  {/* Right Side: Bold Time & Toggle Button (Matching Image) */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${
                          isUpcoming
                            ? 'text-white'
                            : 'text-[#000001] dark:text-white'
                        }`}
                      >
                        {time}
                      </span>
                      <span
                        className={`text-sm sm:text-base font-medium ml-1 ${
                          isUpcoming
                            ? 'text-white/80'
                            : 'text-zinc-500 dark:text-[#646366]'
                        }`}
                      >
                        {ampm}
                      </span>
                    </div>

                    {/* On/Off Toggle Switch */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleAlarm(alarm.id);
                      }}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                        alarm.enabled
                          ? isUpcoming
                            ? 'bg-black/30 border border-white/40'
                            : 'border border-transparent'
                          : 'bg-zinc-200 dark:bg-[#16161C] border border-zinc-300 dark:border-zinc-800'
                      }`}
                      style={
                        alarm.enabled && !isUpcoming
                          ? { backgroundColor: highlightColor }
                          : undefined
                      }
                      title={alarm.enabled ? 'Turn Alarm Off' : 'Turn Alarm On'}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-xs ${
                          alarm.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
