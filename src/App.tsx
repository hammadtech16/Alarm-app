/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Alarm, NavigationTab, ThemeId, UserProfile, VoiceNote } from './types';
import { THEMES } from './utils/themes';
import { 
  getStoredProfile, 
  saveStoredProfile, 
  getStoredAlarms, 
  saveStoredAlarms, 
  getStoredVoiceNotes, 
  saveStoredVoiceNotes,
  getDefaultProfile,
  getDefaultAlarms,
  getDefaultVoiceNotes
} from './utils/db';
import { Header } from './components/Header';
import { MainAlarmsView } from './components/MainAlarmsView';
import { WorldClockSection } from './components/WorldClockSection';
import { TimerSection } from './components/TimerSection';
import { BedtimesSection } from './components/BedtimesSection';
import { CreateAlarmModal } from './components/CreateAlarmModal';
import { ActiveAlarmModal } from './components/ActiveAlarmModal';
import { SyncBackupModal } from './components/SyncBackupModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { BottomNavbar } from './components/BottomNavbar';
import { ThemeModal } from './components/ThemeModal';
import { Heart, Shield } from 'lucide-react';

export default function App() {
  // App State - Default to signature Onyx Minimal theme
  const [profile, setProfile] = useState<UserProfile>(getDefaultProfile());
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('onyx_minimal');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Navigation: 'alarms' | 'clock' | 'timer' | 'bedtimes'
  const [activeTab, setActiveTab] = useState<NavigationTab>('alarms');

  // Modals & Active Alarm
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [alarmToEdit, setAlarmToEdit] = useState<Alarm | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);

  // Alarm tracking to prevent repeated ring within same minute
  const lastTriggeredMinuteRef = useRef<string>('');

  // 1. Initialize local DB & preferences on load
  useEffect(() => {
    // Online / Offline tracking
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load theme & dark mode from localStorage
    const savedTheme = localStorage.getItem('mimi_theme') as ThemeId;
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    const savedDarkMode = localStorage.getItem('mimi_dark_mode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }

    // Load data from IndexedDB
    async function loadData() {
      try {
        const storedProfile = await getStoredProfile();
        if (storedProfile && storedProfile.onboarded) {
          setProfile(storedProfile);
        } else {
          setIsOnboardingOpen(true);
        }

        const storedAlarms = await getStoredAlarms();
        setAlarms(storedAlarms || getDefaultAlarms());

        const storedNotes = await getStoredVoiceNotes();
        setVoiceNotes(storedNotes || getDefaultVoiceNotes());

        setLastSyncTime(new Date().toISOString());
      } catch (err) {
        console.warn('Error loading stored applet data', err);
        setAlarms(getDefaultAlarms());
        setVoiceNotes(getDefaultVoiceNotes());
      }
    }
    loadData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save theme & dark mode preferences
  useEffect(() => {
    localStorage.setItem('mimi_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('mimi_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 2. Alarm Trigger Loop (Checks every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Prevent triggering multiple times in the same minute
      if (lastTriggeredMinuteRef.current === currentTimeString) {
        return;
      }

      // Check if any enabled alarm matches current time & day
      const triggered = alarms.find((alarm) => {
        if (!alarm.enabled) return false;
        if (alarm.time !== currentTimeString) return false;

        // Days check (empty days array means ring once every day)
        if (alarm.days.length === 0) return true;
        return alarm.days.includes(currentDay);
      });

      if (triggered && !ringingAlarm) {
        lastTriggeredMinuteRef.current = currentTimeString;
        setRingingAlarm(triggered);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, ringingAlarm]);

  // Handlers for Alarms
  const handleToggleAlarm = (id: string) => {
    const updated = alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    setAlarms(updated);
    saveStoredAlarms(updated);
  };

  const handleSaveAlarm = (alarmData: Partial<Alarm>) => {
    let updated: Alarm[];
    if (alarmToEdit) {
      updated = alarms.map((a) => (a.id === alarmToEdit.id ? { ...a, ...alarmData } as Alarm : a));
    } else {
      const newAlarm: Alarm = {
        id: `alarm_${Date.now()}`,
        time: alarmData.time || '07:00',
        label: alarmData.label || 'Gentle Awakening',
        enabled: true,
        days: alarmData.days || [0, 1, 2, 3, 4, 5, 6],
        soundType: alarmData.soundType || 'maternal_speech',
        voiceNoteId: alarmData.voiceNoteId,
        chimeSound: alarmData.chimeSound || 'morning_chimes',
        crescendo: alarmData.crescendo ?? true,
        snoozeMinutes: alarmData.snoozeMinutes || 5,
        customMessage: alarmData.customMessage,
        createdAt: Date.now(),
        wakeUpMission: alarmData.wakeUpMission || 'Math',
        background: alarmData.background || 'Snowy peaks',
        repeatText: alarmData.repeatText || 'Every Day',
      };
      updated = [newAlarm, ...alarms];
    }
    setAlarms(updated);
    saveStoredAlarms(updated);
  };

  const handleDeleteAlarm = (id: string) => {
    const updated = alarms.filter((a) => a.id !== id);
    setAlarms(updated);
    saveStoredAlarms(updated);
  };

  const handlePreviewAlarm = () => {
    const sampleAlarm: Alarm = alarms[0] || {
      id: 'test_preview',
      time: '07:00',
      label: 'Morning Awakening (Preview)',
      enabled: true,
      days: [],
      soundType: 'maternal_speech',
      chimeSound: 'morning_chimes',
      crescendo: false,
      snoozeMinutes: 5,
      createdAt: Date.now(),
    };
    setRingingAlarm(sampleAlarm);
  };

  // Active Alarm dismiss / snooze
  const handleDismissAlarm = () => {
    setRingingAlarm(null);
  };

  const handleSnoozeAlarm = (minutes: number) => {
    if (!ringingAlarm) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const snoozeHours = String(now.getHours()).padStart(2, '0');
    const snoozeMinutes = String(now.getMinutes()).padStart(2, '0');
    const snoozedTime = `${snoozeHours}:${snoozeMinutes}`;

    const snoozedAlarm: Alarm = {
      ...ringingAlarm,
      id: `snoozed_${Date.now()}`,
      time: snoozedTime,
      label: `Snoozed (${ringingAlarm.label || 'Morning Alarm'})`,
      days: [],
      enabled: true,
    };

    setAlarms((prev) => [snoozedAlarm, ...prev]);
    setRingingAlarm(null);
  };

  // Profile update
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    saveStoredProfile(updatedProfile);
  };

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
    setIsOnboardingOpen(false);
  };

  const handleLanguageChange = (newLanguage: string) => {
    const updated: UserProfile = {
      ...profile,
      language: newLanguage,
      nickname: (newLanguage === 'ur' && (profile.nickname === 'Sweetheart' || !profile.nickname))
        ? 'بیٹا'
        : profile.nickname,
    };
    setProfile(updated);
    saveStoredProfile(updated);
  };

  // Restore cloud backup
  const handleRestoreBackup = (data: any) => {
    if (data.profile) {
      setProfile(data.profile);
      saveStoredProfile(data.profile);
    }
    if (data.alarms) {
      setAlarms(data.alarms);
      saveStoredAlarms(data.alarms);
    }
    if (data.voiceNotes) {
      setVoiceNotes(data.voiceNotes);
      saveStoredVoiceNotes(data.voiceNotes);
    }
    if (data.theme && THEMES[data.theme as ThemeId]) {
      setCurrentTheme(data.theme as ThemeId);
    }
    if (typeof data.darkMode === 'boolean') {
      setDarkMode(data.darkMode);
    }
    setLastSyncTime(new Date().toISOString());
  };

  const handleTriggerCloudSync = () => {
    setLastSyncTime(new Date().toISOString());
  };

  const handleSaveBedtimeAlarm = (time: string, days: number[]) => {
    const newAlarm: Alarm = {
      id: `bedtime_${Date.now()}`,
      time,
      label: 'Bedtime Scheduled Wake-Up',
      enabled: true,
      days,
      soundType: 'maternal_speech',
      chimeSound: 'morning_chimes',
      crescendo: true,
      snoozeMinutes: 5,
      createdAt: Date.now(),
      repeatText: days.length === 5 ? 'Weekdays' : 'Custom',
    };
    const updated = [newAlarm, ...alarms];
    setAlarms(updated);
    saveStoredAlarms(updated);
    setActiveTab('alarms');
  };

  // Active theme configuration
  const activeTheme = THEMES[currentTheme] || THEMES.onyx_minimal;
  const activeAlarmsCount = alarms.filter((a) => a.enabled).length;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? activeTheme.backgroundDark : activeTheme.backgroundLight
      } ${darkMode ? 'text-[#C7C6C9]' : 'text-zinc-900'} flex flex-col font-sans selection:bg-[#F85E2B]/20 selection:text-[#F85E2B]`}
    >
      {/* Top Header */}
      <Header
        profile={profile}
        currentTheme={currentTheme}
        darkMode={darkMode}
        onThemeChange={(theme) => setCurrentTheme(theme)}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onLanguageChange={handleLanguageChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenThemes={() => setIsThemeModalOpen(true)}
      />

      {/* Main Responsive Body with bottom padding for BottomNavbar */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-32">
        
        {/* TAB 1: ALARMS (Matching Left Image with bold heading & alarm cards) */}
        {activeTab === 'alarms' && (
          <MainAlarmsView
            profile={profile}
            alarms={alarms}
            voiceNotes={voiceNotes}
            currentTheme={currentTheme}
            darkMode={darkMode}
            onToggleAlarm={handleToggleAlarm}
            onEditAlarm={(alarm) => {
              setAlarmToEdit(alarm);
              setIsAlarmModalOpen(true);
            }}
            onAddNewAlarm={() => {
              setAlarmToEdit(null);
              setIsAlarmModalOpen(true);
            }}
            onDeleteAlarm={handleDeleteAlarm}
            onPreviewAlarm={handlePreviewAlarm}
          />
        )}

        {/* TAB 2: WORLD CLOCK */}
        {activeTab === 'clock' && (
          <WorldClockSection 
            currentTheme={currentTheme} 
            onBack={() => setActiveTab('alarms')} 
          />
        )}

        {/* TAB 3: TIMER & STOPWATCH (Matching 2nd Screen of Image) */}
        {activeTab === 'timer' && (
          <TimerSection 
            currentTheme={currentTheme} 
            onBack={() => setActiveTab('alarms')} 
          />
        )}

        {/* TAB 4: BEDTIMES / SLEEP TIMER (Matching 3rd Screen of Image) */}
        {activeTab === 'bedtimes' && (
          <BedtimesSection
            currentTheme={currentTheme}
            onSaveBedtimeAlarm={handleSaveBedtimeAlarm}
            onBack={() => setActiveTab('alarms')}
          />
        )}

      </main>

      {/* Maternal Footer */}
      <footer className="w-full border-t border-zinc-200/40 dark:border-[#16161C] py-4 px-4 text-center text-xs text-zinc-500 dark:text-[#646366] mb-24 mt-auto">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <Heart size={12} style={{ color: activeTheme.previewAccent }} className="fill-current" />
            <span>Mimi • Gentle Maternal Calm</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              Custom Theme
            </button>
          </div>
        </div>
      </footer>

      {/* BOTTOM NAVBAR WITH (ALARMS, CLOCK, TIMER, BEDTIMES) & FLOATING ADD RECTANGULAR BUTTON */}
      <BottomNavbar
        activeTab={activeTab}
        currentTheme={currentTheme}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenCreateAlarm={() => {
          setAlarmToEdit(null);
          setIsAlarmModalOpen(true);
        }}
        alarmsCount={activeAlarmsCount}
      />

      {/* MODALS */}
      {/* 1. Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
        currentTheme={currentTheme}
      />

      {/* 2. Create / Edit Alarm Modal */}
      <CreateAlarmModal
        isOpen={isAlarmModalOpen}
        currentTheme={currentTheme}
        alarmToEdit={alarmToEdit}
        voiceNotes={voiceNotes}
        onSave={handleSaveAlarm}
        onClose={() => {
          setIsAlarmModalOpen(false);
          setAlarmToEdit(null);
        }}
      />

      {/* 3. Theme & Palette Selector (With Custom Onyx Studio Colors) */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        currentTheme={currentTheme}
        darkMode={darkMode}
        onSelectTheme={(theme) => setCurrentTheme(theme)}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {/* 4. Active Ringing Screen */}
      {ringingAlarm && (
        <ActiveAlarmModal
          alarm={ringingAlarm}
          profile={profile}
          voiceNotes={voiceNotes}
          currentTheme={currentTheme}
          onDismiss={handleDismissAlarm}
          onSnooze={handleSnoozeAlarm}
        />
      )}

      {/* 5. Offline Sync & Cloud Backup Modal */}
      <SyncBackupModal
        isOpen={isSyncModalOpen}
        isOnline={isOnline}
        lastSyncTime={lastSyncTime}
        profile={profile}
        alarms={alarms}
        voiceNotes={voiceNotes}
        currentTheme={currentTheme}
        darkMode={darkMode}
        onRestoreBackup={handleRestoreBackup}
        onTriggerCloudSync={handleTriggerCloudSync}
        onClose={() => setIsSyncModalOpen(false)}
      />

      {/* 6. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        profile={profile}
        currentTheme={currentTheme}
        darkMode={darkMode}
        onSaveProfile={handleSaveProfile}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
}
