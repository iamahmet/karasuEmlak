/**
 * Safe HTTP Fetch Utilities
 * 
 * Provides safe JSON fetching with proper error handling.
 * Replaces all direct fetch().then(res => res.json()) calls.
 */

import { safeJsonParse } from '@/lib/utils/safeJsonParse';

export interface SafeFetchResult<T = any> {
  ok: boolean;
  data?: T;
  status?: number;
  reason?: 'network_error' | 'http_error' | 'non_json' | 'bad_json' | 'timeout';
  bodySnippet?: string;
  error?: string;
}

/**
 * Safely fetch and parse JSON
 * 
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns SafeFetchResult with parsed data or error details
 */
export async function safeFetchJSON<T = any>(
  url: string,
  options?: RequestInit & { timeout?: number }
): Promise<SafeFetchResult<T>> {
  const timeout = options?.timeout || 10000; // 10s default
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Read as text first (we need to check content-type before parsing)
    const text = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.toLowerCase().includes('application/json');

    // Check HTTP status
    if (response.status >= 400) {
      return {
        ok: false,
        status: response.status,
        reason: 'http_error',
        bodySnippet: text.slice(0, 200),
        error: `HTTP ${response.status}`,
      };
    }

    // If not JSON content-type, return error
    if (!isJson) {
      return {
        ok: false,
        status: response.status,
        reason: 'non_json',
        bodySnippet: text.slice(0, 200),
        error: `Expected JSON but got ${contentType}`,
      };
    }

    // Try to parse JSON using safeJsonParse
    const PARSE_FAILED = '__SAFE_JSON_PARSE_FAILED__';
    const data = safeJsonParse(text, PARSE_FAILED as any, {
      context: 'safeFetchJSON',
      dedupeKey: `safeFetchJSON:${url}`,
    });

    if (data === PARSE_FAILED) {
      return {
        ok: false,
        status: response.status,
        reason: 'bad_json',
        bodySnippet: text.slice(0, 200),
        error: 'Invalid JSON',
      };
    }

    return {
      ok: true,
      data: data as T,
      status: response.status,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      return {
        ok: false,
        reason: 'timeout',
        error: `Request timeout after ${timeout}ms`,
      };
    }

    return {
      ok: false,
      reason: 'network_error',
      error: error?.message || 'Network error',
    };
  }
}

/**
 * Safely fetch text (non-JSON)
 */
export async function safeFetchText(
  url: string,
  options?: RequestInit & { timeout?: number }
): Promise<SafeFetchResult<string>> {
  const timeout = options?.timeout || 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status >= 400) {
      const text = await response.text();
      return {
        ok: false,
        status: response.status,
        reason: 'http_error',
        bodySnippet: text.slice(0, 200),
        error: `HTTP ${response.status}`,
      };
    }

    const text = await response.text();
    return {
      ok: true,
      data: text,
      status: response.status,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      return {
        ok: false,
        reason: 'timeout',
        error: `Request timeout after ${timeout}ms`,
      };
    }

    return {
      ok: false,
      reason: 'network_error',
      error: error?.message || 'Network error',
    };
  }
}
