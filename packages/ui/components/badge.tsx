'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@karasu/lib';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[13px] font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-gray-200 bg-gray-100 text-gray-900',
        secondary: 'border-gray-200 bg-white text-gray-900',
        success: 'border-green-200 bg-green-100 text-green-900',
        error: 'border-red-200 bg-red-100 text-red-900',
        warning: 'border-yellow-200 bg-yellow-100 text-yellow-900',
        info: 'border-blue-200 bg-blue-100 text-blue-900',
        outline: 'border-gray-300 text-gray-900',
      },
      size: {
        default: 'px-2.5 py-0.5 text-[13px]',
        sm: 'px-2 py-0.5 text-[11px]',
        lg: 'px-3 py-1 text-[15px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

function Badge({ className, variant, size, pulse, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        pulse && 'badge-pulse',
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
