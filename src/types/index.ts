export type MaternalTone = 'gentle' | 'warm' | 'cozy' | 'cheerful' | 'grounding';

export interface UserProfile {
  name: string;
  nickname: string;
  maternalTone: MaternalTone;
  wakeUpGoal: string;
  onboarded: boolean;
  voicePitch: number; // 0.8 to 1.3
  voiceRate: number; // 0.8 to 1.1
  language: string; // e.g. 'ur', 'en', 'hi', 'ar', 'es', 'tr'
}

export type ChimeSoundId = 'morning_chimes' | 'tibetan_bowl' | 'forest_birds' | 'harp_sunrise';

export interface Alarm {
  id: string;
  time: string; // "HH:MM" in 24h format, e.g. "07:30"
  label: string;
  enabled: boolean;
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat (empty array means once)
  soundType: 'maternal_speech' | 'voice_note' | 'chimes_only';
  voiceNoteId?: string;
  chimeSound: ChimeSoundId;
  crescendo: boolean; // gradual volume fade-in
  snoozeMinutes: number;
  customMessage?: string;
  createdAt: number;
  // Enhanced properties matching new Create Alarm design
  wakeUpMission?: string; // 'Math' | 'Mom\'s Du\'a' | 'Deep Breath' | 'None'
  background?: string; // 'Snowy peaks' | 'Warm Dawn' | 'Cozy Nightstand' | 'Starry Sky'
  repeatText?: string; // e.g. 'Every Day', 'Weekdays', 'Once'
}

export type VoiceNoteCategory = 'reminder' | 'mom_voice' | 'affirmation' | 'wake_up';

export interface VoiceNote {
  id: string;
  title: string;
  category: VoiceNoteCategory;
  audioBlobBase64: string;
  duration: number; // in seconds
  mimeType: string;
  recordedAt: number;
  reminderDate?: string; // YYYY-MM-DD
  reminderTime?: string; // HH:MM
  isReminderActive?: boolean;
}

export type ThemeId = 
  | 'onyx_minimal'
  | 'studio_light'
  | 'monochrome' 
  | 'lavender' 
  | 'peach' 
  | 'sage' 
  | 'rose' 
  | 'sky' 
  | 'sunbeam';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  isMonochrome: boolean;
  isPastel: boolean;
  previewBg: string;
  previewAccent: string;
  // CSS class tokens
  backgroundLight: string;
  backgroundDark: string;
  cardLight: string;
  cardDark: string;
  borderLight: string;
  borderDark: string;
  accentLight: string;
  accentDark: string;
  textLight: string;
  textDark: string;
  mutedLight: string;
  mutedDark: string;
  glowColor: string;
  highlightCardBg?: string; // e.g. '#F85E2B'
}

export interface CloudBackupData {
  version: number;
  exportedAt: string;
  profile: UserProfile;
  alarms: Alarm[];
  voiceNotes: VoiceNote[];
  theme: ThemeId;
  darkMode: boolean;
}

export type NavigationTab = 'alarms' | 'clock' | 'timer' | 'bedtimes';
