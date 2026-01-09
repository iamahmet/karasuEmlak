import { describe, it, expect } from 'vitest';
import {
  cleanAIPlaceholders,
  removeRepetitiveContent,
  cleanContent,
} from '../content-cleaner';

describe('content-cleaner utilities', () => {
  describe('cleanAIPlaceholders', () => {
    it('should remove image placeholders', () => {
      const content = 'This is content [image: house.jpg] with placeholder';
      const result = cleanAIPlaceholders(content);
      expect(result).toBe('This is content  with placeholder');
    });

    it('should remove alt text placeholders', () => {
      const content = 'Image [alt text] description';
      const result = cleanAIPlaceholders(content);
      expect(result).toBe('Image  description');
    });

    it('should remove generic placeholders', () => {
      const content = 'Text [placeholder] more text';
      const result = cleanAIPlaceholders(content);
      expect(result).toBe('Text  more text');
    });

    it('should remove AI-specific markers', () => {
      const content = 'Content **:** marker';
      const result = cleanAIPlaceholders(content);
      expect(result).toBe('Content  marker');
    });

    it('should handle empty strings', () => {
      expect(cleanAIPlaceholders('')).toBe('');
      expect(cleanAIPlaceholders(null as any)).toBe('');
    });
  });

  describe('removeRepetitiveContent', () => {
    it('should remove repeated sentences', () => {
      const content = 'Sentence one. Sentence one. Sentence two.';
      const result = removeRepetitiveContent(content);
      expect(result).not.toContain('Sentence one. Sentence one.');
    });

    it('should preserve unique content', () => {
      const content = 'Unique sentence one. Unique sentence two.';
      const result = removeRepetitiveContent(content);
      expect(result).toContain('Unique sentence one');
      expect(result).toContain('Unique sentence two');
    });
  });

  describe('cleanContent', () => {
    it('should apply all cleaning functions', () => {
      const content = 'Content [image] with [alt text] placeholders';
      const result = cleanContent(content);
      expect(result).not.toContain('[image]');
      expect(result).not.toContain('[alt text]');
    });

    it('should handle empty content', () => {
      expect(cleanContent('')).toBe('');
    });
  });
});
