/**
 * Advanced Form Validators
 * 
 * Comprehensive validation functions for common form fields
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'E-posta adresi gereklidir.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Geçerli bir e-posta adresi giriniz.' };
  }

  // Check for common typos
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return { valid: false, error: 'E-posta adresi formatı geçersiz.' };
  }

  return { valid: true };
}

/**
 * Phone number validation (Turkish format)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: 'Telefon numarası gereklidir.' };
  }

  // Remove spaces, dashes, parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Turkish phone formats: 05XX XXX XX XX, +905XX XXX XX XX, 0XXX XXX XX XX
  const phoneRegex = /^(?:\+90|0)?(5\d{2}|[2-9]\d{2})\d{7}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { valid: false, error: 'Geçerli bir telefon numarası giriniz (örn: 05XX XXX XX XX).' };
  }

  return { valid: true };
}

/**
 * Turkish ID number validation (TC Kimlik No)
 */
export function validateTurkishID(id: string): ValidationResult {
  if (!id || id.trim() === '') {
    return { valid: false, error: 'TC Kimlik No gereklidir.' };
  }

  // Must be 11 digits
  if (!/^\d{11}$/.test(id)) {
    return { valid: false, error: 'TC Kimlik No 11 haneli olmalıdır.' };
  }

  // First digit cannot be 0
  if (id[0] === '0') {
    return { valid: false, error: 'TC Kimlik No 0 ile başlayamaz.' };
  }

  // Check digit validation (simplified)
  const digits = id.split('').map(Number);
  const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
  
  if ((sum1 * 7 - sum2) % 10 !== digits[9]) {
    return { valid: false, error: 'Geçersiz TC Kimlik No.' };
  }

  const sumAll = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (sumAll % 10 !== digits[10]) {
    return { valid: false, error: 'Geçersiz TC Kimlik No.' };
  }

  return { valid: true };
}

/**
 * URL validation
 */
export function validateURL(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { valid: false, error: 'URL gereklidir.' };
  }

  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL http veya https ile başlamalıdır.' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Geçerli bir URL giriniz.' };
  }
}

/**
 * Password validation
 */
export function validatePassword(password: string, options: {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
} = {}): ValidationResult {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
  } = options;

  if (!password || password.trim() === '') {
    return { valid: false, error: 'Şifre gereklidir.' };
  }

  if (password.length < minLength) {
    return { valid: false, error: `Şifre en az ${minLength} karakter olmalıdır.` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, error: 'Şifre en az bir büyük harf içermelidir.' };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { valid: false, error: 'Şifre en az bir küçük harf içermelidir.' };
  }

  if (requireNumbers && !/\d/.test(password)) {
    return { valid: false, error: 'Şifre en az bir rakam içermelidir.' };
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Şifre en az bir özel karakter içermelidir.' };
  }

  return { valid: true };
}

/**
 * Price validation
 */
export function validatePrice(price: string | number): ValidationResult {
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.')) : price;

  if (isNaN(numPrice) || numPrice < 0) {
    return { valid: false, error: 'Geçerli bir fiyat giriniz.' };
  }

  if (numPrice === 0) {
    return { valid: false, error: 'Fiyat 0 olamaz.' };
  }

  return { valid: true };
}

/**
 * Required field validation
 */
export function validateRequired(value: string | number | null | undefined, fieldName: string = 'Bu alan'): ValidationResult {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: `${fieldName} gereklidir.` };
  }
  return { valid: true };
}

/**
 * Min length validation
 */
export function validateMinLength(value: string, minLength: number, fieldName: string = 'Bu alan'): ValidationResult {
  if (!value || value.length < minLength) {
    return { valid: false, error: `${fieldName} en az ${minLength} karakter olmalıdır.` };
  }
  return { valid: true };
}

/**
 * Max length validation
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string = 'Bu alan'): ValidationResult {
  if (value && value.length > maxLength) {
    return { valid: false, error: `${fieldName} en fazla ${maxLength} karakter olabilir.` };
  }
  return { valid: true };
}

/**
 * Number range validation
 */
export function validateRange(value: number, min: number, max: number, fieldName: string = 'Bu alan'): ValidationResult {
  if (isNaN(value)) {
    return { valid: false, error: `${fieldName} geçerli bir sayı olmalıdır.` };
  }

  if (value < min || value > max) {
    return { valid: false, error: `${fieldName} ${min} ile ${max} arasında olmalıdır.` };
  }

  return { valid: true };
}

/**
 * Date validation
 */
export function validateDate(date: string | Date, options: {
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
} = {}): ValidationResult {
  const { minDate, maxDate, required = true } = options;

  if (!date) {
    if (required) {
      return { valid: false, error: 'Tarih gereklidir.' };
    }
    return { valid: true };
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Geçerli bir tarih giriniz.' };
  }

  if (minDate && dateObj < minDate) {
    return { valid: false, error: `Tarih ${minDate.toLocaleDateString('tr-TR')} tarihinden sonra olmalıdır.` };
  }

  if (maxDate && dateObj > maxDate) {
    return { valid: false, error: `Tarih ${maxDate.toLocaleDateString('tr-TR')} tarihinden önce olmalıdır.` };
  }

  return { valid: true };
}

/**
 * Combine multiple validators
 */
export function combineValidators(...validators: Array<() => ValidationResult>): ValidationResult {
  for (const validator of validators) {
    const result = validator();
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}
