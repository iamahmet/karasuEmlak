import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for browser (client-side)
 * Uses anon key - safe for client-side usage
 */
export function createClient() {
  // Read environment variables directly from process.env
  // In Next.js, NEXT_PUBLIC_* vars are available at build time and runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate that required vars exist
  // Only throw error at runtime, not during build (for static pages that don't use Supabase)
  if (typeof window === 'undefined') {
    // Server-side/build time: return a dummy client that will fail gracefully
    // This allows static pages to build even if env vars are missing
    if (!supabaseUrl || !supabaseAnonKey) {
      // Return a client with placeholder values - it will fail at runtime if actually used
      // This prevents build errors for pages that don't actually use Supabase
      return createSupabaseBrowserClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder-key'
      );
    }
  }

  // Client-side/runtime: always validate
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase environment variables are missing. Please check your .env.local file.\n' +
      'Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
}

