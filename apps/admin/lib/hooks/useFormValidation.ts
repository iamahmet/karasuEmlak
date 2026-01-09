/**
 * Form Validation Hook
 * Provides real-time validation feedback for forms
 */

import { useState, useCallback, useEffect } from "react";
import { ValidationResult } from "@/lib/validation/validators";

interface UseFormValidationOptions<T> {
  initialValues: T;
  validators: {
    [K in keyof T]?: (value: T[K]) => ValidationResult;
  };
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface FormValidationState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
}

/**
 * Hook for form validation with real-time feedback
 */
export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validators,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormValidationOptions<T>) {
  const [state, setState] = useState<FormValidationState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: false,
  });

  // Validate a single field
  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): string | undefined => {
      const validator = validators[field];
      if (!validator) return undefined;

      const result = validator(value);
      return result.valid ? undefined : result.error;
    },
    [validators]
  );

  // Validate all fields
  const validateAll = useCallback((): Partial<Record<keyof T, string>> => {
    const errors: Partial<Record<keyof T, string>> = {};

    for (const field in validators) {
      const error = validateField(field, state.values[field]);
      if (error) {
        errors[field] = error;
      }
    }

    return errors;
  }, [state.values, validators, validateField]);

  // Update field value
  const setValue = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setState((prev) => {
        const newValues = { ...prev.values, [field]: value };
        const errors = { ...prev.errors };

        // Validate on change if enabled
        if (validateOnChange && prev.touched[field]) {
          const error = validateField(field, value);
          if (error) {
            errors[field] = error;
          } else {
            delete errors[field];
          }
        }

        return {
          ...prev,
          values: newValues,
          errors,
          isValid: Object.keys(errors).length === 0,
        };
      });
    },
    [validateOnChange, validateField]
  );

  // Mark field as touched
  const setTouched = useCallback((field: keyof T, touched = true) => {
    setState((prev) => {
      const newTouched = { ...prev.touched, [field]: touched };
      const errors = { ...prev.errors };

      // Validate on blur if enabled
      if (validateOnBlur && touched) {
        const error = validateField(field, prev.values[field]);
        if (error) {
          errors[field] = error;
        } else {
          delete errors[field];
        }
      }

      return {
        ...prev,
        touched: newTouched,
        errors,
        isValid: Object.keys(errors).length === 0,
      };
    });
  }, [validateOnBlur, validateField]);

  // Handle field change
  const handleChange = useCallback(
    (field: keyof T) => (value: T[keyof T]) => {
      setValue(field, value);
    },
    [setValue]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched(field, true);
    },
    [setTouched]
  );

  // Reset form
  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: false,
    });
  }, [initialValues]);

  // Validate entire form
  const validate = useCallback((): boolean => {
    const errors = validateAll();
    setState((prev) => ({
      ...prev,
      errors,
      touched: Object.keys(prev.values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Partial<Record<keyof T, boolean>>
      ),
      isValid: Object.keys(errors).length === 0,
    }));
    return Object.keys(errors).length === 0;
  }, [validateAll]);

  // Update isValid when errors change
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isValid: Object.keys(prev.errors).length === 0,
    }));
  }, [state.errors]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    setValue,
    setTouched,
    handleChange,
    handleBlur,
    reset,
    validate,
  };
}
