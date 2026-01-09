/**
 * Form Validation Utilities
 * Reusable validation functions for admin panel forms
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: "E-posta adresi gereklidir" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: "Geçerli bir e-posta adresi girin" };
  }

  return { valid: true };
}

/**
 * URL validation
 */
export function validateURL(url: string, required = false): ValidationResult {
  if (!url || url.trim().length === 0) {
    if (required) {
      return { valid: false, error: "URL gereklidir" };
    }
    return { valid: true };
  }

  try {
    new URL(url.trim());
    return { valid: true };
  } catch {
    return { valid: false, error: "Geçerli bir URL girin" };
  }
}

/**
 * Password validation
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    maxLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSymbols?: boolean;
  } = {}
): ValidationResult {
  const {
    minLength = 6,
    maxLength = 128,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSymbols = false,
  } = options;

  if (!password || password.length === 0) {
    return { valid: false, error: "Şifre gereklidir" };
  }

  if (password.length < minLength) {
    return { valid: false, error: `Şifre en az ${minLength} karakter olmalıdır` };
  }

  if (password.length > maxLength) {
    return { valid: false, error: `Şifre en fazla ${maxLength} karakter olabilir` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, error: "Şifre en az bir büyük harf içermelidir" };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { valid: false, error: "Şifre en az bir küçük harf içermelidir" };
  }

  if (requireNumbers && !/[0-9]/.test(password)) {
    return { valid: false, error: "Şifre en az bir rakam içermelidir" };
  }

  if (requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: "Şifre en az bir özel karakter içermelidir" };
  }

  return { valid: true };
}

/**
 * Required field validation
 */
export function validateRequired(value: string | number | null | undefined, fieldName: string): ValidationResult {
  if (value === null || value === undefined || (typeof value === "string" && value.trim().length === 0)) {
    return { valid: false, error: `${fieldName} gereklidir` };
  }

  return { valid: true };
}

/**
 * String length validation
 */
export function validateLength(
  value: string,
  options: {
    min?: number;
    max?: number;
    fieldName?: string;
  } = {}
): ValidationResult {
  const { min, max, fieldName = "Alan" } = options;

  if (min !== undefined && value.length < min) {
    return { valid: false, error: `${fieldName} en az ${min} karakter olmalıdır` };
  }

  if (max !== undefined && value.length > max) {
    return { valid: false, error: `${fieldName} en fazla ${max} karakter olabilir` };
  }

  return { valid: true };
}

/**
 * Number range validation
 */
export function validateNumberRange(
  value: number,
  options: {
    min?: number;
    max?: number;
    fieldName?: string;
  } = {}
): ValidationResult {
  const { min, max, fieldName = "Değer" } = options;

  if (min !== undefined && value < min) {
    return { valid: false, error: `${fieldName} en az ${min} olmalıdır` };
  }

  if (max !== undefined && value > max) {
    return { valid: false, error: `${fieldName} en fazla ${max} olabilir` };
  }

  return { valid: true };
}

/**
 * Slug validation (for URLs, slugs, etc.)
 */
export function validateSlug(slug: string): ValidationResult {
  if (!slug || slug.trim().length === 0) {
    return { valid: false, error: "Slug gereklidir" };
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug.trim())) {
    return {
      valid: false,
      error: "Slug sadece küçük harf, rakam ve tire içerebilir",
    };
  }

  if (slug.length < 2) {
    return { valid: false, error: "Slug en az 2 karakter olmalıdır" };
  }

  if (slug.length > 100) {
    return { valid: false, error: "Slug en fazla 100 karakter olabilir" };
  }

  return { valid: true };
}

/**
 * Phone number validation (Turkish format)
 */
export function validatePhone(phone: string, required = false): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    if (required) {
      return { valid: false, error: "Telefon numarası gereklidir" };
    }
    return { valid: true };
  }

  // Turkish phone format: +90XXXXXXXXXX or 0XXXXXXXXXX
  const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
  const cleaned = phone.replace(/\s|-/g, "");

  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: "Geçerli bir telefon numarası girin (örn: 05551234567)" };
  }

  return { valid: true };
}

/**
 * Multiple validations
 */
export function validateAll(validations: ValidationResult[]): ValidationResult {
  for (const validation of validations) {
    if (!validation.valid) {
      return validation;
    }
  }
  return { valid: true };
}

/**
 * Form field validation helper
 */
export interface FormFieldValidation {
  [key: string]: ValidationResult;
}

export function validateForm<T extends Record<string, any>>(
  data: T,
  validators: {
    [K in keyof T]?: (value: T[K]) => ValidationResult;
  }
): { valid: boolean; errors: FormFieldValidation } {
  const errors: FormFieldValidation = {};
  let valid = true;

  for (const [field, validator] of Object.entries(validators)) {
    if (validator) {
      const result = validator(data[field]);
      if (!result.valid) {
        errors[field] = result;
        valid = false;
      }
    }
  }

  return { valid, errors };
}
