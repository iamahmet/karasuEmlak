import { z } from 'zod';

/**
 * Environment variables schema with Zod validation
 * This ensures type safety and runtime validation for all environment variables
 */
const envSchema = z.object({
  // Site Configuration
  NEXT_PUBLIC_SITE_URL: z.string().url(),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),

  // Supabase Database (Direct PostgreSQL Connection)
  SUPABASE_DB_HOST: z.string().min(1),
  SUPABASE_DB_PORT: z.coerce.number().int().positive(),
  SUPABASE_DB_NAME: z.string().min(1),
  SUPABASE_DB_USER: z.string().min(1),
  SUPABASE_DB_PASSWORD: z.string().min(1),

  // AI Services (Optional)
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  
  // Image Search APIs (Optional)
  UNSPLASH_ACCESS_KEY: z.string().optional(),
  PEXELS_API_KEY: z.string().optional(),
  PIXABAY_API_KEY: z.string().optional(),
  GOOGLE_CUSTOM_SEARCH_API_KEY: z.string().optional(),
  GOOGLE_CUSTOM_SEARCH_ENGINE_ID: z.string().optional(),

  // External API Services (Optional)
  OPENWEATHER_API_KEY: z.string().optional(),
  OPENCAGE_API_KEY: z.string().optional(),
  NEWSAPI_KEY: z.string().optional(),
  NUMVERIFY_API_KEY: z.string().optional(),
  
  // SEO Research MCP (Optional - Deprecated, using free Google APIs instead)
  CAPSOLVER_API_KEY: z.string().optional(),
  
  // Google Search Console (Optional - Free, for backlinks analysis)
  GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL: z.string().email().optional(),
  GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY: z.string().optional(),
  
  // GitHub MCP Server (Optional)
  GITHUB_PERSONAL_ACCESS_TOKEN: z.string().optional(),

  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

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
  CRON_SECRET: z.string().optional(),
  REVALIDATE_SECRET: z.string().optional(),
});

/**
 * Validated environment variables
 * Throws error if validation fails
 */
export function validateEnv() {
  return envSchema.parse(process.env);
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
      
      if (isDevelopment) {
        console.warn('⚠️  Environment variables validation failed (development mode):');
        error.errors.forEach((err) => {
          console.warn(`  - ${err.path.join('.')}: ${err.message}`);
        });
        console.warn('⚠️  Continuing with partial environment variables...');
        // Return partial env with defaults for development
        return process.env as unknown as Env;
      } else {
        console.error('❌ Environment variables validation failed:');
        error.errors.forEach((err) => {
          console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
        throw new Error('Invalid environment variables. Please check your .env.local file.');
      }
    }
    throw error;
  }
}

