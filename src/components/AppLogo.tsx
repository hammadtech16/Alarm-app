import React from 'react';

interface AppLogoProps {
  size?: number;
  variant?: 'monochrome' | 'warm';
  accentColor?: string;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 38,
  variant = 'warm',
  accentColor,
  className = '',
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: accentColor || (variant === 'monochrome' ? undefined : '#F85E2B'),
      }}
      className={`rounded-2xl flex items-center justify-center font-bold text-white shadow-md transition-all ${
        variant === 'monochrome' && !accentColor
          ? 'bg-black dark:bg-white text-white dark:text-black border border-zinc-700'
          : 'text-white'
      } ${className}`}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  );
};
