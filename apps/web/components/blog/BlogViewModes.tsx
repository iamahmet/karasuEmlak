'use client';

import { Grid3x3, List, LayoutGrid } from 'lucide-react';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';

export type ViewMode = 'grid' | 'list' | 'compact';

interface BlogViewModesProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
}

/**
 * Blog View Modes Component
 * Allows users to switch between grid, list, and compact views
 */
export function BlogViewModes({
  currentMode,
  onModeChange,
  className,
}: BlogViewModesProps) {
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange('grid')}
        className={cn(
          'h-8 px-3',
          currentMode === 'grid'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        )}
        aria-label="Grid görünümü"
      >
        <Grid3x3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange('list')}
        className={cn(
          'h-8 px-3',
          currentMode === 'list'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        )}
        aria-label="Liste görünümü"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange('compact')}
        className={cn(
          'h-8 px-3',
          currentMode === 'compact'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        )}
        aria-label="Kompakt görünümü"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
