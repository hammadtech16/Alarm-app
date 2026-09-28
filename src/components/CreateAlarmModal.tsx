import React, { useState, useEffect } from 'react';
import { Alarm, ThemeId, VoiceNote } from '../types';
import { THEMES } from '../utils/themes';
import { AppIcon } from './AppIcon';

interface CreateAlarmModalProps {
  isOpen: boolean;
  currentTheme?: ThemeId;
  alarmToEdit: Alarm | null;
  voiceNotes: VoiceNote[];
  onSave: (alarmData: Partial<Alarm>) => void;
  onClose: () => void;
}

export const CreateAlarmModal: React.FC<CreateAlarmModalProps> = ({
  isOpen,
  currentTheme = 'onyx_minimal',
  alarmToEdit,
  voiceNotes,
  onSave,
  onClose,
}) => {
  const theme = THEMES[currentTheme] || THEMES.onyx_minimal;
  const accent = theme.previewAccent || '#F85E2B';

  // Parse initial 12h time
  const parseInitialTime = () => {
    if (alarmToEdit?.time) {
      const [hStr, mStr] = alarmToEdit.time.split(':');
      const hNum = parseInt(hStr, 10);
      const mNum = parseInt(mStr, 10);
      const isPm = hNum >= 12;
      const h12 = hNum % 12 || 12;
      return { hour: h12, minute: mNum, ampm: isPm ? 'PM' : 'AM' as 'AM' | 'PM' };
    }
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const hNum = now.getHours();
    const isPm = hNum >= 12;
    return {
      hour: hNum % 12 || 12,
      minute: 0,
      ampm: isPm ? 'PM' : 'AM' as 'AM' | 'PM',
    };
  };

  const initial = parseInitialTime();
  const [selectedHour, setSelectedHour] = useState<number>(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState<number>(initial.minute);
  const [selectedAmPm, setSelectedAmPm] = useState<'AM' | 'PM'>(initial.ampm);

  // Settings states matching right image
  const [repeatText, setRepeatText] = useState(alarmToEdit?.repeatText || 'Every Day');
  const [wakeUpMission, setWakeUpMission] = useState(alarmToEdit?.wakeUpMission || 'Math');
  const [alarmSound, setAlarmSound] = useState('Mom\'s Voice');
  const [background, setBackground] = useState(alarmToEdit?.background || 'Snowy peaks');
  const [snoozeText, setSnoozeText] = useState(
    alarmToEdit?.snoozeMinutes ? `${alarmToEdit.snoozeMinutes} min` : '5 min'
  );
  const [label, setLabel] = useState(alarmToEdit?.label || 'Good morning!');

  // Active sub-sheet / drawer for selecting items
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  // Synchronize on modal open or edit change
  useEffect(() => {
    if (isOpen) {
      const init = parseInitialTime();
      setSelectedHour(init.hour);
      setSelectedMinute(init.minute);
      setSelectedAmPm(init.ampm);
      setLabel(alarmToEdit?.label || 'Good morning!');
      setRepeatText(alarmToEdit?.repeatText || 'Every Day');
      setWakeUpMission(alarmToEdit?.wakeUpMission || 'Math');
      setBackground(alarmToEdit?.background || 'Snowy peaks');
      setSnoozeText(alarmToEdit?.snoozeMinutes ? `${alarmToEdit.snoozeMinutes} min` : '5 min');
    }
  }, [isOpen, alarmToEdit]);

  if (!isOpen) return null;

  // Real-time calculation of "Ring in Xh Ym"
  const calculateRingIn = () => {
    let targetHour24 = selectedHour % 12;
    if (selectedAmPm === 'PM') targetHour24 += 12;

    const now = new Date();
    const target = new Date();
    target.setHours(targetHour24, selectedMinute, 0, 0);

    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const diffMinutes = Math.round((target.getTime() - now.getTime()) / (60 * 1000));
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;

    if (h === 0 && m === 0) return 'Ring in 1m';
    if (h === 0) return `Ring in ${m}m`;
    return `Ring in ${h}h ${m}m`;
  };

  const handleSave = () => {
    let h24 = selectedHour % 12;
    if (selectedAmPm === 'PM') h24 += 12;
    const time24 = `${String(h24).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;

    let snoozeMinutes = 5;
    if (snoozeText === 'Off') snoozeMinutes = 0;
    else if (snoozeText.includes('10')) snoozeMinutes = 10;
    else if (snoozeText.includes('15')) snoozeMinutes = 15;

    let days: number[] = [0, 1, 2, 3, 4, 5, 6];
    if (repeatText === 'Weekdays') days = [1, 2, 3, 4, 5];
    else if (repeatText === 'Weekends') days = [0, 6];
    else if (repeatText === 'Once') days = [];

    onSave({
      time: time24,
      label,
      enabled: true,
      days,
      repeatText,
      wakeUpMission,
      background,
      snoozeMinutes,
      soundType: alarmSound.includes('Voice') ? 'maternal_speech' : 'chimes_only',
    });
    onClose();
  };

  // Helper numbers for 3-row wheel illusion
  const prevHour = (selectedHour - 2 + 12) % 12 + 1;
  const nextHour = selectedHour % 12 + 1;

  const prevMin = (selectedMinute - 1 + 60) % 60;
  const nextMin = (selectedMinute + 1) % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl bg-[#000001] text-[#C7C6C9] flex flex-col overflow-hidden border border-[#16161C] shadow-2xl">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#16161C]">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-2.5 rounded-xl flex items-center gap-1.5 text-[#C7C6C9] hover:text-white hover:bg-[#141415] transition-colors cursor-pointer"
            title="Back / Cancel"
          >
            <AppIcon icon="solar:arrow-left-linear" width={20} height={20} />
            <span className="text-xs font-semibold">Back</span>
          </button>

          <div className="text-center">
            <h2 className="text-base font-bold text-white tracking-tight">
              Create Alarm
            </h2>
            <p className="text-xs text-[#646366] font-medium transition-all duration-300">
              {calculateRingIn()}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            style={{ color: accent }}
            className="text-sm font-bold hover:brightness-125 transition-colors cursor-pointer px-2 py-1"
          >
            Done
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          
          {/* Interactive Wheel Time Selector */}
          <div className="relative py-4 flex flex-col items-center justify-center select-none">
            
            {/* Top Row (Dimmed Previous Value) */}
            <div className="flex items-center justify-center gap-6 text-2xl font-bold text-[#646366]/40 pointer-events-none mb-2">
              <span className="w-16 text-center tabular-nums">
                {String(prevHour).padStart(2, '0')}
              </span>
              <span className="opacity-0">:</span>
              <span className="w-16 text-center tabular-nums">
                {String(prevMin).padStart(2, '0')}
              </span>
              <span className="w-14 text-center text-lg">
                {selectedAmPm === 'AM' ? 'PM' : 'AM'}
              </span>
            </div>

            {/* Center Row (Active Capsule Container Themed to Current Accent) */}
            <div 
              style={{
                borderColor: `${accent}45`,
                boxShadow: `0 0 20px ${accent}15 inset`,
              }}
              className="relative w-full max-w-xs py-3 px-4 rounded-2xl bg-[#141415] border flex items-center justify-center gap-4 text-4xl sm:text-5xl font-extrabold text-white shadow-inner"
            >
              
              {/* Hour Selector with quick click / scroll */}
              <div className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setSelectedHour((h) => (h % 12) + 1)}
                  className="w-18 text-center tabular-nums transition-colors active:scale-95 cursor-pointer py-1 hover:text-white"
                >
                  {String(selectedHour).padStart(2, '0')}
                </button>
              </div>

              {/* Colon Separator */}
              <span className="text-[#646366] font-light animate-pulse">:</span>

              {/* Minute Selector */}
              <div className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setSelectedMinute((m) => (m + 5) % 60)}
                  className="w-18 text-center tabular-nums transition-colors active:scale-95 cursor-pointer py-1 hover:text-white"
                >
                  {String(selectedMinute).padStart(2, '0')}
                </button>
              </div>

              {/* AM / PM Toggle */}
              <button
                type="button"
                onClick={() => setSelectedAmPm((a) => (a === 'AM' ? 'PM' : 'AM'))}
                className="w-16 ml-2 py-1 px-2 text-2xl font-bold text-[#C7C6C9] hover:text-white bg-[#16161C] rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors active:scale-95 cursor-pointer text-center"
              >
                {selectedAmPm}
              </button>
            </div>

            {/* Bottom Row (Dimmed Next Value) */}
            <div className="flex items-center justify-center gap-6 text-2xl font-bold text-[#646366]/40 pointer-events-none mt-2">
              <span className="w-16 text-center tabular-nums">
                {String(nextHour).padStart(2, '0')}
              </span>
              <span className="opacity-0">:</span>
              <span className="w-16 text-center tabular-nums">
                {String(nextMin).padStart(2, '0')}
              </span>
              <span className="w-14 text-center text-lg">
                {selectedAmPm === 'AM' ? 'PM' : 'AM'}
              </span>
            </div>

            {/* Quick Micro Adjust Buttons */}
            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => setSelectedHour((h) => ((h - 2 + 12) % 12) + 1)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#141415] text-[#646366] hover:text-white border border-[#16161C] cursor-pointer"
              >
                -1h
              </button>
              <button
                type="button"
                onClick={() => setSelectedHour((h) => (h % 12) + 1)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#141415] text-[#646366] hover:text-white border border-[#16161C] cursor-pointer"
              >
                +1h
              </button>
              <span className="text-[#16161C]">|</span>
              <button
                type="button"
                onClick={() => setSelectedMinute((m) => ((m - 5 + 60) % 60))}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#141415] text-[#646366] hover:text-white border border-[#16161C] cursor-pointer"
              >
                -5m
              </button>
              <button
                type="button"
                onClick={() => setSelectedMinute((m) => ((m + 5) % 60))}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#141415] text-[#646366] hover:text-white border border-[#16161C] cursor-pointer"
              >
                +5m
              </button>
            </div>
          </div>

          {/* Setting List Items */}
          <div className="divide-y divide-[#16161C] border-y border-[#16161C]">
            
            {/* 1. Repeat */}
            <button
              type="button"
              onClick={() => setActiveSheet(activeSheet === 'repeat' ? null : 'repeat')}
              className="w-full py-4 flex items-center justify-between text-left hover:bg-[#141415]/60 transition-colors px-1 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <AppIcon icon="solar:restart-linear" width={22} height={22} className="text-[#C7C6C9]" />
                <span className="text-sm font-semibold text-white">Repeat</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#C7C6C9]">
                <span>{repeatText}</span>
                <AppIcon icon="solar:alt-arrow-right-linear" width={16} height={16} className="text-[#646366]" />
              </div>
            </button>
            {activeSheet === 'repeat' && (
              <div className="py-2.5 px-3 bg-[#141415] rounded-xl mb-2 flex flex-wrap gap-2 animate-in fade-in">
                {['Every Day', 'Weekdays', 'Weekends', 'Once'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRepeatText(r);
                      setActiveSheet(null);
                    }}
                    style={repeatText === r ? { backgroundColor: accent, borderColor: 'transparent', color: '#ffffff' } : undefined}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      repeatText === r
                        ? 'text-white'
                        : 'bg-[#16161C] text-[#C7C6C9] border-[#16161C] hover:border-zinc-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* 2. Wake-Up Mission */}
            <button
              type="button"
              onClick={() => setActiveSheet(activeSheet === 'mission' ? null : 'mission')}
              className="w-full py-4 flex items-center justify-between text-left hover:bg-[#141415]/60 transition-colors px-1 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <AppIcon icon="solar:puzzle-linear" width={22} height={22} className="text-[#C7C6C9]" />
                <span className="text-sm font-semibold text-white">Wake-Up Mission</span>
                <span 
                  style={{ backgroundColor: accent }}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white tracking-wider"
                >
                  Hot
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#C7C6C9]">
                <span>{wakeUpMission}</span>
                <AppIcon icon="solar:alt-arrow-right-linear" width={16} height={16} className="text-[#646366]" />
              </div>
            </button>
            {activeSheet === 'mission' && (
              <div className="py-2.5 px-3 bg-[#141415] rounded-xl mb-2 flex flex-wrap gap-2 animate-in fade-in">
                {['Math', 'Mom\'s Du\'a', 'Deep Breath', 'None'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setWakeUpMission(m);
                      setActiveSheet(null);
                    }}
                    style={wakeUpMission === m ? { backgroundColor: accent, borderColor: 'transparent', color: '#ffffff' } : undefined}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      wakeUpMission === m
                        ? 'text-white'
                        : 'bg-[#16161C] text-[#C7C6C9] border-[#16161C] hover:border-zinc-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {/* 3. Alarm Sound */}
            <button
              type="button"
              onClick={() => setActiveSheet(activeSheet === 'sound' ? null : 'sound')}
              className="w-full py-4 flex items-center justify-between text-left hover:bg-[#141415]/60 transition-colors px-1 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <AppIcon icon="solar:bell-linear" width={22} height={22} className="text-[#C7C6C9]" />
                <span className="text-sm font-semibold text-white">Alarm Sound</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#C7C6C9]">
                <span>{alarmSound}</span>
                <AppIcon icon="solar:alt-arrow-right-linear" width={16} height={16} className="text-[#646366]" />
              </div>
            </button>
            {activeSheet === 'sound' && (
              <div className="py-2.5 px-3 bg-[#141415] rounded-xl mb-2 flex flex-wrap gap-2 animate-in fade-in">
                {['Mom\'s Voice', 'Beautiful day', 'Morning Birds', 'Soft Tibetan Bowl'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setAlarmSound(s);
                      setActiveSheet(null);
                    }}
                    style={alarmSound === s ? { backgroundColor: accent, borderColor: 'transparent', color: '#ffffff' } : undefined}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      alarmSound === s
                        ? 'text-white'
                        : 'bg-[#16161C] text-[#C7C6C9] border-[#16161C] hover:border-zinc-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* 4. Background */}
            <button
              type="button"
              onClick={() => setActiveSheet(activeSheet === 'bg' ? null : 'bg')}
              className="w-full py-4 flex items-center justify-between text-left hover:bg-[#141415]/60 transition-colors px-1 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <AppIcon icon="solar:magic-stick-linear" width={22} height={22} className="text-[#C7C6C9]" />
                <span className="text-sm font-semibold text-white">Background</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#C7C6C9]">
                <span>{background}</span>
                <AppIcon icon="solar:alt-arrow-right-linear" width={16} height={16} className="text-[#646366]" />
              </div>
            </button>
            {activeSheet === 'bg' && (
              <div className="py-2.5 px-3 bg-[#141415] rounded-xl mb-2 flex flex-wrap gap-2 animate-in fade-in">
                {['Snowy peaks', 'Warm Dawn', 'Cozy Hearth', 'Minimal Dusk'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setBackground(b);
                      setActiveSheet(null);
                    }}
                    style={background === b ? { backgroundColor: accent, borderColor: 'transparent', color: '#ffffff' } : undefined}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      background === b
                        ? 'text-white'
                        : 'bg-[#16161C] text-[#C7C6C9] border-[#16161C] hover:border-zinc-700'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}

            {/* 5. Snooze */}
            <button
              type="button"
              onClick={() => setActiveSheet(activeSheet === 'snooze' ? null : 'snooze')}
              className="w-full py-4 flex items-center justify-between text-left hover:bg-[#141415]/60 transition-colors px-1 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <AppIcon icon="solar:alarm-sleep-linear" width={22} height={22} className="text-[#C7C6C9]" />
                <span className="text-sm font-semibold text-white">Snooze</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#C7C6C9]">
                <span>{snoozeText}</span>
                <AppIcon icon="solar:alt-arrow-right-linear" width={16} height={16} className="text-[#646366]" />
              </div>
            </button>
            {activeSheet === 'snooze' && (
              <div className="py-2.5 px-3 bg-[#141415] rounded-xl mb-2 flex flex-wrap gap-2 animate-in fade-in">
                {['Off', '5 min', '10 min', '15 min'].map((sn) => (
                  <button
                    key={sn}
                    type="button"
                    onClick={() => {
                      setSnoozeText(sn);
                      setActiveSheet(null);
                    }}
                    style={snoozeText === sn ? { backgroundColor: accent, borderColor: 'transparent', color: '#ffffff' } : undefined}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      snoozeText === sn
                        ? 'text-white'
                        : 'bg-[#16161C] text-[#C7C6C9] border-[#16161C] hover:border-zinc-700'
                    }`}
                  >
                    {sn}
                  </button>
                ))}
              </div>
            )}

            {/* 6. Label */}
            <div className="py-3 px-1 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <AppIcon icon="solar:tag-linear" width={22} height={22} className="text-[#C7C6C9]" />
                <span className="text-sm font-semibold text-white">Label</span>
              </div>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Good morning!"
                className="text-sm text-right bg-transparent text-white placeholder-[#646366] focus:outline-none max-w-[160px]"
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
