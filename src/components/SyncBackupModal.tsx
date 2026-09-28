import React, { useState } from 'react';
import { Alarm, ThemeId, UserProfile, VoiceNote } from '../types';
import { exportCloudBackup, parseCloudBackup } from '../utils/db';
import { 
  X, 
  CloudCheck, 
  CloudDownload, 
  CloudUpload, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  FileJson, 
  Check,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface SyncBackupModalProps {
  isOpen: boolean;
  isOnline: boolean;
  lastSyncTime: string | null;
  profile: UserProfile;
  alarms: Alarm[];
  voiceNotes: VoiceNote[];
  currentTheme: ThemeId;
  darkMode: boolean;
  onRestoreBackup: (
    profile: UserProfile,
    alarms: Alarm[],
    voiceNotes: VoiceNote[],
    theme: ThemeId,
    darkMode: boolean
  ) => void;
  onTriggerCloudSync: () => void;
  onClose: () => void;
}

export const SyncBackupModal: React.FC<SyncBackupModalProps> = ({
  isOpen,
  isOnline,
  lastSyncTime,
  profile,
  alarms,
  voiceNotes,
  currentTheme,
  darkMode,
  onRestoreBackup,
  onTriggerCloudSync,
  onClose,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Export Backup JSON File
  const handleExportBackup = () => {
    try {
      const json = exportCloudBackup(profile, alarms, voiceNotes, currentTheme, darkMode);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mimi_alarm_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.warn('Backup export error', e);
      alert('Could not export backup: ' + e.message);
    }
  };

  // Handle Restore Backup JSON File
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const backup = parseCloudBackup(text);

        if (!confirm(`Restore backup containing ${backup.alarms?.length || 0} alarms and ${backup.voiceNotes?.length || 0} voice notes?`)) {
          return;
        }

        onRestoreBackup(
          backup.profile,
          backup.alarms,
          backup.voiceNotes || [],
          backup.theme || 'monochrome',
          backup.darkMode ?? false
        );

        setSyncSuccessMsg('Backup restored successfully!');
        setTimeout(() => setSyncSuccessMsg(null), 4000);
      } catch (err: any) {
        console.warn('Failed to parse backup', err);
        setRestoreError('Invalid backup file. Please select a valid Mimi JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  // Simulate Cloud Sync
  const handleCloudSync = () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    setTimeout(() => {
      onTriggerCloudSync();
      setIsSyncing(false);
      setSyncSuccessMsg('All alarms & voice notes synced securely to Cloud Vault.');
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold">
                Offline Sync & Cloud Backup
              </h2>
              <span className="text-xs text-zinc-400">
                Safe data storage with offline local database
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Real-time Network & Offline Status Banner */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi size={16} className="text-emerald-500" />
                ) : (
                  <WifiOff size={16} className="text-amber-500" />
                )}
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {isOnline ? 'Online - Cloud Sync Enabled' : 'Offline - Local Mode Active'}
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium">
                100% Offline Ready
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Mimi stores all alarms, voice notes, and mother affirmations directly in IndexedDB. Alarms will ring reliably even if your device has no WiFi or network connection.
            </p>
            {lastSyncTime && (
              <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
                Last Cloud Vault Sync: {new Date(lastSyncTime).toLocaleString()}
              </div>
            )}
          </div>

          {/* Sync status alert if available */}
          {syncSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/40">
              <Check size={14} className="shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {restoreError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800/40">
              <AlertCircle size={14} className="shrink-0" />
              <span>{restoreError}</span>
            </div>
          )}

          {/* Cloud Sync Action */}
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Sync to Secure Cloud Vault
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Synchronizes current alarms, voice recordings, and preferences
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloudSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 flex items-center gap-1.5 shrink-0 transition-all"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>

          {/* Export & Import Archive */}
          <div className="space-y-3">
            <label className="block text-xs uppercase font-semibold text-zinc-400 tracking-wider">
              File Backup & Migration
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportBackup}
                className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-all flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CloudDownload size={16} className="text-amber-500" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Export Backup Archive
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Download a complete .json file with all your alarms and voice notes.
                </p>
              </button>

              {/* Restore Button */}
              <label className="cursor-pointer p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-all flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <CloudUpload size={16} className="text-indigo-500" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Restore from File
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Load a saved .json backup archive from your device or cloud drive.
                </p>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

            </div>
          </div>

          {/* Local Data Storage Breakdown */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 text-xs space-y-2">
            <div className="font-semibold text-zinc-700 dark:text-zinc-300">
              Current Local Vault Breakdown:
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700">
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {alarms.length}
                </div>
                <div className="text-[10px] text-zinc-400">Alarms</div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700">
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {voiceNotes.length}
                </div>
                <div className="text-[10px] text-zinc-400">Voice Notes</div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700">
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  IndexedDB
                </div>
                <div className="text-[10px] text-zinc-400">Offline Store</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
