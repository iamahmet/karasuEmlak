/**
 * Form Validation Utilities
 * Enhanced validation functions for forms
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => string | undefined;
}

/**
 * Validate a single field
 */
export function validateField(value: any, validation: FieldValidation): ValidationResult {
  if (!validation) return { valid: true };

  // Required validation
  if (validation.required && (!value || (typeof value === "string" && value.trim().length === 0))) {
    return { valid: false, error: "Bu alan zorunludur" };
  }

  // String validations
  if (typeof value === "string") {
    if (validation.minLength && value.length < validation.minLength) {
      return { valid: false, error: `En az ${validation.minLength} karakter gereklidir` };
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return { valid: false, error: `En fazla ${validation.maxLength} karakter olabilir` };
    }
    if (validation.pattern && !validation.pattern.test(value)) {
      return { valid: false, error: "Geçersiz format" };
    }
  }

  // Custom validation
  if (validation.customValidator) {
    const customError = validation.customValidator(value);
    if (customError) {
      return { valid: false, error: customError };
    }
  }

  return { valid: true };
}

/**
 * Validate entire form
 */
export function validateForm(
  data: Record<string, any>,
  schema: Record<string, FieldValidation>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let valid = true;

  for (const [field, validation] of Object.entries(schema)) {
    const result = validateField(data[field], validation);
    if (!result.valid) {
      valid = false;
      if (result.error) {
        errors[field] = result.error;
      }
    }
  }

  return { valid, errors };
}

/**
 * Common validation presets
 */
export const commonValidations = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
  } as FieldValidation,

  slug: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-z0-9-]+$/,
    customValidator: (value: string) => {
      if (value && !/^[a-z0-9-]+$/.test(value)) {
        return "Slug sadece kucuk harf, rakam ve tire icermeli";
      }
    },
  } as FieldValidation,

  excerpt: {
    maxLength: 500,
  } as FieldValidation,

  metaDescription: {
    maxLength: 160,
  } as FieldValidation,

  content: {
    required: true,
    minLength: 10,
  } as FieldValidation,

  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    customValidator: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Gecerli bir e-posta adresi girin";
      }
    },
  } as FieldValidation,

  phone: {
    pattern: /^(\+90|0)?[5][0-9]{9}$/,
    customValidator: (value: string) => {
      if (value) {
        const cleaned = value.replace(/\s|-/g, "");
        if (!/^(\+90|0)?[5][0-9]{9}$/.test(cleaned)) {
          return "Gecerli bir telefon numarasi girin (orn: 05551234567)";
        }
      }
    },
  } as FieldValidation,

  url: {
    pattern: /^https?:\/\/.+/,
    customValidator: (value: string) => {
      if (value && !/^https?:\/\/.+/.test(value)) {
        return "Gecerli bir URL girin (http:// veya https:// ile baslayan)";
      }
    },
  } as FieldValidation,

  price: {
    required: true,
    customValidator: (value: any) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return "Gecerli bir fiyat girin";
      }
    },
  } as FieldValidation,

  area: {
    required: true,
    customValidator: (value: any) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return "Gecerli bir alan girin";
      }
    },
  } as FieldValidation,
};
