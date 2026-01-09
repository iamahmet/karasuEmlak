/**
 * @karasu/lib
 * Shared utility libraries
 */

// Supabase clients
export * from './supabase/client';
// Supabase service - Server-side only
// Import directly: import { createServiceClient } from '@karasu/lib/supabase/service'
// Note: Service client exports are not included here to prevent client-side bundling

// Cloudinary - Server-side only
// Note: Cloudinary exports are not included here to prevent client-side bundling
// Import directly: import { getCloudinaryClient } from '@karasu/lib/cloudinary/client'

// i18n utilities
export * from './i18n';

// Utils
export * from './utils';

// Audit logging - Server-side only
// Import directly: import { logAuditEvent } from '@karasu/lib/audit'
// Note: Audit exports are not included here to prevent client-side bundling

// Error handling - Server-side only
// Import directly: import { handleApiError } from '@karasu/lib/errors/handler'
// Note: Error handler exports are not included here to prevent client-side bundling

// Content publishing - Server-side only
// Import directly: import { publishContent } from '@karasu/lib/content/publishing'
// Note: Content publishing exports are not included here to prevent client-side bundling

// Content quality gate - Server-side only
// Import directly: import { checkContentQuality } from '@karasu/lib/content/quality-gate'
// Note: Content quality gate exports are not included here to prevent client-side bundling

// OpenAI integration - Server-side only
// Import directly: import { generateContent } from '@karasu/lib/openai'
// Note: OpenAI exports are not included here to prevent client-side bundling

// SEO metadata - Server-side only
// Import directly: import { generateMetadata } from '@karasu/lib/seo/metadata'
// Note: SEO metadata exports are not included here to prevent client-side bundling

// Email service - Server-side only
// Import directly: import { sendEmail } from '@karasu/lib/email'
// Note: Email exports are not included here to prevent client-side bundling

