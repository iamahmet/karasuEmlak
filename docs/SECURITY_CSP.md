# Content Security Policy (CSP) Implementation

**Last Updated:** 2026-01-06  
**Status:** ✅ Production-ready with nonce support

---

## 📋 Overview

This project implements a **nonce-based Content Security Policy (CSP)** for enhanced security. CSP is set in `middleware.ts` to ensure consistent application across all routes.

**Key Features:**
- ✅ Per-request nonce generation (cryptographically secure)
- ✅ Nonce propagation to React components
- ✅ Strict production policy (no unsafe-inline for scripts)
- ✅ Development relaxations (unsafe-eval for HMR)
- ✅ Comprehensive domain whitelist (Supabase, Sentry, GA4, Cloudinary, Vercel)

---

## 🏗️ Architecture

### Single Source of Truth
- **Location:** `apps/web/proxy.ts` (CSP header generation)
- **Utility:** `apps/web/lib/security/csp.ts` (CSP builder)
- **Nonce Access:** `apps/web/lib/security/nonce.ts` (server component helper)
- **Removed from:** `next.config.mjs` (to avoid conflicts)

### Why Middleware?
1. **Runtime Control:** Nonce generation per-request
2. **Consistency:** All routes get the same CSP
3. **Flexibility:** Easy to adjust based on environment
4. **No Conflicts:** Avoids Next.js config header conflicts

---

## 🔧 Implementation

### CSP Builder (`lib/security/csp.ts`)

```typescript
import { buildCSP, generateNonce } from '@/lib/security/csp';

// Generate nonce
const nonce = generateNonce();

// Build CSP with nonce
const csp = buildCSP({
  nonce,
  isDev: process.env.NODE_ENV === 'development',
});
```

### Middleware Integration

```typescript
// apps/web/proxy.ts
import { buildCSP, generateNonce } from './lib/security/csp';

export default function middleware(request: NextRequest) {
  const nonce = generateNonce();
  
  // Set nonce in request header for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  
  // Run intl middleware
  const response = intlMiddleware(requestWithNonce);
  
  // Build and set CSP
  const csp = buildCSP({ nonce, isDev: process.env.NODE_ENV === 'development' });
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}
```

### Nonce Access in Server Components

```typescript
// In server component
import { getNonce } from '@/lib/security/nonce';

export default async function MyPage() {
  const nonce = await getNonce();
  
  return (
    <Script nonce={nonce || undefined} dangerouslySetInnerHTML={{...}} />
  );
}
```

### Nonce Propagation to Client Components

```typescript
// Server component (layout.tsx)
const nonce = await getNonce();

// Pass to client component
<GoogleAnalytics nonce={nonce || undefined} />

// Client component
export function GoogleAnalytics({ nonce }: { nonce?: string }) {
  return (
    <Script nonce={nonce} dangerouslySetInnerHTML={{...}} />
  );
}
```

---

## 📋 CSP Directives

### Production (Strict)
```
default-src 'self'
script-src 'self' 'nonce-{nonce}' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://*.gstatic.com https://maps.googleapis.com https://*.googleapis.com https://browser.sentry-cdn.com https://*.sentry.io https://res.cloudinary.com
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
img-src 'self' data: https: blob:
font-src 'self' data: https://fonts.gstatic.com
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.sentry.io https://api.cloudinary.com https://res.cloudinary.com https://vitals.vercel-insights.com https://*.vercel.app
frame-src 'self' https://www.google.com
object-src 'none'
base-uri 'self'
form-action 'self'
worker-src 'self' blob:
manifest-src 'self'
frame-ancestors 'self'
upgrade-insecure-requests
```

### Development (Relaxed for HMR)
- Adds `'unsafe-eval'` to `script-src` for Next.js HMR
- Adds `http://localhost:*` and `ws://localhost:*` to `connect-src`
- Removes `upgrade-insecure-requests`

---

## ✅ Security Features

1. **Nonce-based Scripts:** All inline scripts use nonce
2. **No Wildcards:** No `*` in any directive (except required patterns like `*.supabase.co`)
3. **Strict Defaults:** `default-src 'self'` as base
4. **Object Blocked:** `object-src 'none'` prevents plugins
5. **HTTPS Upgrade:** Production forces HTTPS
6. **No unsafe-inline in Production:** Scripts must use nonce

---

## 🔍 Allowed Domains

### Script Sources
- `'self'` - Same origin
- `'nonce-{nonce}'` - Inline scripts with nonce
- Google services (GTM, GA4, Maps, gstatic)
- Sentry CDN
- Cloudinary

### Connect Sources
- `'self'` - Same origin
- Supabase (`*.supabase.co`, `wss://*.supabase.co`)
- Google Analytics (`*.google-analytics.com`, `*.analytics.google.com`)
- Sentry (`*.sentry.io`)
- Cloudinary (`api.cloudinary.com`, `res.cloudinary.com`)
- Vercel Analytics (`vitals.vercel-insights.com`, `*.vercel.app`)
- Development: `localhost:*`, `127.0.0.1:*` (HTTP/WS)

---

## 🧪 Testing

### Manual Check
```bash
# Check CSP header
curl -I http://localhost:3000/sss | grep -i "content-security-policy"

# Use CSP Doctor script
pnpm security:csp:check
```

### Debug Endpoint (Dev Only)
```bash
# Get CSP debug info
curl http://localhost:3000/api/debug/csp

# Returns:
# {
#   "nonce": "...",
#   "cspHeader": "...",
#   "computedCSP": "...",
#   "allowedConnectDomains": [...],
#   "directives": {
#     "scriptSrc": "Has nonce",
#     "connectSrc": 15,
#     "isDev": true
#   }
# }
```

### Validation Checklist
- [ ] No CSP violations in browser console
- [ ] Nonce present in script-src
- [ ] All Script components have nonce prop
- [ ] Connect-src includes all required domains
- [ ] Production: no unsafe-inline in script-src
- [ ] Development: unsafe-eval allowed for HMR

---

## 🚨 Troubleshooting

### CSP Violations in Console

#### 1. Inline Script Blocked
**Error:** `"Executing inline script violates CSP ... nonce required"`

**Solution:**
- Ensure nonce is passed to `<Script>` component
- Check that nonce is generated in middleware
- Verify nonce is accessible in server components via `getNonce()`

**Example Fix:**
```typescript
// ❌ Wrong
<Script dangerouslySetInnerHTML={{...}} />

// ✅ Correct
const nonce = await getNonce();
<Script nonce={nonce || undefined} dangerouslySetInnerHTML={{...}} />
```

#### 2. Connect-src Blocked
**Error:** `"Connecting to '<URL>' violates connect-src directive"`

**Solution:**
- Add domain to `connectSources` array in `lib/security/csp.ts`
- Check if domain is in development-only list (add to production if needed)
- Verify domain pattern matches (wildcards vs exact domains)

**Example Fix:**
```typescript
// Add to connectSources in buildCSP()
'https://new-domain.com',
'https://*.new-domain.com', // For subdomains
```

#### 3. Script from External Domain Blocked
**Error:** Script from external domain blocked

**Solution:**
- Add domain to `scriptSources` in `lib/security/csp.ts`
- Use `<Script src="..." />` from `next/script` (not raw `<script>` tag)
- Ensure domain is HTTPS

### Common Issues

**Issue:** CSP header not found
- **Fix:** Ensure middleware.ts is properly configured
- **Check:** `next.config.mjs` should NOT have CSP in headers()

**Issue:** Nonce not accessible in components
- **Fix:** Use `getNonce()` from `@/lib/security/nonce` in server components
- **Check:** Nonce is set in request headers in middleware

**Issue:** Styles blocked
- **Fix:** Currently using `'unsafe-inline'` for styles (Tailwind requirement)
- **Future:** Migrate to nonce-based styles if feasible

**Issue:** Next.js internal scripts blocked
- **Fix:** `'self'` in script-src allows Next.js scripts
- **Check:** Ensure `'self'` is first in script-src list

---

## 📚 Components Using Nonce

### Server Components
- `StructuredData` - JSON-LD schema scripts
- `layout.tsx` - Passes nonce to client components

### Client Components (Receive nonce as prop)
- `GoogleAnalytics` - GA4 initialization scripts
- `GoogleMapsLoader` - Google Maps API scripts

### Pattern
```typescript
// Server component
const nonce = await getNonce();
<ClientComponent nonce={nonce || undefined} />

// Client component
interface Props {
  nonce?: string;
}
export function ClientComponent({ nonce }: Props) {
  return <Script nonce={nonce} ... />;
}
```

---

## 🔄 Migration Guide

### Adding New Inline Scripts

1. **Server Component:**
   ```typescript
   import { getNonce } from '@/lib/security/nonce';
   
   const nonce = await getNonce();
   <Script nonce={nonce || undefined} dangerouslySetInnerHTML={{...}} />
   ```

2. **Client Component:**
   ```typescript
   // Accept nonce as prop
   interface Props {
     nonce?: string;
   }
   
   export function MyComponent({ nonce }: Props) {
     return <Script nonce={nonce} ... />;
   }
   ```

### Adding New External Domains

1. **For Scripts:**
   ```typescript
   // In lib/security/csp.ts
   const scriptSources = [
     // ... existing sources
     'https://new-domain.com',
   ];
   ```

2. **For Connections:**
   ```typescript
   // In lib/security/csp.ts
   const connectSources = [
     // ... existing sources
     'https://api.new-domain.com',
   ];
   ```

---

## 📚 References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js: Script Component](https://nextjs.org/docs/app/api-reference/components/script)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Sentry CSP Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/security-policy/)

---

## ✅ Status

- ✅ CSP implemented in middleware
- ✅ Nonce generation per-request
- ✅ Nonce propagation to components
- ✅ All Script components use nonce
- ✅ Comprehensive domain whitelist
- ✅ Dev/prod differences handled
- ✅ Debug endpoint available
- ✅ CSP check script available
- ✅ Zero CSP violations (production-ready)

**Production-ready:** ✅
