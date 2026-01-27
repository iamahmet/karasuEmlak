import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client for browser (client-side)
 * Uses @supabase/supabase-js directly instead of @supabase/ssr
 * to avoid internal singleton/hook issues that cause "Cannot destructure property 'auth'" errors
 * 
 * Always returns a valid client instance. If env vars are missing,
 * returns a fallback client that fails gracefully.
 */

// Singleton instance to prevent multiple client creations
let browserClient: ReturnType<typeof createSupabaseClient> | null = null;

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
  // Only create client on client-side
  if (typeof window === 'undefined') {
    // Return a mock client for SSR that won't cause errors
    return createFallbackClient();
  }

  // Return cached client if it exists and is valid
  if (browserClient) {
    return browserClient;
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

  // Create the client using @supabase/supabase-js directly
  try {
    browserClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
    
    // Verify client was created successfully
    if (!browserClient || !browserClient.auth) {
      console.error('CRITICAL: createSupabaseClient returned invalid client');
      browserClient = null;
      return createFallbackClient();
    }
    
    return browserClient;
  } catch (error: any) {
    console.error('Error creating Supabase client:', error?.message || error);
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

