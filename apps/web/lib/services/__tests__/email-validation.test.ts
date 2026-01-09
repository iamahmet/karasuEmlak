import { describe, it, expect } from 'vitest';
import { validateEmail, isEmailValid } from '../email-validation';

describe('email-validation utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('isEmailValid', () => {
    it('should return true for valid emails', () => {
      expect(isEmailValid('test@example.com')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isEmailValid('invalid-email')).toBe(false);
    });
  });
});
