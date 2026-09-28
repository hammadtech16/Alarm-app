import { Alarm, CloudBackupData, ThemeId, UserProfile, VoiceNote } from '../types';

const DB_NAME = 'mimi_maternal_alarm_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('alarms')) {
        db.createObjectStore('alarms', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('voice_notes')) {
        db.createObjectStore('voice_notes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

// Fallback to localStorage if IndexedDB fails or is restricted
const LOCAL_STORAGE_PREFIX = 'mimi_alarm_';

// Profile operations
export async function getStoredProfile(): Promise<UserProfile | null> {
  try {
    const db = await getDB();
    const tx = db.transaction('profile', 'readonly');
    const store = tx.objectStore('profile');
    const req = store.get('current_user');
    return new Promise((resolve) => {
      req.onsuccess = () => {
        if (req.result?.value) {
          resolve(req.result.value);
        } else {
          const fallback = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}profile`);
          resolve(fallback ? JSON.parse(fallback) : null);
        }
      };
      req.onerror = () => {
        const fallback = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}profile`);
        resolve(fallback ? JSON.parse(fallback) : null);
      };
    });
  } catch {
    const fallback = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}profile`);
    return fallback ? JSON.parse(fallback) : null;
  }
}

export async function saveStoredProfile(profile: UserProfile): Promise<void> {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}profile`, JSON.stringify(profile));
    const db = await getDB();
    const tx = db.transaction('profile', 'readwrite');
    const store = tx.objectStore('profile');
    store.put({ key: 'current_user', value: profile });
  } catch (e) {
    console.warn('Saved profile to localStorage fallback', e);
  }
}

// Alarms operations
export async function getStoredAlarms(): Promise<Alarm[]> {
  try {
    const db = await getDB();
    const tx = db.transaction('alarms', 'readonly');
    const store = tx.objectStore('alarms');
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          resolve(req.result);
        } else {
          const fallback = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}alarms`);
          resolve(fallback ? JSON.parse(fallback) : getDefaultAlarms());
        }
      };
      req.onerror = () => {
        const fallback = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}alarms`);
        resolve(fallback ? JSON.parse(fallback) : getDefaultAlarms());
      };
    });
  } catch {
    const fallback = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}alarms`);
    return fallback ? JSON.parse(fallback) : getDefaultAlarms();
  }
}

export async function saveStoredAlarms(alarms: Alarm[]): Promise<void> {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}alarms`, JSON.stringify(alarms));
    const db = await getDB();
    const tx = db.transaction('alarms', 'readwrite');
    const store = tx.objectStore('alarms');
    store.clear();
    alarms.forEach((alarm) => store.put(alarm));
  } catch (e) {
    console.warn('Saved alarms to localStorage fallback', e);
  }
}

// Voice Notes operations
export async function getStoredVoiceNotes(): Promise<VoiceNote[]> {
  try {
    const db = await getDB();
    const tx = db.transaction('voice_notes', 'readonly');
    const store = tx.objectStore('voice_notes');
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          resolve(req.result);
        } else {
          const fallback = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}voice_notes`);
          resolve(fallback ? JSON.parse(fallback) : getDefaultVoiceNotes());
        }
      };
      req.onerror = () => {
        const fallback = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}voice_notes`);
        resolve(fallback ? JSON.parse(fallback) : getDefaultVoiceNotes());
      };
    });
  } catch {
    const fallback = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}voice_notes`);
    return fallback ? JSON.parse(fallback) : getDefaultVoiceNotes();
  }
}

export async function saveStoredVoiceNotes(notes: VoiceNote[]): Promise<void> {
  try {
    // Keep localStorage light if possible, but store for resilience
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}voice_notes`, JSON.stringify(notes));
    } catch (quotaError) {
      console.warn('LocalStorage quota reached for audio notes, relying on IndexedDB', quotaError);
    }
    const db = await getDB();
    const tx = db.transaction('voice_notes', 'readwrite');
    const store = tx.objectStore('voice_notes');
    store.clear();
    notes.forEach((note) => store.put(note));
  } catch (e) {
    console.warn('Error saving voice notes to IndexedDB', e);
  }
}

// Default initial state for a comforting out-of-the-box experience
export function getDefaultProfile(): UserProfile {
  return {
    name: 'پیارے',
    nickname: 'بیٹا',
    maternalTone: 'gentle',
    wakeUpGoal: 'A calm, peaceful morning without rushing',
    onboarded: false,
    voicePitch: 1.15,
    voiceRate: 0.9,
    language: 'ur',
  };
}

export function getDefaultAlarms(): Alarm[] {
  return [
    {
      id: 'alarm_default_1',
      time: '07:00',
      label: 'Gentle Morning Awakening',
      enabled: true,
      days: [1, 2, 3, 4, 5], // Mon-Fri
      soundType: 'maternal_speech',
      chimeSound: 'morning_chimes',
      crescendo: true,
      snoozeMinutes: 5,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'alarm_default_2',
      time: '08:30',
      label: 'Weekend Rest & Sunlight',
      enabled: true,
      days: [0, 6], // Sun, Sat
      soundType: 'maternal_speech',
      chimeSound: 'harp_sunrise',
      crescendo: true,
      snoozeMinutes: 10,
      createdAt: Date.now() - 43200000,
    },
    {
      id: 'alarm_default_3',
      time: '21:30',
      label: 'Bedtime Tea & Wind Down Reminder',
      enabled: false,
      days: [0, 1, 2, 3, 4, 5, 6],
      soundType: 'maternal_speech',
      chimeSound: 'tibetan_bowl',
      crescendo: true,
      snoozeMinutes: 5,
      createdAt: Date.now() - 20000000,
    },
  ];
}

export function getDefaultVoiceNotes(): VoiceNote[] {
  // Pre-seed a sweet voice note metadata (user can record real voice notes)
  return [
    {
      id: 'sample_note_1',
      title: "Mom's Loving Reminder: Remember you are capable",
      category: 'mom_voice',
      audioBlobBase64: '', // Synthesizer speaks this if empty
      duration: 12,
      mimeType: 'audio/webm',
      recordedAt: Date.now() - 3600000,
      reminderTime: '14:00',
      reminderDate: new Date().toISOString().split('T')[0],
      isReminderActive: true,
    }
  ];
}

// Complete Backup Export & Import
export function exportCloudBackup(
  profile: UserProfile,
  alarms: Alarm[],
  voiceNotes: VoiceNote[],
  theme: ThemeId,
  darkMode: boolean
): string {
  const data: CloudBackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    alarms,
    voiceNotes,
    theme,
    darkMode,
  };
  return JSON.stringify(data, null, 2);
}

export function parseCloudBackup(jsonString: string): CloudBackupData {
  const parsed = JSON.parse(jsonString);
  if (!parsed.profile || !Array.isArray(parsed.alarms)) {
    throw new Error('Invalid backup file structure');
  }
  return parsed;
}
