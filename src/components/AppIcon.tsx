import React from 'react';
import { Icon } from '@iconify/react';

interface AppIconProps {
  icon: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const AppIcon: React.FC<AppIconProps> = ({
  icon,
  className = '',
  width = 20,
  height = 20,
}) => {
  return (
    <Icon
      icon={icon}
      width={width}
      height={height}
      className={`inline-block shrink-0 ${className}`}
    />
  );
};
