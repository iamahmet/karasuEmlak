import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

/**
 * User type with id
 */
export interface User {
  id: string;
  email?: string;
  mfaVerified?: boolean;
}

/**
 * Require staff/admin role for server-side operations
 * Throws error if user is not authenticated or not staff/admin
 * 
 * @returns Promise<User> - The authenticated staff/admin user
 * @throws Error if user is not authenticated or not staff/admin
 */
export async function requireStaff(): Promise<User> {
  const cookieStore = await cookies();

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing');
  }

  // Create Supabase client
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  // Check staff role via user_roles table
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id);

  if (rolesError) {
    // In development, if user_roles table doesn't exist, allow access
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  user_roles table not found, allowing access in development mode');
      return {
        id: user.id,
        email: user.email,
      };
    }
    throw new Error('Failed to check user roles');
  }

  const isStaff = roles?.some(
    (ur: any) => ur.roles?.name === 'admin' || ur.roles?.name === 'staff'
  );

  if (!isStaff) {
    // In development, allow access if no roles found
    if (process.env.NODE_ENV === 'development' && (!roles || roles.length === 0)) {
      console.warn('⚠️  No roles found for user, allowing access in development mode');
      return {
        id: user.id,
        email: user.email,
        mfaVerified: true // Dev fallback
      };
    }
    throw new Error('Unauthorized: Staff or admin role required');
  }

  // Check MFA level for staff/admin in production
  let mfaVerified = false;
  if (process.env.NODE_ENV !== 'development' || process.env.ENFORCE_MFA === 'true') {
    const { data: mfa, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (!mfaError && mfa) {
      if (mfa.nextLevel === 'aal2' && mfa.currentLevel !== 'aal2') {
        throw new Error('MFA verification required');
      }
      mfaVerified = mfa.currentLevel === 'aal2';
    }
  } else {
    mfaVerified = true;
  }

  return {
    id: user.id,
    email: user.email,
    mfaVerified,
  };
}

/**
 * Get current authenticated user (without role check)
 * 
 * @returns Promise<User | null> - The authenticated user, or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore cookie setting errors
        }
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}

/**
 * Check if current user is staff/admin (non-throwing version)
 * 
 * @returns Promise<User | null> - The authenticated staff/admin user, or null if not authorized
 */
export async function checkStaff(): Promise<User | null> {
  try {
    return await requireStaff();
  } catch {
    return null;
  }
}

