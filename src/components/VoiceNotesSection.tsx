import React, { useState, useRef, useEffect } from 'react';
import { VoiceNote, VoiceNoteCategory, UserProfile } from '../types';
import { playVoiceNoteAudio, stopVoiceNoteAudio, speakMaternalMessage } from '../utils/audioEngine';
import { Chip } from '@heroui/react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  Download, 
  Clock, 
  Sparkles, 
  Bell, 
  Calendar,
  Volume2,
  CheckCircle,
  Plus
} from 'lucide-react';

interface VoiceNotesSectionProps {
  voiceNotes: VoiceNote[];
  profile: UserProfile;
  onSaveVoiceNote: (note: VoiceNote) => void;
  onDeleteVoiceNote: (id: string) => void;
  onSetAsAlarmSound: (voiceNote: VoiceNote) => void;
}

export const VoiceNotesSection: React.FC<VoiceNotesSectionProps> = ({
  voiceNotes,
  profile,
  onSaveVoiceNote,
  onDeleteVoiceNote,
  onSetAsAlarmSound,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordedBase64, setRecordedBase64] = useState<string | null>(null);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VoiceNoteCategory>('reminder');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopVoiceNoteAudio();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start recording audio from microphone
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(audioBlob);
        setRecordedBlobUrl(blobUrl);

        // Convert blob to base64 for persistent IndexedDB offline storage
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setRecordedBase64(base64data);
        };

        // Stop all tracks on the stream to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or error:', err);
      alert('Please allow microphone permissions to record voice notes.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSaveRecording = () => {
    if (!recordedBase64 && category !== 'mom_voice') {
      alert('Please record an audio note first.');
      return;
    }

    const newNote: VoiceNote = {
      id: `vn_${Date.now()}`,
      title: title.trim() || `Loving Note ${voiceNotes.length + 1}`,
      category,
      audioBlobBase64: recordedBase64 || '',
      duration: recordingSeconds || 8,
      mimeType: 'audio/webm',
      recordedAt: Date.now(),
      reminderTime: reminderTime || undefined,
      reminderDate: reminderDate || undefined,
      isReminderActive: Boolean(reminderTime),
    };

    onSaveVoiceNote(newNote);
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setIsRecording(false);
    setRecordingSeconds(0);
    setRecordedBlobUrl(null);
    setRecordedBase64(null);
    setTitle('');
    setCategory('reminder');
    setReminderTime('');
    setReminderDate('');
  };

  const handleTogglePlay = (note: VoiceNote) => {
    if (activePlayingId === note.id) {
      stopVoiceNoteAudio();
      setActivePlayingId(null);
      return;
    }

    setActivePlayingId(note.id);

    if (note.audioBlobBase64) {
      playVoiceNoteAudio(note.audioBlobBase64, () => {
        setActivePlayingId(null);
      });
    } else {
      // If simulated or synthesized note without microphone blob, speak with maternal voice!
      speakMaternalMessage(
        `This is a special reminder for ${profile.nickname || 'you'}: ${note.title}. Don't forget that Mom loves you!`,
        {
          pitch: profile.voicePitch || 1.15,
          rate: profile.voiceRate || 0.88,
          onEnd: () => setActivePlayingId(null),
          onError: () => setActivePlayingId(null),
        }
      );
    }
  };

  const handleDownload = (note: VoiceNote) => {
    if (!note.audioBlobBase64) return;
    const a = document.createElement('a');
    a.href = note.audioBlobBase64;
    a.download = `${note.title.replace(/\s+/g, '_')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
              Loving Voice Notes
            </h2>
            <Chip size="sm" variant="soft" color="danger" className="text-xs font-semibold">
              {voiceNotes.length} notes
            </Chip>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Record real voice notes from mom or yourself for special reminders & custom alarm tones.
          </p>
        </div>

        {/* Record New Note Trigger */}
        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-xs"
        >
          <Mic size={16} />
          <span>Record Note</span>
        </button>
      </div>

      {/* Voice Notes Grid */}
      {voiceNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {voiceNotes.map((note) => {
            const isPlaying = activePlayingId === note.id;
            return (
              <div
                key={note.id}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 border bg-white/80 dark:bg-zinc-900/80 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Play / Pause button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePlay(note)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                        isPlaying
                          ? 'bg-rose-500 text-white shadow-sm animate-pulse'
                          : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                      }`}
                      title={isPlaying ? 'Pause' : 'Play voice note'}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5 fill-current" />}
                    </button>

                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span>{note.duration}s</span>
                        <span>•</span>
                        <span className="capitalize">{note.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {note.audioBlobBase64 && (
                      <button
                        type="button"
                        onClick={() => handleDownload(note)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        title="Download audio file"
                      >
                        <Download size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteVoiceNote(note.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                      title="Delete voice note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Reminder Schedule Badge & Set as Alarm Action */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {note.reminderTime ? (
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                      <Clock size={12} className="text-amber-500" />
                      <span>
                        Reminder: {note.reminderTime} {note.reminderDate ? `(${note.reminderDate})` : ''}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-zinc-400">Offline Safe Audio</span>
                  )}

                  <button
                    type="button"
                    onClick={() => onSetAsAlarmSound(note)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    <Bell size={11} className="text-amber-500" />
                    <span>Set as Alarm Ringtone</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 sm:p-8 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30">
          <p className="text-xs text-zinc-500">
            No voice notes recorded yet. Record a reminder or warm message from mom to start.
          </p>
        </div>
      )}

      {/* RECORDING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="text-center space-y-1">
              <h3 className="text-lg font-serif font-bold">
                Record a Loving Voice Note
              </h3>
              <p className="text-xs text-zinc-400">
                Record real audio to play during your alarms or as special reminders.
              </p>
            </div>

            {/* Live Recording Controller */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-4">
              
              {/* Record / Stop Button with Animated Ring */}
              <div className="relative flex items-center justify-center">
                {isRecording && (
                  <div className="absolute w-24 h-24 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
                )}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-18 h-18 rounded-full flex items-center justify-center text-white transition-all shadow-md ${
                    isRecording
                      ? 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900'
                      : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  {isRecording ? <Square size={24} /> : <Mic size={28} />}
                </button>
              </div>

              {/* Timer & Status */}
              <div className="text-center">
                <div className="text-2xl font-mono font-bold tabular-nums">
                  00:{String(recordingSeconds).padStart(2, '0')}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {isRecording
                    ? 'Recording voice... Tap square to finish'
                    : recordedBlobUrl
                    ? 'Recording captured! Ready to preview & save'
                    : 'Tap microphone to start speaking'}
                </div>
              </div>

              {/* Preview Player if recorded */}
              {recordedBlobUrl && !isRecording && (
                <audio controls src={recordedBlobUrl} className="w-full h-10 mt-2" />
              )}
            </div>

            {/* Note Metadata Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mom: Take your morning vitamins"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'reminder', label: 'Special Reminder' },
                    { id: 'mom_voice', label: "Mom's Voice" },
                    { id: 'wake_up', label: 'Wake-Up Call' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`py-1.5 text-[11px] font-medium rounded-xl border transition-all ${
                        category === cat.id
                          ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                          : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Reminder Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Scheduled Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  stopRecording();
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRecording}
                disabled={isRecording || (!recordedBase64 && category !== 'mom_voice')}
                className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isRecording || (!recordedBase64 && category !== 'mom_voice')
                    ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                    : 'bg-rose-500 text-white hover:bg-rose-600 shadow-xs'
                }`}
              >
                Save Voice Note
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
