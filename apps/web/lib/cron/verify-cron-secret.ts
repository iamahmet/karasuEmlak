import { NextRequest } from "next/server";

/**
 * Verifies Vercel Cron Job Authorization
 * 
 * Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` header
 * when invoking cron jobs defined in vercel.json
 * 
 * @param request - Next.js request object
 * @returns true if authorized, false otherwise
 */
export function verifyCronSecret(request: NextRequest): boolean {
  // In development, allow all requests (for local testing)
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // Get CRON_SECRET from environment
  const expectedSecret = process.env.CRON_SECRET?.trim();
  
  // If no secret is set in production, reject (security)
  if (!expectedSecret || expectedSecret.length < 16) {
    console.error("CRON_SECRET is not set or too short in production");
    return false;
  }

  // Vercel sends Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get("authorization");
  
  // Also support x-cron-secret header for manual testing
  const cronSecretHeader = request.headers.get("x-cron-secret");
  
  // Check Authorization header (Vercel's default)
  if (authHeader) {
    const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (bearerToken === expectedSecret) {
      return true;
    }
  }
  
  // Check x-cron-secret header (for manual testing)
  if (cronSecretHeader && cronSecretHeader.trim() === expectedSecret) {
    return true;
  }

  return false;
}
