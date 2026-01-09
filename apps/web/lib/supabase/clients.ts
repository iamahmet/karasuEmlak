/**
 * Single Source of Truth: Supabase Client Creation
 * 
 * This file provides the ONLY way to create Supabase clients in the application.
 * All database access must go through these functions to ensure:
 * - Consistent client configuration
 * - Proper RLS enforcement
 * - Clear separation between anon and service role access
 * 
 * RULES:
 * - createAnonClient(): Public reads (browser/server components) - respects RLS
 * - createServiceClient(): Admin/server operations - bypasses RLS
 * - NEVER use service role key in client-side code
 * - NEVER expose service role key to browser
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get Supabase environment variables
 */
function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing required Supabase environment variables.\n' +
      'Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return { url, anonKey, serviceKey };
}

/**
 * Create anon client for browser (client-side)
 * 
 * Usage: Client components, browser-side data fetching
 * RLS: Enforced - only sees published/approved data
 * 
 * @returns Supabase client with anon key
 */
export function createAnonClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseEnv();
  
  return createBrowserClient(url, anonKey);
}

/**
 * Create anon client for server (server-side with cookies)
 * 
 * Usage: Server components, server actions with session management
 * RLS: Enforced - only sees published/approved data
 * 
 * @returns Supabase client with anon key and cookie support
 */
export async function createAnonServerClient(): Promise<SupabaseClient> {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Create service role client (server-only, admin access)
 * 
 * Usage: Admin API routes, server-side operations requiring full access
 * RLS: Bypassed - sees ALL data
 * 
 * WARNING: Never use this in client-side code. Never expose service key to browser.
 * 
 * @returns Supabase client with service role key
 */
export function createServiceClient(): SupabaseClient {
  const { url, serviceKey } = getSupabaseEnv();

  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for service client.\n' +
      'This should only be used in server-side code (API routes, server actions).'
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Type guard to check if we're in a server environment
 */
export function isServerEnvironment(): boolean {
  return typeof window === 'undefined';
}
