/**
 * Email Validation API Service
 * Uses EVA (Email Validation API) - free, no API key required
 * Alternative: EmailRep (free tier: 150 requests/month)
 * Alternative: Abstract API Email Validation (free tier: 100 requests/month)
 */

import { fetchWithRetry } from '@/lib/utils/api-client';

export interface EmailValidationResult {
  email: string;
  valid: boolean;
  disposable?: boolean;
  role?: boolean;
  free?: boolean;
  domain?: string;
  suggestion?: string;
  reason?: string;
}

/**
 * Validate email address
 */
export async function validateEmail(
  email: string
): Promise<EmailValidationResult | null> {
  try {
    // Use EVA API (free, no API key, unlimited)
    const url = `https://eva.pingutil.com/api?email=${encodeURIComponent(email)}`;
    
    const data = await fetchWithRetry<{
      status: boolean;
      email: string;
      domain: string;
      valid: boolean;
      disposable: boolean;
      webmail: boolean;
      role: boolean;
      reason?: string;
    }>(url);

    if (data.success && data.data) {
      return {
        email: data.data.email,
        valid: data.data.valid && data.data.status,
        disposable: data.data.disposable,
        role: data.data.role,
        free: data.data.webmail,
        domain: data.data.domain,
        reason: data.data.reason,
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Email validation API error:', error);
    }
  }

  // Fallback: basic regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    email,
    valid: emailRegex.test(email),
  };
}

/**
 * Check if email is disposable (temporary email)
 */
export async function isDisposableEmail(email: string): Promise<boolean> {
  const result = await validateEmail(email);
  return result?.disposable || false;
}
