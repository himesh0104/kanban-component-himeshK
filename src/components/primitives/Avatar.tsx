import React from 'react';
import { getInitials } from '@/utils/task.utils';
import clsx from 'clsx';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className }) => {
  const initials = getInitials(name);
  
  const sizeStyles = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={clsx(
        'bg-primary-500 rounded-full text-white flex items-center justify-center font-medium',
        sizeStyles[size],
        className
      )}
      aria-label={`Avatar for ${name}`}
      role="img"
    >
      {initials}
    </div>
  );
};