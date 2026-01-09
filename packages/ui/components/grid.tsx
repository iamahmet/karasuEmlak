/**
 * Grid Component
 * Consistent grid layouts
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@karasu/lib';

const gridVariants = cva('grid', {
  variants: {
    variant: {
      default: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      featured: 'grid-cols-1 lg:grid-cols-2',
      compact: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      single: 'grid-cols-1',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

export function Grid({ className, variant, ...props }: GridProps) {
  return (
    <div
      className={cn(gridVariants({ variant }), className)}
      {...props}
    />
  );
}
