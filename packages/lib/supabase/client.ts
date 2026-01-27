import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for browser (client-side)
 * Uses anon key - safe for client-side usage
 * 
 * Always returns a valid client instance. If env vars are missing,
 * returns a client with placeholder values (API calls will fail gracefully).
 */
export function createClient() {
  // Read environment variables directly from process.env
  // In Next.js, NEXT_PUBLIC_* vars are available at build time and runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  // Check if environment variables are missing
  const isMissingEnvVars = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isMissingEnvVars && typeof window !== 'undefined') {
    // Log warning in console (helpful for debugging)
    console.warn(
      '⚠️ Supabase environment variables are missing!\n' +
      'Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
      'Please add them in Vercel Dashboard → Settings → Environment Variables'
    );
  }

  // createSupabaseBrowserClient always returns a valid client instance
  // It never returns null, so we can safely return it
  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

