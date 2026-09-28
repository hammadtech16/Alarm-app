import React from 'react';
import { NavigationTab, ThemeId } from '../types';
import { THEMES } from '../utils/themes';
import { AppIcon } from './AppIcon';

interface BottomNavbarProps {
  activeTab: NavigationTab;
  currentTheme: ThemeId;
  onTabChange: (tab: NavigationTab) => void;
  onOpenCreateAlarm: () => void;
  alarmsCount?: number;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  activeTab,
  currentTheme,
  onTabChange,
  onOpenCreateAlarm,
  alarmsCount = 0,
}) => {
  const theme = THEMES[currentTheme] || THEMES.onyx_minimal;
  const highlightColor = theme.previewAccent || '#F85E2B';

  const tabs: { id: NavigationTab; label: string; icon: string; activeIcon: string }[] = [
    {
      id: 'alarms',
      label: 'Alarms',
      icon: 'solar:alarm-linear',
      activeIcon: 'solar:alarm-bold',
    },
    {
      id: 'clock',
      label: 'Clock',
      icon: 'solar:clock-circle-linear',
      activeIcon: 'solar:clock-circle-bold',
    },
    {
      id: 'timer',
      label: 'Timer',
      icon: 'solar:stopwatch-linear',
      activeIcon: 'solar:stopwatch-bold',
    },
    {
      id: 'bedtimes',
      label: 'Bedtimes',
      icon: 'solar:bed-linear',
      activeIcon: 'solar:bed-bold',
    },
  ];

  return (
    <>
      {/* Floating Action Rectangular Button with Add Icon (Matching Image Bottom Right) */}
      <div className="fixed bottom-24 right-5 sm:right-8 z-40">
        <button
          type="button"
          onClick={onOpenCreateAlarm}
          style={{ backgroundColor: highlightColor }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
          title="Create New Alarm"
        >
          <AppIcon
            icon="solar:add-linear"
            width={28}
            height={28}
            className="transition-transform group-hover:rotate-90 duration-200 stroke-2"
          />
        </button>
      </div>

      {/* Bottom Navbar (Alarms, Clock, Timer, Bedtimes) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 pb-3 pt-1 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto rounded-3xl bg-white/95 dark:bg-[#141415]/95 backdrop-blur-xl border border-zinc-200/80 dark:border-[#16161C] shadow-2xl px-2 py-1.5 transition-all duration-300">
          <div className="grid grid-cols-4 gap-1 items-center">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  style={isActive ? { backgroundColor: highlightColor } : undefined}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-zinc-400 dark:text-[#646366] hover:text-zinc-800 dark:hover:text-[#C7C6C9]'
                  }`}
                >
                  <div className="relative">
                    <AppIcon
                      icon={isActive ? tab.activeIcon : tab.icon}
                      width={22}
                      height={22}
                    />
                    {tab.id === 'alarms' && alarmsCount > 0 && !isActive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#F85E2B]" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium tracking-tight mt-0.5">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
