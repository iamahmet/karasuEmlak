import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withTimeout, withTimeoutAll, createTimeout } from '../timeout';

describe('timeout utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createTimeout', () => {
    it('should reject after specified milliseconds', async () => {
      const timeout = createTimeout(1000, 'Custom timeout message');
      
      vi.advanceTimersByTime(1000);
      
      await expect(timeout).rejects.toThrow('Custom timeout message');
    });
  });

  describe('withTimeout', () => {
    it('should resolve with value when promise resolves before timeout', async () => {
      const promise = Promise.resolve('success');
      const result = withTimeout(promise, 1000, 'fallback');

      // Advance timers but promise resolves immediately
      await expect(result).resolves.toBe('success');
    });

    it('should return fallback when promise times out', async () => {
      const promise = new Promise<string>((resolve) => {
        setTimeout(() => resolve('success'), 2000);
      });
      const result = withTimeout(promise, 1000, 'fallback');

      // Advance past timeout
      vi.advanceTimersByTime(1000);
      
      const resolved = await result;
      expect(resolved).toBe('fallback');
    });

    it('should handle rejected promises gracefully', async () => {
      const promise = Promise.reject(new Error('test error'));
      const result = withTimeout(promise, 1000, 'fallback');

      await expect(result).resolves.toBe('fallback');
    });

    it('should use null as default fallback', async () => {
      const promise = new Promise<string>((resolve) => {
        setTimeout(() => resolve('success'), 2000);
      });
      const result = withTimeout(promise, 1000);

      vi.advanceTimersByTime(1000);
      await expect(result).resolves.toBeNull();
    });
  });

  describe('withTimeoutAll', () => {
    it('should resolve all promises when they complete before timeout', async () => {
      const promises = [
        Promise.resolve('result1'),
        Promise.resolve('result2'),
        Promise.resolve('result3'),
      ];
      const result = withTimeoutAll(promises, 1000, null);

      await expect(result).resolves.toEqual(['result1', 'result2', 'result3']);
    });

    it('should return fallbacks when promises timeout', async () => {
      const promises = [
        new Promise<string>((resolve) => setTimeout(() => resolve('result1'), 2000)),
        Promise.resolve('result2'),
        new Promise<string>((resolve) => setTimeout(() => resolve('result3'), 2000)),
      ];
      const result = withTimeoutAll(promises, 1000, null);

      // Run all pending timers
      await vi.runAllTimersAsync();
      
      const resolved = await result;
      expect(resolved[0]).toBeNull();
      expect(resolved[1]).toBe('result2');
      expect(resolved[2]).toBeNull();
    });

    it('should handle mixed resolved and rejected promises', async () => {
      const promises = [
        Promise.resolve('result1'),
        Promise.reject(new Error('error')),
        Promise.resolve('result3'),
      ];
      const result = withTimeoutAll(promises, 1000, null);

      const resolved = await result;
      expect(resolved[0]).toBe('result1');
      expect(resolved[1]).toBeNull();
      expect(resolved[2]).toBe('result3');
    });
  });
});
