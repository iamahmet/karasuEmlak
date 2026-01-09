import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeText } from '../sanitize';

describe('sanitize utilities', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const html = '<p>Safe content</p><script>alert("xss")</script>';
      const result = sanitizeHtml(html);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Safe content');
    });

    it('should remove event handlers', () => {
      const html = '<div onclick="alert(\'xss\')">Content</div>';
      const result = sanitizeHtml(html);
      expect(result).not.toContain('onclick');
    });

    it('should preserve safe HTML', () => {
      const html = '<p>Safe <strong>content</strong></p>';
      const result = sanitizeHtml(html);
      expect(result).toContain('Safe');
      expect(result).toContain('content');
    });

    it('should handle empty strings', () => {
      expect(sanitizeHtml('')).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('should remove HTML tags', () => {
      const text = '<p>Text content</p>';
      const result = sanitizeText(text);
      expect(result).toBe('Text content');
    });

    it('should decode HTML entities', () => {
      const text = 'Text &amp; content';
      const result = sanitizeText(text);
      expect(result).toContain('&');
    });

    it('should handle empty strings', () => {
      expect(sanitizeText('')).toBe('');
    });
  });
});
