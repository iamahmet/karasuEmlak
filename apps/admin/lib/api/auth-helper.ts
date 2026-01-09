/**
 * Auth Helper for Admin API Routes
 * Provides consistent auth checking with development mode support
 */

import { NextRequest } from "next/server";
import { requireStaff, checkStaff } from "@/lib/auth/server";
import { createErrorResponse, getRequestId } from "./error-handler";

/**
 * Auth check result
 */
export interface AuthResult {
  user: { id: string; email?: string };
  isAuthenticated: true;
}

export interface AuthError {
  isAuthenticated: false;
  response: Response;
}

export type AuthCheckResult = AuthResult | AuthError;

/**
 * Check if user is authenticated and has staff/admin role
 * In development mode, allows access even without roles
 * 
 * @param request - NextRequest object
 * @returns AuthResult if authenticated, AuthError if not
 */
export async function requireAuth(request: NextRequest): Promise<AuthCheckResult> {
  const requestId = getRequestId(request);
  const isDevelopment = process.env.NODE_ENV === "development";

  try {
    // In development, try to get user but don't enforce roles
    if (isDevelopment) {
      const user = await checkStaff();
      if (user) {
        return {
          user,
          isAuthenticated: true,
        };
      }
      // In development, if no user found, allow with warning
      console.warn(`[${requestId}] ⚠️  No authenticated user in development mode, allowing access`);
      return {
        user: { id: "dev-user", email: "dev@example.com" },
        isAuthenticated: true,
      };
    }

    // In production, enforce staff role
    const user = await requireStaff();
    return {
      user,
      isAuthenticated: true,
    };
  } catch (error: any) {
    const message = error.message || "Unauthorized";
    const statusCode = message.includes("Unauthorized") ? 401 : 403;

    return {
      isAuthenticated: false,
      response: createErrorResponse(
        requestId,
        statusCode === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
        message,
        undefined,
        statusCode
      ),
    };
  }
}

/**
 * Optional auth check - returns user if authenticated, null otherwise
 * Never throws, useful for optional features
 */
export async function optionalAuth(request: NextRequest): Promise<{ id: string; email?: string } | null> {
  try {
    const result = await requireAuth(request);
    if (result.isAuthenticated) {
      return result.user;
    }
    return null;
  } catch {
    return null;
  }
}
