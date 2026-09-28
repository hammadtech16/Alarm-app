import React, { useState } from 'react';
import { ThemeId } from '../types';
import { THEMES } from '../utils/themes';
import { AppIcon } from './AppIcon';

interface BedtimesSectionProps {
  currentTheme: ThemeId;
  onSaveBedtimeAlarm?: (time: string, days: number[]) => void;
  onBack?: () => void;
}

export const BedtimesSection: React.FC<BedtimesSectionProps> = ({
  currentTheme,
  onSaveBedtimeAlarm,
  onBack,
}) => {
  const [bedtimeHour, setBedtimeHour] = useState(7);
  const [bedtimeMinute, setBedtimeMinute] = useState(0);
  const [bedtimeAmPm, setBedtimeAmPm] = useState<'AM' | 'PM'>('AM');
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [sunriseAlarm, setSunriseAlarm] = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const [selectedSound, setSelectedSound] = useState("Mom's Morning Du'a");
  const [savedNotification, setSavedNotification] = useState(false);

  const theme = THEMES[currentTheme] || THEMES.onyx_minimal;
  const highlightColor = theme.previewAccent || '#F85E2B';

  const daysLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const toggleDay = (idx: number) => {
    setActiveDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    );
  };

  const incrementTime = () => {
    setBedtimeMinute((prev) => {
      if (prev + 15 >= 60) {
        setBedtimeHour((h) => (h % 12) + 1);
        return 0;
      }
      return prev + 15;
    });
  };

  const decrementTime = () => {
    setBedtimeMinute((prev) => {
      if (prev - 15 < 0) {
        setBedtimeHour((h) => ((h - 2 + 12) % 12) + 1);
        return 45;
      }
      return prev - 15;
    });
  };

  const handleSave = () => {
    let h24 = bedtimeHour % 12;
    if (bedtimeAmPm === 'PM') h24 += 12;
    const timeStr = `${String(h24).padStart(2, '0')}:${String(bedtimeMinute).padStart(2, '0')}`;
    if (onSaveBedtimeAlarm) {
      onSaveBedtimeAlarm(timeStr, activeDays);
    }
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="space-y-6 py-2 animate-in fade-in duration-300 max-w-lg mx-auto">
      
      {/* Header (Matching 3rd Screen) */}
      <div className="flex items-center justify-between">
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
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000001] dark:text-white">
            Sleep Timer & Routine
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#646366] mt-0.5">
            Set a regular wake-up alarm
          </p>
        </div>
      </div>

      {/* Stepper Clock: [-]  7:00am  [+] */}
      <div className="py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={decrementTime}
          className="w-12 h-12 rounded-full bg-white dark:bg-[#141415] border border-zinc-200 dark:border-[#16161C] text-zinc-800 dark:text-white hover:bg-zinc-100 flex items-center justify-center text-2xl font-bold shadow-xs active:scale-95 cursor-pointer"
        >
          -
        </button>

        <div className="text-center">
          <span className="text-4xl sm:text-5xl font-black text-[#000001] dark:text-white tracking-tight tabular-nums">
            {bedtimeHour}:{String(bedtimeMinute).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={() => setBedtimeAmPm((a) => (a === 'AM' ? 'PM' : 'AM'))}
            className="text-lg font-bold ml-2 text-zinc-500 dark:text-[#C7C6C9] hover:text-zinc-900 cursor-pointer"
          >
            {bedtimeAmPm.toLowerCase()}
          </button>
        </div>

        <button
          type="button"
          onClick={incrementTime}
          style={{ backgroundColor: highlightColor }}
          className="w-12 h-12 rounded-full text-white flex items-center justify-center text-2xl font-bold shadow-md hover:scale-105 active:scale-95 cursor-pointer"
        >
          +
        </button>
      </div>

      {/* Day Pills: S M T W T F S (Matching 3rd Screen) */}
      <div className="flex items-center justify-between gap-1 px-2">
        {daysLabels.map((day, idx) => {
          const isActive = activeDays.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => toggleDay(idx)}
              style={isActive ? { backgroundColor: highlightColor } : undefined}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'text-white shadow-xs'
                  : 'bg-white dark:bg-[#141415] text-zinc-500 dark:text-[#646366] border border-zinc-200 dark:border-[#16161C] hover:border-zinc-400'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Option Cards (Matching 3rd Screen) */}
      <div className="space-y-3 pt-2">
        
        {/* Sunrise Alarm Card */}
        <div 
          onClick={() => setSunriseAlarm(!sunriseAlarm)}
          className="p-4 rounded-2xl bg-white dark:bg-[#141415] border border-zinc-200/80 dark:border-[#16161C] flex items-center justify-between cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-3">
            <AppIcon icon="solar:sun-2-linear" width={22} height={22} className="text-zinc-500 dark:text-[#C7C6C9]" />
            <div>
              <h4 className="text-sm font-bold text-[#000001] dark:text-white">
                Sunrise alarm
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-[#646366]">
                Slowly brighten screen before alarm
              </p>
            </div>
          </div>
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
            sunriseAlarm ? 'border-[#F85E2B] bg-[#F85E2B]' : 'border-zinc-300 dark:border-zinc-700'
          }`}>
            {sunriseAlarm && <span className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </div>

        {/* Vibrate Card (Highlighted Orange Card in 3rd Screen) */}
        <div 
          onClick={() => setVibrate(!vibrate)}
          style={vibrate ? { backgroundColor: highlightColor } : undefined}
          className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
            vibrate
              ? 'text-white shadow-md'
              : 'bg-white dark:bg-[#141415] border border-zinc-200/80 dark:border-[#16161C] text-zinc-800 dark:text-[#C7C6C9]'
          }`}
        >
          <div className="flex items-center gap-3">
            <AppIcon icon="solar:smartphone-vibration-linear" width={22} height={22} />
            <h4 className="text-sm font-bold">
              Vibrate
            </h4>
          </div>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            vibrate ? 'bg-white text-zinc-900' : 'border border-zinc-300'
          }`}>
            {vibrate && <AppIcon icon="solar:check-read-linear" width={14} height={14} />}
          </div>
        </div>

        {/* Sound Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#141415] border border-zinc-200/80 dark:border-[#16161C] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <AppIcon icon="solar:music-note-linear" width={22} height={22} className="text-zinc-500 dark:text-[#C7C6C9]" />
            <div>
              <h4 className="text-sm font-bold text-[#000001] dark:text-white">
                Sound
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-[#646366]">
                {selectedSound}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setSelectedSound((s) =>
                s.includes("Du'a") ? 'Gentle Morning Whisper' : "Mom's Morning Du'a"
              )
            }
            className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#16161C] text-zinc-600 dark:text-[#C7C6C9] hover:border-zinc-400"
          >
            Change
          </button>
        </div>

      </div>

      {/* Action Buttons: Skip and Next / Save */}
      <div className="pt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack || (() => {})}
          className="flex-1 py-3.5 rounded-2xl bg-white dark:bg-[#141415] border border-zinc-200 dark:border-[#16161C] text-xs font-bold text-zinc-600 dark:text-[#C7C6C9] hover:bg-zinc-50 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <AppIcon icon="solar:arrow-left-linear" width={16} height={16} />
          <span>Skip</span>
        </button>
        <button
          type="button"
          onClick={handleSave}
          style={{ backgroundColor: highlightColor }}
          className="flex-1 py-3.5 rounded-2xl text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
        >
          {savedNotification ? 'Saved ✓' : 'Save Routine'}
        </button>
      </div>

    </div>
  );
};
