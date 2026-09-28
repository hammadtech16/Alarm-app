import React, { useState, useEffect } from 'react';
import { ThemeId } from '../types';
import { THEMES } from '../utils/themes';
import { AppIcon } from './AppIcon';

interface WorldClockSectionProps {
  currentTheme: ThemeId;
  onBack?: () => void;
}

interface CityTime {
  name: string;
  timeZone: string;
  diffHours: string;
  isHighlight?: boolean;
}

export const WorldClockSection: React.FC<WorldClockSectionProps> = ({ currentTheme, onBack }) => {
  const [now, setNow] = useState(new Date());

  const theme = THEMES[currentTheme] || THEMES.onyx_minimal;
  const highlightColor = theme.previewAccent || '#F85E2B';

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cities: CityTime[] = [
    { name: 'Tokyo', timeZone: 'Asia/Tokyo', diffHours: '+4h' },
    { name: 'Mumbai / Karachi', timeZone: 'Asia/Karachi', diffHours: 'Local (0h)', isHighlight: true },
    { name: 'London', timeZone: 'Europe/London', diffHours: '-5h' },
    { name: 'New York', timeZone: 'America/New_York', diffHours: '-10h' },
    { name: 'Los Angeles', timeZone: 'America/Los_Angeles', diffHours: '-13h' },
  ];

  const getCityTime = (timeZone: string) => {
    try {
      const formatter = new Intl.DateTimeFormat([], {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return formatter.format(now);
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="space-y-6 py-2 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:text-[#C7C6C9] dark:hover:text-white bg-white dark:bg-[#141415] border border-zinc-200 dark:border-[#16161C] transition-colors cursor-pointer text-xs font-semibold shadow-xs"
            title="Back to Alarms"
          >
            <AppIcon icon="solar:arrow-left-linear" width={16} height={16} />
            <span>Back</span>
          </button>
        )}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000001] dark:text-white">
            World Clock
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#646366]">
            Keep track of loved ones across global time zones
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {cities.map((city) => {
          const formatted = getCityTime(city.timeZone);
          const [time, ampm] = formatted.split(' ');
          const isHigh = city.isHighlight;

          return (
            <div
              key={city.name}
              style={isHigh ? { backgroundColor: highlightColor } : undefined}
              className={`p-5 rounded-3xl flex items-center justify-between transition-all ${
                isHigh
                  ? 'text-white shadow-lg'
                  : 'bg-white dark:bg-[#141415] border border-zinc-200/80 dark:border-[#16161C] text-zinc-900 dark:text-[#C7C6C9] shadow-xs'
              }`}
            >
              <div>
                <h3 className={`text-base sm:text-lg font-bold ${isHigh ? 'text-white' : 'text-[#000001] dark:text-white'}`}>
                  {city.name}
                </h3>
                <p className={`text-xs font-medium ${isHigh ? 'text-white/80' : 'text-zinc-500 dark:text-[#646366]'}`}>
                  {city.diffHours}
                </p>
              </div>

              <div className="text-right">
                <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${isHigh ? 'text-white' : 'text-[#000001] dark:text-white'}`}>
                  {time}
                </span>
                <span className={`text-sm sm:text-base font-medium ml-1 ${isHigh ? 'text-white/80' : 'text-zinc-500 dark:text-[#646366]'}`}>
                  {ampm ? ampm.toLowerCase() : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
