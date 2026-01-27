import { z } from 'zod';

/**
 * Environment variables schema with Zod validation
 * This ensures type safety and runtime validation for all environment variables
 */
/**
 * Trim and validate string env var
 */
function trimString(key: string) {
  return z.string()
    .transform((val) => val?.trim() || '')
    .refine((val) => val.length > 0, { message: `${key} is required` });
}

function trimOptionalString() {
  return z.string()
    .optional()
    .transform((val) => val?.trim() || undefined);
}

const envSchema = z.object({
  // Site Configuration (Optional)
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().transform((val) => val?.trim() || undefined).or(z.literal('').transform(() => undefined)).or(z.undefined()),

  // Supabase Configuration (Required - but with fallback)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().transform((val) => val?.trim()).or(z.string().min(1).transform((val) => val?.trim())),
  SUPABASE_URL: z.string().url().optional().transform((val) => val?.trim() || undefined).or(z.undefined()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).transform((val) => val?.trim()),
  SUPABASE_ANON_KEY: trimOptionalString(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).transform((val) => val?.trim()),
  SUPABASE_JWT_SECRET: trimOptionalString(),

  // Supabase Database (Optional - only needed for direct DB access)
  SUPABASE_DB_HOST: trimOptionalString(),
  SUPABASE_DB_PORT: z.coerce.number().int().positive().optional().or(z.undefined()),
  SUPABASE_DB_NAME: trimOptionalString(),
  SUPABASE_DB_USER: trimOptionalString(),
  SUPABASE_DB_PASSWORD: trimOptionalString(),

  // AI Services (Optional)
  OPENAI_API_KEY: trimOptionalString(),
  GEMINI_API_KEY: trimOptionalString(),
  
  // Image Search APIs (Optional)
  UNSPLASH_ACCESS_KEY: trimOptionalString(),
  PEXELS_API_KEY: trimOptionalString(),
  PIXABAY_API_KEY: trimOptionalString(),
  GOOGLE_CUSTOM_SEARCH_API_KEY: trimOptionalString(),
  GOOGLE_CUSTOM_SEARCH_ENGINE_ID: trimOptionalString(),

  // External API Services (Optional)
  OPENWEATHER_API_KEY: trimOptionalString(),
  OPENCAGE_API_KEY: trimOptionalString(),
  NEWSAPI_KEY: trimOptionalString(),
  NUMVERIFY_API_KEY: trimOptionalString(),
  
  // SEO Research MCP (Optional - Deprecated, using free Google APIs instead)
  CAPSOLVER_API_KEY: trimOptionalString(),
  
  // Google Search Console (Optional - Free, for backlinks analysis)
  GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL: z.string().email().optional().transform((val) => val?.trim() || undefined).or(z.undefined()),
  GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY: trimOptionalString(),
  
  // GitHub MCP Server (Optional)
  GITHUB_PERSONAL_ACCESS_TOKEN: trimOptionalString(),

  // Cloudinary Configuration (Optional - only needed for image uploads)
  CLOUDINARY_CLOUD_NAME: trimOptionalString(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: trimOptionalString(),
  CLOUDINARY_API_KEY: trimOptionalString(),
  CLOUDINARY_API_SECRET: trimOptionalString(),

  // Google Services (Optional)
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  GOOGLE_SITE_VERIFICATION: z.string().optional(),

  // Analytics & Monitoring (Optional)
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_CLARITY_ID: z.string().optional(),

  // Search Engine Verification (Optional)
  NEXT_PUBLIC_BING_VERIFICATION: z.string().optional(),
  NEXT_PUBLIC_YANDEX_VERIFICATION: z.string().optional(),

  // Caching (Optional)
  REDIS_URL: z.string().url().optional(),

  // Error Tracking (Optional)
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Email Service (Optional)
  RESEND_API_KEY: z.string().optional(),
  RESEND_REPLY_TO: z.string().email().optional(),

  // Cron Jobs (Optional)
  // CRON_SECRET: Must be trimmed and at least 16 chars if provided
  // Vercel requires no leading/trailing whitespace in HTTP headers
  CRON_SECRET: z.string()
    .optional()
    .transform((val) => val?.trim() || undefined)
    .refine(
      (val) => !val || val.length >= 16,
      { message: "CRON_SECRET must be at least 16 characters if provided" }
    ),
  REVALIDATE_SECRET: z.string()
    .optional()
    .transform((val) => val?.trim() || undefined),
});

/**
 * Pre-process environment variables: trim all string values
 * This prevents whitespace issues that cause build failures
 */
function preprocessEnv(): Record<string, string | undefined> {
  const processed: Record<string, string | undefined> = {};
  
  for (const key in process.env) {
    const value = process.env[key];
    if (typeof value === 'string') {
      // Trim all env vars to prevent whitespace issues
      processed[key] = value.trim();
    } else {
      processed[key] = value;
    }
  }
  
  return processed;
}

/**
 * Validated environment variables
 * Throws error if validation fails
 */
export function validateEnv() {
  const processed = preprocessEnv();
  return envSchema.parse(processed);
}

/**
 * Type-safe environment variables
 * Use this instead of process.env directly
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Client-side environment variables schema (only NEXT_PUBLIC_* vars)
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_CLARITY_ID: z.string().optional(),
  NEXT_PUBLIC_BING_VERIFICATION: z.string().optional(),
  NEXT_PUBLIC_YANDEX_VERIFICATION: z.string().optional(),
  NEXT_PUBLIC_WEB_APP_URL: z.string().url().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Get client-side environment variables (only NEXT_PUBLIC_* vars)
 * Use this in client components
 */
export function getClientEnv(): ClientEnv {
  try {
    return clientEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        console.warn('⚠️  Client environment variables validation failed (development mode):');
        error.errors.forEach((err) => {
          console.warn(`  - ${err.path.join('.')}: ${err.message}`);
        });
        // Return partial env with defaults for development
        return process.env as unknown as ClientEnv;
      } else {
        console.error('❌ Client environment variables validation failed:');
        error.errors.forEach((err) => {
          console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
        throw new Error('Invalid client environment variables. Please check your .env.local file.');
      }
    }
    throw error;
  }
}

/**
 * Get environment variable with type safety
 * Returns undefined if not set (for optional vars)
 * In development, logs warnings instead of throwing errors
 * Use this for server-side code only
 */
export function getEnv(): Env {
  try {
    return validateEnv();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // Filter out optional field errors (they're not critical)
      const criticalErrors = error.errors.filter((err) => {
        const path = err.path.join('.');
        // These are truly required
        return path === 'NEXT_PUBLIC_SUPABASE_URL' || 
               path === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' || 
               path === 'SUPABASE_SERVICE_ROLE_KEY';
      });
      
      if (isDevelopment) {
        if (criticalErrors.length > 0) {
          console.warn('⚠️  Critical environment variables missing (development mode):');
          criticalErrors.forEach((err) => {
            console.warn(`  - ${err.path.join('.')}: ${err.message}`);
          });
        } else {
          console.warn('⚠️  Some optional environment variables validation failed (development mode):');
          error.errors.slice(0, 5).forEach((err) => {
            console.warn(`  - ${err.path.join('.')}: ${err.message}`);
          });
        }
        console.warn('⚠️  Continuing with partial environment variables...');
        // Return partial env with defaults for development
        return process.env as unknown as Env;
      } else {
        if (criticalErrors.length > 0) {
          console.error('❌ Critical environment variables validation failed:');
          criticalErrors.forEach((err) => {
            console.error(`  - ${err.path.join('.')}: ${err.message}`);
          });
          throw new Error('Invalid environment variables. Please check your .env.local file.');
        } else {
          // Only optional vars failed, continue
          console.warn('⚠️  Some optional environment variables validation failed (production):');
          error.errors.slice(0, 5).forEach((err) => {
            console.warn(`  - ${err.path.join('.')}: ${err.message}`);
          });
          return process.env as unknown as Env;
        }
      }
    }
    throw error;
  }
}

