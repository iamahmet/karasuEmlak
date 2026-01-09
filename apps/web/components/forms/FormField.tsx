'use client';

import { Input } from '@karasu/ui';
import { Label } from '@karasu/ui';
import { Textarea } from '@karasu/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui';
import { AlertCircle } from 'lucide-react';
import { cn } from '@karasu/lib';
import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Standardized form field wrapper
 */
export function FormField({
  label,
  name,
  error,
  required = false,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name} className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="Zorunlu alan">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{hint}</p>
      )}
      {error && (
        <div className="flex items-start gap-2 text-sm md:text-base text-red-600 dark:text-red-400 mt-1" role="alert">
          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'number';
  disabled?: boolean;
  className?: string;
}

/**
 * Text input field with validation
 */
export function TextField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  hint,
  placeholder,
  type = 'text',
  disabled = false,
  className,
}: TextFieldProps) {
  return (
    <FormField label={label} name={name} error={error} required={required} hint={hint}>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
      />
    </FormField>
  );
}

interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Textarea field with validation
 */
export function TextAreaField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  hint,
  placeholder,
  rows = 4,
  disabled = false,
  className,
}: TextAreaFieldProps) {
  return (
    <FormField label={label} name={name} error={error} required={required} hint={hint}>
      <Textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
      />
    </FormField>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}

/**
 * Select field with validation
 */
export function SelectField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  hint,
  placeholder,
  options,
  disabled = false,
  className,
}: SelectFieldProps) {
  return (
    <FormField label={label} name={name} error={error} required={required} hint={hint}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={name}
          className={cn(
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
