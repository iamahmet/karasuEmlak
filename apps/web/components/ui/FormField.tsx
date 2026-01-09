'use client';

import { forwardRef, ReactNode } from 'react';
import { Label } from '@karasu/ui';
import { cn } from '@karasu/lib';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
  showSuccess?: boolean;
}

/**
 * Enhanced Form Field Component
 * Provides consistent form field styling with validation states
 */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, hint, required, children, className, id, showSuccess = false }, ref) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const isValid = showSuccess && !error;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={fieldId} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          {children}
          
          {/* Validation Icons */}
          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
            </div>
          )}
          {isValid && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Error Message */}
        {hasError && (
          <p className="text-sm text-destructive flex items-center gap-1" role="alert">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}

        {/* Hint Message */}
        {!hasError && hint && (
          <p className="text-sm text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
