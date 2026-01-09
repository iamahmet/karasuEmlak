/**
 * IconWrapper Component
 * Standardizes icon appearance across the app for Apple-quality consistency
 */

import { LucideIcon } from 'lucide-react';
import { cn } from '@karasu/lib';

interface IconWrapperProps {
  icon: LucideIcon;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

/**
 * IconWrapper - Ensures consistent icon styling
 * 
 * Features:
 * - Standardized stroke-width (1.5 for Apple quality)
 * - Consistent sizing
 * - Smooth transitions
 * - Proper alignment
 * 
 * Usage:
 * <IconWrapper icon={Home} size="md" />
 */
export function IconWrapper({ 
  icon: Icon, 
  className, 
  size = 'md',
  strokeWidth = 1.5 
}: IconWrapperProps) {
  return (
    <Icon 
      className={cn(
        sizeMap[size],
        'flex-shrink-0',
        'transition-all duration-200',
        className
      )}
      strokeWidth={strokeWidth}
      style={{
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }}
    />
  );
}

/**
 * Icon sizing utilities for consistent usage
 */
export const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10',
};

/**
 * Icon stroke-width utilities
 */
export const iconStrokes = {
  thin: 1,
  normal: 1.5,
  medium: 2,
  bold: 2.5,
};

