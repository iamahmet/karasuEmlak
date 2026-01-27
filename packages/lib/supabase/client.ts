import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for browser (client-side)
 * Uses anon key - safe for client-side usage
 */
export function createClient() {
  try {
    // Read environment variables directly from process.env
    // In Next.js, NEXT_PUBLIC_* vars are available at build time and runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Check if environment variables are missing
    const isMissingEnvVars = !supabaseUrl || !supabaseAnonKey;

    if (isMissingEnvVars) {
      // Log warning in console (helpful for debugging)
      if (typeof window !== 'undefined') {
        console.error(
          '⚠️ Supabase environment variables are missing!\n' +
          'Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
          'Please add them in Vercel Dashboard → Settings → Environment Variables'
        );
      }

      // Return a client with placeholder values
      // This prevents crashes but API calls will fail gracefully
      // The UI should handle this case and show a user-friendly message
      const client = createSupabaseBrowserClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder-key'
      );
      
      // Verify client was created successfully
      if (!client || !client.auth) {
        console.error('Failed to create Supabase client with placeholder values');
        return null;
      }
      
      return client;
    }

    const client = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
    
    // Verify client was created successfully
    if (!client || !client.auth) {
      console.error('Failed to create Supabase client');
      return null;
    }
    
    return client;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
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

