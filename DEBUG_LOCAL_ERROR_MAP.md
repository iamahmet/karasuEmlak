# DEBUG_LOCAL_ERROR_MAP.md

Generated: 2026-01-27T11:55:17.429Z
Base URL: http://localhost:3000

## Summary

- Total endpoints tested: 17
- ✅ Passed: 17
- ❌ Failed: 0
- 🔴 500 Errors: 0
- 🔴 JSON Parse Errors: 0

## 📋 All Test Results

| Endpoint | Status | Content-Type | JSON OK | Error |
|----------|--------|---------------|---------|-------|
| `api/health` | 200 | application/json | ✅ | - |
| `api/listings` | 200 | application/json | ✅ | - |
| `api/articles` | 200 | application/json | ✅ | - |
| `api/news` | 200 | application/json | ✅ | - |
| `api/faq` | 200 | application/json | ✅ | - |
| `api/neighborhoods` | 200 | application/json | ✅ | - |
| `api/stats/listings` | 200 | application/json | ✅ | - |
| `homepage` | 200 | text/html; charset=utf-8 | - | - |
| `kiralik` | 200 | text/html; charset=utf-8 | - | - |
| `satilik` | 200 | text/html; charset=utf-8 | - | - |
| `sapanca` | 200 | text/html; charset=utf-8 | - | - |
| `kocaali` | 200 | text/html; charset=utf-8 | - | - |
| `blog` | 200 | text/html; charset=utf-8 | - | - |
| `haberler` | 200 | text/html; charset=utf-8 | - | - |
| `yazarlar` | 200 | text/html; charset=utf-8 | - | - |
| `robots.txt` | 200 | text/plain | - | - |
| `sitemap.xml` | 200 | application/xml | - | - |

## 🔍 Root Cause Analysis


## 🔧 Next Steps

1. Fix all 500 errors above
2. Check server console for full stack traces
3. Run ENV doctor: `pnpm tsx scripts/check-env.ts`
4. Verify Supabase connection and tables
5. Re-run this script to verify fixes
