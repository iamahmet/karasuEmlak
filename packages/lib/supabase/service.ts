import { createClient } from '@supabase/supabase-js';
import { getEnv } from '@karasu-emlak/config';

/**
 * Supabase service role client (server-side only)
 * Full access - use with caution, never expose to client
 * 
 * This is the shared service client for admin panel.
 * Web app uses apps/web/lib/supabase/clients.ts
 */
export function createServiceClient() {
  // Try to get from validated env first
  let supabaseUrl: string | undefined;
  let serviceRoleKey: string | undefined;
  
  try {
    const env = getEnv();
    // Try SUPABASE_URL first, fallback to NEXT_PUBLIC_SUPABASE_URL
    supabaseUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
    serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  } catch (error) {
    // Fallback to process.env if getEnv fails (development mode)
    // Try both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL
    supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing required Supabase environment variables.\n' +
      'Required: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY\n' +
      `SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}\n` +
      `SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? 'SET' : 'MISSING'}`
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      // Remove explicit schema - let Supabase use default
      // db: {
      //   schema: 'public',
      // },
      global: {
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
        },
      },
    }
  );
}
