"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@karasu/lib";
import { validateField, FieldValidation, ValidationResult } from "@/lib/validation/form-validators";

interface EnhancedFormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "url" | "number" | "textarea" | "select";
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  validation?: FieldValidation;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  showValidationIcon?: boolean;
  debounceMs?: number;
  autoGenerateSlug?: boolean;
  onSlugGenerate?: (slug: string) => void;
}

export function EnhancedFormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  validation,
  error: externalError,
  hint,
  required = false,
  placeholder,
  className,
  disabled = false,
  options = [],
  showValidationIcon = true,
  debounceMs = 300,
  autoGenerateSlug = false,
  onSlugGenerate,
}: EnhancedFormFieldProps) {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const error = externalError || localError;
  const isValid = validationResult?.valid && !error;
  const showError = touched && error;

  // Real-time validation
  useEffect(() => {
    if (!validation || !touched) return;

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsValidating(true);

    // Debounce validation
    debounceTimerRef.current = setTimeout(() => {
      const result = validateField(value, validation);
      setValidationResult(result);
      setLocalError(result.error);
      setIsValidating(false);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, validation, touched, debounceMs]);

  // Auto-generate slug
  useEffect(() => {
    if (autoGenerateSlug && type === "text" && value && name === "title" && onSlugGenerate) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      if (slug) {
        onSlugGenerate(slug);
      }
    }
  }, [value, autoGenerateSlug, name, onSlugGenerate, type]);

  const handleBlur = () => {
    setTouched(true);
    if (onBlur) {
      onBlur();
    }
  };

  const handleChange = (newValue: any) => {
    onChange(newValue);
    if (!touched) {
      setTouched(true);
    }
  };

  const renderInput = () => {
    const baseClasses = cn(
      "input-professional focus-professional",
      showError && "border-red-500 focus:border-red-500 focus:ring-red-500",
      isValid && showValidationIcon && "border-green-500 focus:border-green-500",
      className
    );

    if (type === "textarea") {
      return (
        <Textarea
          id={name}
          name={name}
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(baseClasses, "min-h-[44px] touch-manipulation")}
          rows={4}
          style={{ touchAction: 'manipulation' }}
        />
      );
    }

    if (type === "select") {
      return (
        <Select
          value={value}
          onValueChange={handleChange}
          disabled={disabled}
        >
          <SelectTrigger id={name} className={cn(baseClasses, "min-h-[44px] touch-manipulation")} style={{ touchAction: 'manipulation' }}>
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
      );
    }

    return (
      <Input
        id={name}
        name={name}
        type={type}
        value={value || ""}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(baseClasses, "min-h-[44px] touch-manipulation")}
        style={{ touchAction: 'manipulation' }}
      />
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={name}
          className={cn(
            "text-sm font-ui font-semibold text-design-dark dark:text-white",
            required && "after:content-['*'] after:ml-1 after:text-red-500"
          )}
        >
          {label}
        </Label>
        {isValidating && (
          <div className="flex items-center gap-1 text-xs text-design-gray dark:text-gray-400">
            <div className="h-3 w-3 border-2 border-design-light border-t-transparent rounded-full animate-spin"></div>
            <span>Kontrol ediliyor...</span>
          </div>
        )}
      </div>

      <div className="relative">
        {renderInput()}
        {showValidationIcon && touched && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid && !isValidating && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            {showError && !isValidating && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>

      {hint && !showError && (
        <div className="flex items-start gap-1.5 text-xs text-design-gray dark:text-gray-400">
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>{hint}</span>
        </div>
      )}

      {showError && (
        <div className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
