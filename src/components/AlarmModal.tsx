import React, { useState, useEffect } from 'react';
import { Alarm, ChimeSoundId, VoiceNote } from '../types';
import { playChimePattern } from '../utils/audioEngine';
import { 
  X, 
  Clock, 
  Volume2, 
  Mic, 
  Sparkles, 
  Music, 
  Play, 
  Plus, 
  Check,
  Heart
} from 'lucide-react';

interface AlarmModalProps {
  isOpen: boolean;
  alarmToEdit: Alarm | null;
  voiceNotes: VoiceNote[];
  onSave: (alarm: Alarm) => void;
  onClose: () => void;
}

const CHIME_OPTIONS: Array<{ id: ChimeSoundId; label: string; desc: string }> = [
  { id: 'morning_chimes', label: 'Morning Chimes', desc: 'Serene pentatonic bells' },
  { id: 'harp_sunrise', label: 'Harp Sunrise', desc: 'Ascending tranquil strings' },
  { id: 'tibetan_bowl', label: 'Tibetan Singing Bowl', desc: 'Deep warm resonant hum' },
  { id: 'forest_birds', label: 'Forest Birds & Dew', desc: 'Airy soft chirps' },
];

const MATERNAL_LABEL_SUGGESTIONS = [
  'Gentle Morning Awakening',
  'Morning Sunshine & Stretch',
  'Warm Tea & Nourishment',
  'Study & Creative Time',
  'Bedtime Wind Down',
];

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  alarmToEdit,
  voiceNotes,
  onSave,
  onClose,
}) => {
  const [hour, setHour] = useState('07');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [label, setLabel] = useState('Gentle Morning Awakening');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [soundType, setSoundType] = useState<'maternal_speech' | 'voice_note' | 'chimes_only'>('maternal_speech');
  const [voiceNoteId, setVoiceNoteId] = useState<string>('');
  const [chimeSound, setChimeSound] = useState<ChimeSoundId>('morning_chimes');
  const [crescendo, setCrescendo] = useState(true);
  const [snoozeMinutes, setSnoozeMinutes] = useState(5);
  const [customMessage, setCustomMessage] = useState('');
  const [previewingChime, setPreviewingChime] = useState<ChimeSoundId | null>(null);

  useEffect(() => {
    if (alarmToEdit) {
      const [hStr, mStr] = alarmToEdit.time.split(':');
      const hNum = parseInt(hStr, 10);
      const isPm = hNum >= 12;
      const h12 = hNum % 12 || 12;
      setHour(String(h12).padStart(2, '0'));
      setMinute(mStr);
      setAmpm(isPm ? 'PM' : 'AM');
      setLabel(alarmToEdit.label);
      setDays(alarmToEdit.days || []);
      setSoundType(alarmToEdit.soundType);
      setVoiceNoteId(alarmToEdit.voiceNoteId || '');
      setChimeSound(alarmToEdit.chimeSound || 'morning_chimes');
      setCrescendo(alarmToEdit.crescendo ?? true);
      setSnoozeMinutes(alarmToEdit.snoozeMinutes || 5);
      setCustomMessage(alarmToEdit.customMessage || '');
    } else {
      // Default new alarm at 07:30 AM
      setHour('07');
      setMinute('30');
      setAmpm('AM');
      setLabel('Gentle Morning Awakening');
      setDays([1, 2, 3, 4, 5]);
      setSoundType('maternal_speech');
      setVoiceNoteId(voiceNotes[0]?.id || '');
      setChimeSound('morning_chimes');
      setCrescendo(true);
      setSnoozeMinutes(5);
      setCustomMessage('');
    }
  }, [alarmToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (dayIndex: number) => {
    if (days.includes(dayIndex)) {
      setDays(days.filter((d) => d !== dayIndex));
    } else {
      setDays([...days, dayIndex].sort());
    }
  };

  const handlePreviewSound = (id: ChimeSoundId) => {
    setPreviewingChime(id);
    playChimePattern(id, 0.35);
    setTimeout(() => setPreviewingChime(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let h24 = parseInt(hour, 10);
    if (ampm === 'PM' && h24 < 12) h24 += 12;
    if (ampm === 'AM' && h24 === 12) h24 = 0;
    const time24 = `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    const newAlarm: Alarm = {
      id: alarmToEdit?.id || `alarm_${Date.now()}`,
      time: time24,
      label: label.trim() || 'Gentle Awakening',
      enabled: true,
      days,
      soundType,
      voiceNoteId: soundType === 'voice_note' ? voiceNoteId : undefined,
      chimeSound,
      crescendo,
      snoozeMinutes,
      customMessage: customMessage.trim() || undefined,
      createdAt: alarmToEdit?.createdAt || Date.now(),
    };

    onSave(newAlarm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock size={18} />
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-bold">
              {alarmToEdit ? 'Edit Alarm' : 'Set New Alarm'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Time Selector */}
          <div className="flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800/60 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
            <label className="text-xs uppercase font-semibold text-zinc-400 tracking-wider mb-2">
              Wake-Up Time
            </label>
            <div className="flex items-center gap-2">
              {/* Hour Input */}
              <input
                type="number"
                min="1"
                max="12"
                value={hour}
                onChange={(e) => {
                  let val = e.target.value;
                  if (parseInt(val, 10) > 12) val = '12';
                  setHour(val.padStart(2, '0'));
                }}
                className="w-18 h-16 text-center text-4xl sm:text-5xl font-semibold rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 tabular-nums shadow-xs"
              />
              <span className="text-3xl font-light text-zinc-400">:</span>
              {/* Minute Input */}
              <input
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={(e) => {
                  let val = e.target.value;
                  if (parseInt(val, 10) > 59) val = '59';
                  setMinute(val.padStart(2, '0'));
                }}
                className="w-18 h-16 text-center text-4xl sm:text-5xl font-semibold rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 tabular-nums shadow-xs"
              />
              {/* AM / PM Toggle */}
              <div className="flex flex-col gap-1 ml-2">
                <button
                  type="button"
                  onClick={() => setAmpm('AM')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    ampm === 'AM'
                      ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setAmpm('PM')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    ampm === 'PM'
                      ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Alarm Label */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Alarm Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Gentle Morning Awakening"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
            {/* Suggestions chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {MATERNAL_LABEL_SUGGESTIONS.map((sugg) => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => setLabel(sugg)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat Days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Repeat Schedule
              </label>
              <div className="flex gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDays([1, 2, 3, 4, 5])}
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline mr-2"
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline mr-2"
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => setDays([])}
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline"
                >
                  Once
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_SHORT.map((name, idx) => {
                const isSelected = days.includes(idx);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                        : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Type Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Wake-Up Voice & Sound
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSoundType('maternal_speech')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  soundType === 'maternal_speech'
                    ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                }`}
              >
                <Sparkles size={16} className="text-amber-500" />
                <span className="text-xs">Mom's Speech & Chimes</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundType('voice_note')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  soundType === 'voice_note'
                    ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                }`}
              >
                <Mic size={16} className="text-rose-500" />
                <span className="text-xs">Custom Voice Note</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundType('chimes_only')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  soundType === 'chimes_only'
                    ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                }`}
              >
                <Music size={16} className="text-indigo-500" />
                <span className="text-xs">Chimes Only</span>
              </button>
            </div>

            {/* If Voice Note Selected, show dropdown of recorded notes */}
            {soundType === 'voice_note' && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
                <label className="block text-xs font-semibold text-rose-900 dark:text-rose-300 mb-1.5">
                  Select Recorded Voice Note:
                </label>
                {voiceNotes.length > 0 ? (
                  <select
                    value={voiceNoteId}
                    onChange={(e) => setVoiceNoteId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-rose-200 dark:border-rose-800 text-xs focus:outline-none"
                  >
                    {voiceNotes.map((note) => (
                      <option key={note.id} value={note.id}>
                        {note.title} ({note.duration}s)
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-rose-700 dark:text-rose-400">
                    No voice notes recorded yet. Record one in the Voice Notes section below!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Chime Preset Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Gentle Chime Melodies
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CHIME_OPTIONS.map((chime) => (
                <div
                  key={chime.id}
                  onClick={() => setChimeSound(chime.id)}
                  className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all ${
                    chimeSound === chime.id
                      ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {chime.label}
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {chime.desc}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewSound(chime.id);
                    }}
                    className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                    title="Preview chime"
                  >
                    <Play size={12} className={previewingChime === chime.id ? 'animate-pulse text-amber-500' : ''} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Crescendo Fade-in Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Gradual Fade-In (Crescendo)
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Volume increases gently from 5% to 100% over 30 seconds
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={crescendo}
              onClick={() => setCrescendo(!crescendo)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                crescendo ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-sm transition duration-200 ${
                  crescendo ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Snooze & Custom Message */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Snooze Duration
              </label>
              <select
                value={snoozeMinutes}
                onChange={(e) => setSnoozeMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none"
              >
                <option value={5}>5 minutes ("Just 5 more mins, mom")</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Custom Mom Message (Optional)
              </label>
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Leave blank for daily dynamic message"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all shadow-xs"
            >
              {alarmToEdit ? 'Save Changes' : 'Set Alarm'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
