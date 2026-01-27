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

  // Always return a safe client - never return null or undefined
  let client;
  try {
    // createSupabaseBrowserClient should always return a valid client instance
    client = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
    
    // Critical: Verify client exists and has auth property
    if (!client) {
      console.error('CRITICAL: createSupabaseBrowserClient returned null/undefined');
      throw new Error('Supabase client is null');
    }
    
    if (!client.auth) {
      console.error('CRITICAL: Supabase client missing auth property');
      throw new Error('Invalid Supabase client - missing auth');
    }
    
    // Additional safety check: verify auth has required methods
    if (typeof client.auth.getUser !== 'function') {
      console.error('CRITICAL: Supabase client.auth.getUser is not a function');
      throw new Error('Invalid Supabase client - auth.getUser missing');
    }
    
    return client;
  } catch (error: any) {
    console.error('Error creating Supabase client:', error?.message || error);
    // Return a safe fallback client with guaranteed auth property
    // This ensures we NEVER return null/undefined
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
    
    // Triple-check fallback has auth (should never fail, but safety first)
    if (!fallbackClient || !fallbackClient.auth) {
      console.error('CRITICAL: Fallback client construction failed - this should never happen');
      // Last resort: return minimal client
      return {
        auth: {
          getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Critical Supabase client failure' } }),
          signOut: () => Promise.resolve({ error: { message: 'Critical Supabase client failure' } }),
          signInWithOtp: () => Promise.resolve({ error: { message: 'Critical Supabase client failure' } }),
          signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Critical Supabase client failure' } }),
          signUp: () => Promise.resolve({ data: null, error: { message: 'Critical Supabase client failure' } }),
          exchangeCodeForSession: () => Promise.resolve({ data: null, error: { message: 'Critical Supabase client failure' } }),
        },
        from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Critical Supabase client failure' } }) }) }),
      } as any;
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

