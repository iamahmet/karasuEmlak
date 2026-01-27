import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateEmail, isEmailValid } from '../email-validation';

vi.mock('@/lib/utils/api-client', () => ({
  fetchWithRetry: vi.fn().mockResolvedValue({ success: false }),
}));

describe('email-validation utilities', () => {
  describe('validateEmail', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should validate correct email addresses', async () => {
      expect((await validateEmail('test@example.com'))?.valid).toBe(true);
      expect((await validateEmail('user.name@domain.co.uk'))?.valid).toBe(true);
      expect((await validateEmail('user+tag@example.com'))?.valid).toBe(true);
    });

    it('should reject invalid email addresses', async () => {
      expect((await validateEmail('invalid'))?.valid).toBe(false);
      expect((await validateEmail('@example.com'))?.valid).toBe(false);
      expect((await validateEmail('user@'))?.valid).toBe(false);
      expect((await validateEmail('user @example.com'))?.valid).toBe(false);
    });

    it('should handle empty strings', async () => {
      expect((await validateEmail(''))?.valid).toBe(false);
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
