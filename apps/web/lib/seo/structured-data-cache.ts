/**
 * Structured Data Cache
 * 
 * Caches lightweight schema generation to avoid repeated computation
 * in locale layout (which runs on every request)
 */

import { generateOrganizationSchema } from './structured-data';

// Cache schema (it's static anyway)
let cachedSchema: ReturnType<typeof generateOrganizationSchema> | null = null;

/**
 * Get organization schema (cached)
 * This is safe to cache because organization data is static
 */
export function getCachedOrganizationSchema() {
  if (!cachedSchema) {
    cachedSchema = generateOrganizationSchema(undefined);
  }
  return cachedSchema;
}

/**
 * Clear schema cache (useful for testing or if config changes)
 */
export function clearSchemaCache() {
  cachedSchema = null;
}

