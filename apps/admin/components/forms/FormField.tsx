"use client";

import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { FormError } from "@/components/ui/FormError";
import { cn } from "@karasu/lib";
import { ReactNode } from "react";

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
 * Standardized form field wrapper with label, error, and hint
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
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground font-ui">{hint}</p>
      )}
      {error && <FormError message={error} />}
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
  type?: "text" | "email" | "password" | "url" | "tel" | "number";
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
  type = "text",
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
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          "min-h-[44px] touch-manipulation",
          className
        )}
        style={{ touchAction: 'manipulation' }}
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
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
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
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            "min-h-[44px] touch-manipulation",
            className
          )}
          style={{ touchAction: 'manipulation' }}
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
