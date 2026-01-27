# DEBUG_LOCAL_ERROR_MAP.md

Generated: 2026-01-27T11:49:32.283Z
Base URL: http://localhost:3000

## Summary

- Total endpoints tested: 17
- ✅ Passed: 0
- ❌ Failed: 17
- 🔴 500 Errors: 17
- 🔴 JSON Parse Errors: 0

## 🔴 500 Server Errors (CRITICAL)

| Endpoint | Status | Error | Stack Trace |
|----------|--------|-------|-------------|
| `api/health` | 0 | fetch failed | - |
| `api/listings` | 0 | fetch failed | - |
| `api/articles` | 0 | fetch failed | - |
| `api/news` | 0 | fetch failed | - |
| `api/faq` | 0 | fetch failed | - |
| `api/neighborhoods` | 0 | fetch failed | - |
| `api/stats/listings` | 0 | fetch failed | - |
| `homepage` | 0 | fetch failed | - |
| `kiralik` | 0 | fetch failed | - |
| `satilik` | 0 | fetch failed | - |
| `sapanca` | 0 | fetch failed | - |
| `kocaali` | 0 | fetch failed | - |
| `blog` | 0 | fetch failed | - |
| `haberler` | 0 | fetch failed | - |
| `yazarlar` | 0 | fetch failed | - |
| `robots.txt` | 0 | fetch failed | - |
| `sitemap.xml` | 0 | fetch failed | - |

## ❌ All Errors

| Endpoint | Status | Error |
|----------|--------|-------|
| `api/health` | 0 | fetch failed |
| `api/listings` | 0 | fetch failed |
| `api/articles` | 0 | fetch failed |
| `api/news` | 0 | fetch failed |
| `api/faq` | 0 | fetch failed |
| `api/neighborhoods` | 0 | fetch failed |
| `api/stats/listings` | 0 | fetch failed |
| `homepage` | 0 | fetch failed |
| `kiralik` | 0 | fetch failed |
| `satilik` | 0 | fetch failed |
| `sapanca` | 0 | fetch failed |
| `kocaali` | 0 | fetch failed |
| `blog` | 0 | fetch failed |
| `haberler` | 0 | fetch failed |
| `yazarlar` | 0 | fetch failed |
| `robots.txt` | 0 | fetch failed |
| `sitemap.xml` | 0 | fetch failed |

## 📋 All Test Results

| Endpoint | Status | Content-Type | JSON OK | Error |
|----------|--------|---------------|---------|-------|
| `api/health` | 0 |  | - | fetch failed |
| `api/listings` | 0 |  | - | fetch failed |
| `api/articles` | 0 |  | - | fetch failed |
| `api/news` | 0 |  | - | fetch failed |
| `api/faq` | 0 |  | - | fetch failed |
| `api/neighborhoods` | 0 |  | - | fetch failed |
| `api/stats/listings` | 0 |  | - | fetch failed |
| `homepage` | 0 |  | - | fetch failed |
| `kiralik` | 0 |  | - | fetch failed |
| `satilik` | 0 |  | - | fetch failed |
| `sapanca` | 0 |  | - | fetch failed |
| `kocaali` | 0 |  | - | fetch failed |
| `blog` | 0 |  | - | fetch failed |
| `haberler` | 0 |  | - | fetch failed |
| `yazarlar` | 0 |  | - | fetch failed |
| `robots.txt` | 0 |  | - | fetch failed |
| `sitemap.xml` | 0 |  | - | fetch failed |

## 🔍 Root Cause Analysis

### 500 Errors - Possible Causes:

1. **Missing Environment Variables**
   - Check `.env.local` for required vars
   - Run: `pnpm tsx scripts/check-env.ts`

2. **Supabase Connection Issues**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and keys
   - Check PostgREST schema cache: `pnpm supabase:reload-postgrest`

3. **Database Table Missing**
   - Check if tables exist in Supabase Dashboard
   - Apply migrations: `pnpm supabase:migration:up`

4. **Edge/Node Runtime Conflict**
   - Check for `process`, `fs`, `window`, `document` in edge routes
   - Use `NEXT_RUNTIME === "nodejs"` guards

5. **JSON Serialization Error**
   - Date/BigInt/Decimal not serialized
   - Use `toSerializable()` helper


## 🔧 Next Steps

1. Fix all 500 errors above
2. Check server console for full stack traces
3. Run ENV doctor: `pnpm tsx scripts/check-env.ts`
4. Verify Supabase connection and tables
5. Re-run this script to verify fixes
