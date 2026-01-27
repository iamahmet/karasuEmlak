import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for browser (client-side)
 * Uses anon key - safe for client-side usage
 * 
 * Always returns a valid client instance. If env vars are missing,
 * returns a client with placeholder values (API calls will fail gracefully).
 */
// Create a safe fallback client that's always returned
function createFallbackClient() {
  const fallback = {
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
  
  // Ensure fallback always has auth
  if (!fallback.auth) {
    console.error('CRITICAL: Fallback client missing auth - this should never happen');
  }
  
  return fallback;
}

export function createClient() {
  // Only create client on client-side
  if (typeof window === 'undefined') {
    // Return a mock client for SSR that won't cause errors
    // This should never be used, but prevents SSR errors
    return createFallbackClient();
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
  // Wrap everything in try-catch to ensure we always return a valid client
  let client: any;
  try {
    // createSupabaseBrowserClient should always return a valid client instance
    // But we'll verify it anyway
    client = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error: any) {
    console.error('Error calling createSupabaseBrowserClient:', error?.message || error);
    return createFallbackClient();
  }
  
  // Critical: Verify client exists and has auth property
  if (!client) {
    console.error('CRITICAL: createSupabaseBrowserClient returned null/undefined');
    return createFallbackClient();
  }
  
  if (!client.auth) {
    console.error('CRITICAL: Supabase client missing auth property');
    return createFallbackClient();
  }
  
  // Additional safety check: verify auth has required methods
  if (typeof client.auth.getUser !== 'function') {
    console.error('CRITICAL: Supabase client.auth.getUser is not a function');
    return createFallbackClient();
  }
  
  // Final verification: ensure client is not null/undefined
  if (client === null || client === undefined) {
    console.error('CRITICAL: Client is null/undefined after all checks');
    return createFallbackClient();
  }
  
  return client;
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

