/**
 * Content Security Policy (CSP) Builder
 * 
 * Generates CSP headers with nonce support for Next.js App Router.
 * Environment-aware: stricter in production, relaxed for dev HMR.
 */

export interface CSPOptions {
  nonce?: string;
  isDev?: boolean;
}

/**
 * Build CSP header value
 */
export function buildCSP(options: CSPOptions = {}): string {
  const { nonce = '', isDev = process.env.NODE_ENV === 'development' } = options;
  
  const directives: string[] = [];

  // Default source
  directives.push("default-src 'self'");

  // Script sources
  // NOTE: In dev mode, don't use nonce because it makes 'unsafe-inline' ignored
  const scriptSources = [
    "'self'",
    ...(!isDev && nonce ? [`'nonce-${nonce}'`] : []),
    // Hash for root layout font loader script (app/layout.tsx)
    "'sha256-qQkJVfk6J5BW+yPPN0N8zNfBqw4NLyb8RtnR7gQ62yg='",
    // Required third-parties
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://www.gstatic.com',
    'https://*.gstatic.com',
    // Google Maps
    'https://maps.googleapis.com',
    'https://*.googleapis.com',
    // Sentry
    'https://browser.sentry-cdn.com',
    'https://*.sentry.io',
    // Cloudinary (if loading scripts)
    'https://res.cloudinary.com',
    // Dev mode: allow unsafe-eval for HMR (React Fast Refresh)
    ...(isDev ? ["'unsafe-eval'"] : []),
    // Next.js internal scripts (script.tsx) need unsafe-inline in dev
    // In production, Next.js scripts should use nonce (handled by Next.js)
    ...(isDev ? ["'unsafe-inline'"] : []),
  ];
  directives.push(`script-src ${scriptSources.join(' ')}`);

  // Style sources
  const styleSources = [
    "'self'",
    'https://fonts.googleapis.com',
    // Leaflet map CSS from unpkg CDN
    'https://unpkg.com',
    // Temporary: unsafe-inline for Tailwind and dynamic styles
    // TODO: Migrate to nonce-based styles if feasible
    "'unsafe-inline'",
  ];
  directives.push(`style-src ${styleSources.join(' ')}`);

  // Image sources
  directives.push("img-src 'self' data: https: blob:");

  // Font sources
  directives.push("font-src 'self' data: https://fonts.gstatic.com");

  // Connect sources (XHR, fetch, WebSocket)
  const connectSources = [
    "'self'",
    // Supabase - exact project domain + wildcard for all services
    'https://lbfimbcvvvbczllhqqlf.supabase.co',
    'https://*.supabase.co',
    'wss://lbfimbcvvvbczllhqqlf.supabase.co',
    'wss://*.supabase.co',
    // Supabase Realtime
    'https://realtime.supabase.co',
    'wss://realtime.supabase.co',
    // Supabase Functions (if used)
    'https://functions.supabase.co',
    // Google Analytics & Tag Manager
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.googletagmanager.com',
    // Google Maps API
    'https://maps.googleapis.com',
    'https://*.googleapis.com',
    'https://maps.gstatic.com',
    'https://*.gstatic.com',
    // Sentry
    'https://*.sentry.io',
    'https://o4507001234567890.ingest.sentry.io',
    // Cloudinary
    'https://api.cloudinary.com',
    'https://res.cloudinary.com',
    // Picsum Photos (placeholder images)
    'https://picsum.photos',
    'https://*.picsum.photos',
    // External news sources
    'https://karasugundem.com',
    'https://*.karasugundem.com',
    // Vercel Analytics (if used)
    'https://vitals.vercel-insights.com',
    'https://*.vercel.app',
    // Development only: HMR and local dev server
    ...(isDev ? [
      'http://localhost:*',
      'ws://localhost:*',
      'http://127.0.0.1:*',
      'ws://127.0.0.1:*',
      'ws://localhost:3000',
      'ws://localhost:3001',
    ] : []),
  ];
  directives.push(`connect-src ${connectSources.join(' ')}`);

  // Frame sources
  directives.push("frame-src 'self' https://www.google.com");

  // Object sources (blocked)
  directives.push("object-src 'none'");

  // Base URI
  directives.push("base-uri 'self'");

  // Form action
  directives.push("form-action 'self'");

  // Worker sources
  directives.push("worker-src 'self' blob:");

  // Manifest source
  directives.push("manifest-src 'self'");

  // Frame ancestors (X-Frame-Options equivalent)
  directives.push("frame-ancestors 'self'");

  // Upgrade insecure requests (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    directives.push("upgrade-insecure-requests");
  }

  const cspString = directives.join('; ');
  
  return cspString;
}

/**
 * Generate a random nonce for CSP
 * Uses Node.js crypto.randomBytes for cryptographically secure nonce
 */
export function generateNonce(): string {
  // Use Web Crypto API (works in both Node.js and Edge runtime)
  if (typeof globalThis.crypto !== 'undefined' && 'getRandomValues' in globalThis.crypto) {
    const array = new Uint8Array(16);
    globalThis.crypto.getRandomValues(array);
    return Buffer.from(array).toString('base64');
  }

  // Fallback: Math.random (not cryptographically secure, but works)
  const randomBytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  return Buffer.from(randomBytes).toString('base64').slice(0, 16);
}

/**
 * Get allowed domains for connect-src (for debugging/documentation)
 */
export function getAllowedConnectDomains(isDev = false): string[] {
  const domains = [
    "'self'",
    // Supabase
    'https://lbfimbcvvvbczllhqqlf.supabase.co',
    'https://*.supabase.co',
    'wss://lbfimbcvvvbczllhqqlf.supabase.co',
    'wss://*.supabase.co',
    'https://realtime.supabase.co',
    'wss://realtime.supabase.co',
    'https://functions.supabase.co',
    // Google Analytics
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.googletagmanager.com',
    // Sentry
    'https://*.sentry.io',
    'https://o4507001234567890.ingest.sentry.io',
    // Cloudinary
    'https://api.cloudinary.com',
    'https://res.cloudinary.com',
    // Vercel
    'https://vitals.vercel-insights.com',
    'https://*.vercel.app',
  ];
  
  if (isDev) {
    domains.push(
      'http://localhost:*',
      'ws://localhost:*',
      'http://127.0.0.1:*',
      'ws://127.0.0.1:*',
      'ws://localhost:3000',
      'ws://localhost:3001'
    );
  }
  
  return domains;
}
