import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for browser (client-side)
 * Uses anon key - safe for client-side usage
 * 
 * Always returns a valid client instance. If env vars are missing,
 * returns a client with placeholder values (API calls will fail gracefully).
 */
export function createClient() {
  // Only create client on client-side
  if (typeof window === 'undefined') {
    // Return a mock client for SSR that won't cause errors
    // This should never be used, but prevents SSR errors
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithOtp: () => Promise.resolve({ error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
        exchangeCodeForSession: () => Promise.resolve({ data: null, error: null }),
      },
      from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }) }),
    } as any;
  }

  // Read environment variables directly from process.env
  // In Next.js, NEXT_PUBLIC_* vars are available at build time and runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  // Check if environment variables are missing
  const isMissingEnvVars = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isMissingEnvVars) {
    // Log warning in console (helpful for debugging)
    console.warn(
      '⚠️ Supabase environment variables are missing!\n' +
      'Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
      'Please add them in Vercel Dashboard → Settings → Environment Variables'
    );
  }

  try {
    // createSupabaseBrowserClient always returns a valid client instance
    // It never returns null, so we can safely return it
    const client = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
    
    // Verify client has auth property - critical check
    if (!client) {
      console.error('Supabase client is null');
      throw new Error('Supabase client is null');
    }
    
    if (!client.auth) {
      console.error('Supabase client created but missing auth property');
      throw new Error('Invalid Supabase client - missing auth');
    }
    
    return client;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    // Return a safe fallback client with guaranteed auth property
    const fallbackClient = {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase client initialization failed' } }),
        signOut: () => Promise.resolve({ error: { message: 'Supabase client initialization failed' } }),
        signInWithOtp: () => Promise.resolve({ error: { message: 'Supabase client initialization failed' } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase client initialization failed' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase client initialization failed' } }),
        exchangeCodeForSession: () => Promise.resolve({ data: null, error: { message: 'Supabase client initialization failed' } }),
      },
      from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Supabase client initialization failed' } }) }) }),
    } as any;
    
    // Double-check fallback has auth
    if (!fallbackClient.auth) {
      console.error('CRITICAL: Fallback client missing auth property');
    }
    
    return fallbackClient;
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

