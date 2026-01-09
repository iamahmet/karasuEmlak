import { Info, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';
import { cn } from '@karasu/lib';

interface CalloutBoxProps {
  type?: 'info' | 'warning' | 'tip' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutStyles = {
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-800',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
    textColor: 'text-amber-800',
  },
  tip: {
    icon: Lightbulb,
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    textColor: 'text-green-800',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-900',
    textColor: 'text-emerald-800',
  },
};

export function CalloutBox({ 
  type = 'info', 
  title, 
  children, 
  className 
}: CalloutBoxProps) {
  const styles = calloutStyles[type];
  const Icon = styles.icon;

  return (
    <div className={cn(
      "rounded-lg border-l-4 p-5 my-6",
      styles.bg,
      styles.border,
      className
    )}>
      <div className="flex gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", styles.iconColor)} />
        <div className="flex-1">
          {title && (
            <h4 className={cn("font-semibold mb-2", styles.titleColor)}>
              {title}
            </h4>
          )}
          <div className={cn("text-sm leading-relaxed", styles.textColor)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
