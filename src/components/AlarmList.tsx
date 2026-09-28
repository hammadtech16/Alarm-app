import React from 'react';
import { Alarm, VoiceNote } from '../types';
import { AlarmCard } from './AlarmCard';
import { Chip } from '@heroui/react';
import { Plus, Bell, Heart, Sun, Moon } from 'lucide-react';

interface AlarmListProps {
  alarms: Alarm[];
  voiceNotes: VoiceNote[];
  onToggleAlarm: (id: string, enabled: boolean) => void;
  onEditAlarm: (alarm: Alarm) => void;
  onDeleteAlarm: (id: string) => void;
  onAddNewAlarm: () => void;
}

export const AlarmList: React.FC<AlarmListProps> = ({
  alarms,
  voiceNotes,
  onToggleAlarm,
  onEditAlarm,
  onDeleteAlarm,
  onAddNewAlarm,
}) => {
  const activeCount = alarms.filter((a) => a.enabled).length;

  return (
    <div className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
              Gentle Alarms
            </h2>
            <Chip size="sm" variant="soft" color="default" className="text-xs font-semibold">
              {activeCount} active
            </Chip>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Personalized maternal wake-ups to start your day unhurried.
          </p>
        </div>

        {/* Add Alarm Button */}
        <button
          type="button"
          onClick={onAddNewAlarm}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-xs"
        >
          <Plus size={16} />
          <span>New Alarm</span>
        </button>
      </div>

      {/* Alarm Cards List */}
      {alarms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {alarms.map((alarm) => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              voiceNotes={voiceNotes}
              onToggle={onToggleAlarm}
              onEdit={onEditAlarm}
              onDelete={onDeleteAlarm}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 sm:p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto">
            <Heart size={24} />
          </div>
          <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
            No alarms set
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Tap the button above to create a comforting alarm that wakes you with a mother's loving voice.
          </p>
          <button
            type="button"
            onClick={onAddNewAlarm}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Create Your First Alarm
          </button>
        </div>
      )}
    </div>
  );
};
