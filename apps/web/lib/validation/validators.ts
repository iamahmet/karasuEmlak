/**
 * Form Validation Utilities for Web App
 * Reusable validation functions
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
 * Phone validation (Turkish format)
 */
export function validatePhone(phone: string, required = false): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    if (required) {
      return { valid: false, error: "Telefon numarası gereklidir" };
    }
    return { valid: true };
  }

  const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
  const cleaned = phone.replace(/\s|-/g, "");

  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: "Geçerli bir telefon numarası girin (örn: 05551234567)" };
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
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: "Geçerli bir URL girin (http:// veya https:// ile başlamalı)" };
  }
}

/**
 * Password validation
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { valid: false, error: "Şifre gereklidir" };
  }

  if (password.length < 8) {
    return { valid: false, error: "Şifre en az 8 karakter olmalıdır" };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Şifre en az bir büyük harf içermelidir" };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Şifre en az bir küçük harf içermelidir" };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Şifre en az bir rakam içermelidir" };
  }

  return { valid: true };
}

/**
 * Number range validation
 */
export function validateNumberRange(
  value: number | string,
  options: {
    min?: number;
    max?: number;
    fieldName?: string;
    required?: boolean;
  } = {}
): ValidationResult {
  const { min, max, fieldName = "Değer", required = false } = options;

  if (value === null || value === undefined || value === "") {
    if (required) {
      return { valid: false, error: `${fieldName} gereklidir` };
    }
    return { valid: true };
  }

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} geçerli bir sayı olmalıdır` };
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `${fieldName} en az ${min} olmalıdır` };
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `${fieldName} en fazla ${max} olabilir` };
  }

  return { valid: true };
}
