/**
 * SidebarRail Component
 * Consistent sidebar layout for blog/news/listing pages
 */

import * as React from 'react';
import { cn } from '@karasu/lib';

interface SidebarRailProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  sticky?: boolean;
  sidebarWidth?: 'default' | 'narrow' | 'wide';
}

export function SidebarRail({
  children,
  sidebar,
  sticky = false,
  sidebarWidth = 'default',
  className,
  ...props
}: SidebarRailProps) {
  const sidebarCols = {
    default: 'lg:col-span-1',
    narrow: 'lg:col-span-1',
    wide: 'lg:col-span-2',
  };

  const contentCols = {
    default: 'lg:col-span-3',
    narrow: 'lg:col-span-3',
    wide: 'lg:col-span-2',
  };

  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8',
        className
      )}
      {...props}
    >
      {/* Main Content */}
      <main className={cn('min-w-0', contentCols[sidebarWidth])}>
        {children}
      </main>

      {/* Sidebar */}
      <aside
        className={cn(
          sidebarCols[sidebarWidth],
          sticky && 'lg:sticky lg:top-24 h-fit'
        )}
      >
        {sidebar}
      </aside>
    </div>
  );
}
