/**
 * Form Validation Utilities
 * Centralized validation functions for admin panel forms
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
  custom?: (value: any) => ValidationResult;
  email?: boolean;
  url?: boolean;
  number?: boolean;
  min?: number;
  max?: number;
  message?: string;
}

/**
 * Validate a single field
 */
export function validateField(
  value: any,
  rules: FieldValidation
): ValidationResult {
  // Required check
  if (rules.required && (!value || (typeof value === "string" && value.trim() === ""))) {
    return { valid: false, error: "Bu alan zorunludur" };
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return { valid: true };
  }

  // String validations
  if (typeof value === "string") {
    // Min length
    if (rules.minLength && value.length < rules.minLength) {
      return {
        valid: false,
        error: `En az ${rules.minLength} karakter olmalıdır`,
      };
    }

    // Max length
    if (rules.maxLength && value.length > rules.maxLength) {
      return {
        valid: false,
        error: `En fazla ${rules.maxLength} karakter olabilir`,
      };
    }

    // Email validation
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: "Geçerli bir e-posta adresi giriniz" };
      }
    }

    // URL validation
    if (rules.url) {
      try {
        new URL(value);
      } catch {
        return { valid: false, error: "Geçerli bir URL giriniz" };
      }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return { valid: false, error: "Geçersiz format" };
    }
  }

  // Number validations
  if (rules.number || rules.min !== undefined || rules.max !== undefined) {
    const numValue = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(numValue)) {
      return { valid: false, error: "Geçerli bir sayı giriniz" };
    }

    if (rules.min !== undefined && numValue < rules.min) {
      return {
        valid: false,
        error: `En az ${rules.min} olmalıdır`,
      };
    }

    if (rules.max !== undefined && numValue > rules.max) {
      return {
        valid: false,
        error: `En fazla ${rules.max} olabilir`,
      };
    }
  }

  // Custom validation
  if (rules.custom) {
    const result = rules.custom(value);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

/**
 * Validate multiple fields
 */
export function validateForm(
  data: Record<string, any>,
  schema: Record<string, FieldValidation>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const result = validateField(data[field], rules);
    if (!result.valid && result.error) {
      errors[field] = result.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Common validation schemas
 */
export const commonValidations = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200,
  },
  slug: {
    required: true,
    minLength: 3,
    maxLength: 200,
    pattern: /^[a-z0-9-]+$/,
  },
  email: {
    required: true,
    email: true,
  },
  url: {
    required: false,
    url: true,
  },
  excerpt: {
    required: false,
    maxLength: 500,
  },
  metaDescription: {
    required: false,
    maxLength: 160,
  },
  price: {
    required: true,
    number: true,
    min: 0,
  },
  area: {
    required: true,
    number: true,
    min: 1,
  },
  rooms: {
    required: true,
    number: true,
    min: 0,
    max: 20,
  },
};

/**
 * Generate slug from title
 * Improved: Truncates at word boundaries to avoid cutting words
 */
export function generateSlug(title: string, maxLength: number = 100): string {
  let slug = title
    .toLowerCase()
    .trim()
    // Turkish character replacements
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/İ/g, 'i')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  // If slug is longer than maxLength, truncate at word boundary
  if (slug.length > maxLength) {
    const truncated = slug.substring(0, maxLength);
    const lastHyphen = truncated.lastIndexOf('-');
    // If we found a hyphen and it's not too close to the start, use it
    if (lastHyphen > maxLength * 0.5) {
      slug = truncated.substring(0, lastHyphen);
    } else {
      // Otherwise, just truncate and remove trailing hyphen
      slug = truncated.replace(/-+$/, '');
    }
  }

  // Final cleanup
  return slug.replace(/^-+|-+$/g, '');
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): ValidationResult {
  if (!slug || slug.trim() === "") {
    return { valid: false, error: "Slug zorunludur" };
  }

  if (slug.length < 3) {
    return { valid: false, error: "Slug en az 3 karakter olmalıdır" };
  }

  if (slug.length > 200) {
    return { valid: false, error: "Slug en fazla 200 karakter olabilir" };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      valid: false,
      error: "Slug sadece küçük harf, rakam ve tire içerebilir",
    };
  }

  return { valid: true };
}
