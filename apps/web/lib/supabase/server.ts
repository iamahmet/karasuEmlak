import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getEnv } from '@karasu-emlak/config';
import type { CookieOptions } from '@supabase/ssr';

/**
 * Supabase client for server (server-side)
 * Uses anon key with cookies for session management
 */
export async function createClient() {
  try {
    const cookieStore = await cookies();
    
    // Get env vars with fallback (don't fail if getEnv() throws)
    let supabaseUrl: string;
    let supabaseAnonKey: string;
    
    try {
      const env = getEnv();
      supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
      supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    } catch (error: any) {
      // Fallback to process.env if getEnv() fails
      supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
      supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
          'Missing required Supabase environment variables.\n' +
          'Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
          `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}\n` +
          `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'SET' : 'MISSING'}`
        );
      }
    }

    return createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
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
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
  } catch (error: any) {
    console.error('[createClient] Error creating Supabase client:', error.message);
    throw error;
  }
}

