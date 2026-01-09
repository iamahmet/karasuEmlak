/**
 * Nonce Utilities for CSP
 * 
 * Provides utilities to access nonce in server components
 * Nonce is generated in middleware and passed via request headers
 */

import { headers } from 'next/headers';

/**
 * Get nonce from request headers (server components only)
 * 
 * Usage:
 * ```tsx
 * // In server component
 * const nonce = getNonce();
 * 
 * // Use in Script component
 * <Script nonce={nonce} ... />
 * ```
 */
export async function getNonce(): Promise<string | null> {
  try {
    const headersList = await headers();
    return headersList.get('x-nonce');
  } catch {
    // Not in server component context
    return null;
  }
}

/**
 * Get nonce synchronously (use only if you're sure you're in server context)
 * This will throw if used in client component
 * @deprecated Use getNonce() instead - headers() is async in Next.js 16
 */
export async function getNonceSync(): Promise<string | null> {
  try {
    // This will only work in server components
    const headersList = await headers();
    return headersList.get('x-nonce');
  } catch {
    return null;
  }
}
