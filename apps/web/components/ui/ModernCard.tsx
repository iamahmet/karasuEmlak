/**
 * Modern Card Component - Adobe 2026 Style
 * Glassmorphism + Hover effects + Micro-interactions
 */

import { ReactNode } from 'react';
import { cn } from '@karasu/lib';

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function ModernCard({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  padding = 'md',
}: ModernCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white border-2 border-gray-200',
    glass: 'glass border-2 border-white/40',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200',
    elevated: 'bg-white border-2 border-gray-200 shadow-xl',
  };

  return (
    <div className={cn(
      'relative rounded-2xl',
      'transition-all duration-500 ease-out',
      hover && 'hover-lift hover:border-[#006AFF]/30',
      variantClasses[variant],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Gradient Card - Premium variant
 */
export function GradientCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      'relative p-8 rounded-2xl overflow-hidden',
      'bg-gradient-to-br from-[#006AFF] via-[#0052CC] to-[#003D99]',
      'border-2 border-[#0052CC]/20',
      'shadow-2xl',
      'transition-all duration-500',
      'hover:scale-105 hover:shadow-[#006AFF]/20',
      className
    )}>
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * Icon Card - For features/services
 */
export function IconCard({ 
  icon: Icon, 
  title, 
  description,
  color = "from-blue-500 to-blue-600",
  bgColor = "bg-blue-50",
}: { 
  icon: any; 
  title: string; 
  description: string;
  color?: string;
  bgColor?: string;
}) {
  return (
    <ModernCard hover className="group">
      {/* Icon */}
      <div className={cn(
        "inline-flex p-4 rounded-xl mb-5",
        "transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
        bgColor
      )}>
        <Icon className={cn(
          "h-8 w-8 stroke-[2]",
          `bg-gradient-to-br ${color} bg-clip-text text-transparent`
        )} style={{ WebkitTextFillColor: 'transparent' }} />
      </div>

      {/* Content */}
      <h3 className="text-[20px] font-display font-bold text-gray-900 mb-3 tracking-[-0.02em] group-hover:text-[#006AFF] transition-colors duration-200">
        {title}
      </h3>
      <p className="text-[15px] text-gray-600 leading-relaxed tracking-[-0.011em]">
        {description}
      </p>

      {/* Decorative Gradient */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-0",
        "transition-opacity duration-300 group-hover:opacity-20",
        `bg-gradient-to-br ${color}`
      )} />
    </ModernCard>
  );
}

