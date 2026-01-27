## Feature Flag Bisection Matrix

All runs executed after instrumentation + safe parsing fixes.

| Flags | Result | Notes |
| --- | --- | --- |
| (none) | ✅ Pass (18/18) | No crash |
| NEXT_PUBLIC_DISABLE_ANALYTICS=1 | ✅ Pass (18/18) | No crash |
| NEXT_PUBLIC_DISABLE_PWA=1 | ✅ Pass (18/18) | No crash |
| NEXT_PUBLIC_DISABLE_SEO_TOOLS=1 | ✅ Pass (18/18) | No crash |

## Conclusion

Crash no longer reproduces under any feature flag combination. The global failure is resolved by:

- Removing unsafe JSON parsing in analytics + cookie consent modules
- Guarding API response parsing in `api-client.ts`
- Making `/api/analytics/web-vitals` JSON-safe with `req.json()` and content-type validation
- Gating analytics/PWA/SEO imports to avoid module-scope side effects
- Enabling server-side fatal handlers and source maps
