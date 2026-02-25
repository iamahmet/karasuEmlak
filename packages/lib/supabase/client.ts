import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for browser (client-side)
 * Uses @supabase/ssr for PKCE flow support (code verifier stored in cookies)
 * 
 * Always returns a valid client instance. If env vars are missing,
 * returns a fallback client that fails gracefully.
 */

// Singleton instance to prevent multiple client creations
let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null;

// Create a safe fallback client that's always returned when configuration fails
function createFallbackClient() {
  const noopPromise = (errorMsg: string) => Promise.resolve({ 
    data: null, 
    error: { message: errorMsg, name: 'ConfigurationError' } 
  });
  
  const fallback = {
    auth: {
      getUser: () => noopPromise('Supabase not configured'),
      getSession: () => noopPromise('Supabase not configured'),
      signOut: () => noopPromise('Supabase not configured'),
      signInWithOtp: () => noopPromise('Supabase not configured'),
      signInWithPassword: () => noopPromise('Supabase not configured'),
      signUp: () => noopPromise('Supabase not configured'),
      exchangeCodeForSession: () => noopPromise('Supabase not configured'),
      resetPasswordForEmail: () => noopPromise('Supabase not configured'),
      updateUser: () => noopPromise('Supabase not configured'),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => noopPromise('Supabase not configured'),
        single: () => noopPromise('Supabase not configured'),
        order: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        limit: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      }),
      insert: () => noopPromise('Supabase not configured'),
      update: () => ({ eq: () => noopPromise('Supabase not configured') }),
      delete: () => ({ eq: () => noopPromise('Supabase not configured') }),
      upsert: () => noopPromise('Supabase not configured'),
    }),
    storage: {
      from: (bucket: string) => ({
        upload: () => noopPromise('Supabase not configured'),
        download: () => noopPromise('Supabase not configured'),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        list: () => noopPromise('Supabase not configured'),
        remove: () => noopPromise('Supabase not configured'),
      }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    removeChannel: () => Promise.resolve('ok'),
  } as any;
  
  return fallback;
}

export function createClient() {
  try {
    // Only create client on client-side
    if (typeof window === 'undefined') {
      return createFallbackClient();
    }

    // Return cached client if it exists and is valid
    if (browserClient && typeof browserClient.auth === 'object') {
      return browserClient;
    }
    if (browserClient && !browserClient.auth) {
      browserClient = null;
    }

    // Read environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If env vars are missing, return fallback client
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        '⚠️ Supabase environment variables are missing!\n' +
        'Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
        'Please add them in Vercel Dashboard → Settings → Environment Variables'
      );
      return createFallbackClient();
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch {
      console.error('CRITICAL: Invalid NEXT_PUBLIC_SUPABASE_URL format');
      return createFallbackClient();
    }

    // Create the client using @supabase/ssr for PKCE support
    browserClient = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
    
    // Verify client was created successfully with comprehensive checks
    if (!browserClient || typeof browserClient?.auth !== 'object') {
      console.error('CRITICAL: Supabase client invalid or missing auth');
      browserClient = null;
      return createFallbackClient();
    }
    
    return browserClient;
  } catch (error: unknown) {
    console.error('Error creating Supabase client:', error instanceof Error ? error.message : error);
    browserClient = null;
    return createFallbackClient();
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

