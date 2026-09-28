import React, { useState, useEffect, useRef } from 'react';
import { ThemeId } from '../types';
import { THEMES } from '../utils/themes';
import { AppIcon } from './AppIcon';

interface TimerSectionProps {
  currentTheme: ThemeId;
  onBack?: () => void;
}

export const TimerSection: React.FC<TimerSectionProps> = ({ currentTheme, onBack }) => {
  const [totalSeconds, setTotalSeconds] = useState<number>(75 * 60); // 1h 15m default
  const [remainingSeconds, setRemainingSeconds] = useState<number>(75 * 60 * 0.65); // 65% remaining
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<any>(null);

  const theme = THEMES[currentTheme] || THEMES.onyx_minimal;
  const highlightColor = theme.previewAccent || '#F85E2B';

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatHoursMinutes = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  const progressPercent = Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100);

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const handleSetPreset = (minutes: number) => {
    setIsRunning(false);
    setTotalSeconds(minutes * 60);
    setRemainingSeconds(minutes * 60);
  };

  return (
    <div className="space-y-8 py-2 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:text-[#C7C6C9] dark:hover:text-white bg-white dark:bg-[#141415] border border-zinc-200 dark:border-[#16161C] transition-colors cursor-pointer text-xs font-semibold shadow-xs"
              title="Back to Alarms"
            >
              <AppIcon icon="solar:arrow-left-linear" width={16} height={16} />
              <span>Back</span>
            </button>
          )}
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000001] dark:text-white">
            StopWatch & Timer
          </h2>
        </div>
        <div className="flex gap-2">
          {[15, 25, 45, 75].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleSetPreset(m)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-[#141415] border border-zinc-200 dark:border-[#16161C] text-zinc-600 dark:text-[#C7C6C9] hover:border-zinc-400 cursor-pointer"
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Circular Progress Ring (Matching 2nd Screen of Image) */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          
          {/* SVG Circular Ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
            {/* Background Track */}
            <circle
              cx="120"
              cy="120"
              r="95"
              className="stroke-zinc-200 dark:stroke-[#16161C]"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Animated Progress Arc */}
            <circle
              cx="120"
              cy="120"
              r="95"
              stroke={highlightColor}
              strokeWidth="12"
              strokeDasharray={596}
              strokeDashoffset={596 - (596 * (100 - progressPercent)) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Center Info Typography */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <span className="text-4xl sm:text-5xl font-black text-[#000001] dark:text-white tracking-tight tabular-nums">
              {formatHoursMinutes(remainingSeconds)}
            </span>
            <span className="text-xs font-semibold text-zinc-400 dark:text-[#646366] uppercase tracking-wider mt-1">
              Remaining
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-[#C7C6C9] mt-2 max-w-[140px] truncate">
              {formatHoursMinutes(totalSeconds)} total duration
            </span>
          </div>

        </div>
      </div>

      {/* Task Status Card (Matching Image) */}
      <div className="max-w-sm mx-auto text-center space-y-1 p-5 rounded-3xl bg-white dark:bg-[#141415] border border-zinc-200/80 dark:border-[#16161C] shadow-xs">
        <h3 className="text-base font-bold text-[#000001] dark:text-white">
          Morning Calm & Focus
        </h3>
        <p className="text-xs text-zinc-400 dark:text-[#646366]">
          {isRunning ? 'Currently focusing softly' : 'Paused / Ready'}
        </p>
        <p className="text-xs font-medium text-zinc-600 dark:text-[#C7C6C9] pt-2">
          {progressPercent}% routine completed
        </p>
      </div>

      {/* Control Buttons (Matching Image: [ || ] and [ ⏹ ]) */}
      <div className="flex items-center justify-center gap-4 pt-4">
        {/* Pause / Play Button */}
        <button
          type="button"
          onClick={handleToggle}
          className="w-16 h-14 rounded-2xl bg-white dark:bg-[#141415] border border-zinc-200 dark:border-[#16161C] text-zinc-800 dark:text-white hover:bg-zinc-50 dark:hover:bg-[#16161C] shadow-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title={isRunning ? 'Pause' : 'Start'}
        >
          <AppIcon
            icon={isRunning ? 'solar:pause-linear' : 'solar:play-linear'}
            width={24}
            height={24}
          />
        </button>

        {/* Stop / Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          style={{ backgroundColor: highlightColor }}
          className="w-16 h-14 rounded-2xl text-white shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          title="Reset Timer"
        >
          <AppIcon icon="solar:stop-linear" width={22} height={22} />
        </button>
      </div>

    </div>
  );
};
