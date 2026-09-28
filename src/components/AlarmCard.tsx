import React, { useState } from 'react';
import { Alarm, VoiceNote } from '../types';
import { playChimePattern } from '../utils/audioEngine';
import { 
  Bell, 
  Clock, 
  Volume2, 
  Trash2, 
  Edit3, 
  Mic, 
  Sparkles,
  Music,
  Play
} from 'lucide-react';

interface AlarmCardProps {
  alarm: Alarm;
  voiceNotes: VoiceNote[];
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AlarmCard: React.FC<AlarmCardProps> = ({
  alarm,
  voiceNotes,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Format 12-hour time with AM/PM
  const [hStr, mStr] = alarm.time.split(':');
  const hNum = parseInt(hStr, 10);
  const hour12 = hNum % 12 || 12;
  const ampm = hNum >= 12 ? 'PM' : 'AM';
  const timeFormatted = `${String(hour12).padStart(2, '0')}:${mStr} ${ampm}`;

  // Find linked voice note if any
  const linkedVoiceNote = alarm.soundType === 'voice_note' && alarm.voiceNoteId
    ? voiceNotes.find((v) => v.id === alarm.voiceNoteId)
    : null;

  // Format days repeat
  const formatDays = () => {
    if (!alarm.days || alarm.days.length === 0) return 'Once';
    if (alarm.days.length === 7) return 'Every day';
    if (
      alarm.days.length === 5 &&
      [1, 2, 3, 4, 5].every((d) => alarm.days.includes(d))
    )
      return 'Weekdays';
    if (alarm.days.length === 2 && [0, 6].every((d) => alarm.days.includes(d)))
      return 'Weekends';
    return alarm.days.map((d) => DAY_NAMES[d]).join(', ');
  };

  const handleTestSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingPreview(true);
    playChimePattern(alarm.chimeSound, 0.35);
    setTimeout(() => setIsPlayingPreview(false), 2500);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all duration-200 ${
        alarm.enabled
          ? 'bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 shadow-xs'
          : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/40 opacity-70'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Time and Details */}
        <div className="space-y-1 sm:space-y-2">
          {/* Label */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {alarm.label || 'Gentle Morning Alarm'}
            </span>
            {alarm.crescendo && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/40">
                Gradual Fade-in
              </span>
            )}
          </div>

          {/* Time Display */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
              {String(hour12).padStart(2, '0')}:{mStr}
            </span>
            <span className="text-sm sm:text-base font-bold text-zinc-500 dark:text-zinc-400">
              {ampm}
            </span>
          </div>

          {/* Sound & Repeat Information Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
            {/* Days badge */}
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
              {formatDays()}
            </span>

            {/* Sound type badge */}
            <button
              type="button"
              onClick={handleTestSound}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/40 inline-flex items-center gap-1.5 transition-colors"
              title="Click to preview this chime sound"
            >
              {alarm.soundType === 'voice_note' ? (
                <>
                  <Mic size={11} className="text-rose-500" />
                  <span className="truncate max-w-[130px]">
                    {linkedVoiceNote?.title || 'Voice Note'}
                  </span>
                </>
              ) : alarm.soundType === 'maternal_speech' ? (
                <>
                  <Sparkles size={11} className="text-amber-500" />
                  <span>Mom's Voice & Chimes</span>
                </>
              ) : (
                <>
                  <Music size={11} className="text-indigo-500" />
                  <span>Chimes</span>
                </>
              )}
              <Play size={9} className={isPlayingPreview ? 'fill-current animate-pulse' : 'fill-current opacity-70'} />
            </button>
          </div>
        </div>

        {/* Right: Big Easy Toggle & Action Buttons */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          
          {/* Big Tactile Toggle Switch (Intuitive for all ages) */}
          <button
            type="button"
            role="switch"
            aria-checked={alarm.enabled}
            onClick={() => onToggle(alarm.id, !alarm.enabled)}
            className={`relative inline-flex h-8 w-14 sm:h-9 sm:w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 shadow-xs ${
              alarm.enabled
                ? 'bg-zinc-900 dark:bg-zinc-100'
                : 'bg-zinc-200 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 sm:h-8 sm:w-8 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out ${
                alarm.enabled ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>

          {/* Edit / Delete Buttons */}
          <div className="flex items-center gap-1 sm:opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(alarm)}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Edit alarm settings"
            >
              <Edit3 size={15} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(alarm.id)}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Delete alarm"
            >
              <Trash2 size={15} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
