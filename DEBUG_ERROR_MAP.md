# DEBUG_ERROR_MAP.md

Generated: 2026-01-27T00:26:50.047Z
Base URL: http://localhost:3000

## Summary

- Total endpoints tested: 18
- ✅ Passed: 18
- ❌ Failed: 0
- 🔴 JSON Parse Errors: 0
- ⚠️  Non-JSON Responses: 7

## 📋 All Test Results

| Endpoint | Status | Content-Type | JSON OK | Error |
|----------|--------|---------------|---------|-------|
| `healthz` | 200 | application/json | ✅ | - |
| `api/health` | 200 | application/json | ✅ | - |
| `api/listings` | 200 | application/json | ✅ | - |
| `api/articles` | 200 | application/json | ✅ | - |
| `api/news` | 200 | application/json | ✅ | - |
| `api/neighborhoods` | 200 | application/json | ✅ | - |
| `api/faq` | 200 | application/json | ✅ | - |
| `api/stats/listings` | 200 | application/json | ✅ | - |
| `homepage` | 200 | text/html; charset=utf-8 | - | - |
| `kiralik` | 200 | text/html; charset=utf-8 | - | - |
| `satilik` | 200 | text/html; charset=utf-8 | - | - |
| `blog` | 200 | text/html; charset=utf-8 | - | - |
| `haberler` | 200 | text/html; charset=utf-8 | - | - |
| `sitemap.xml` | 200 | application/xml | - | - |
| `robots.txt` | 200 | text/plain | - | - |
| `api/dashboard/stats` | 200 | application/json | ✅ | - |
| `api/analytics/web-vitals GET` | 200 | application/json | ✅ | - |
| `api/analytics/web-vitals POST` | 200 | application/json | ✅ | - |

## 🔍 Next Steps

1. Fix all endpoints marked as failed
2. Replace unsafe JSON.parse with safeJsonParse utility
3. Ensure all API routes return valid JSON
4. Fix serialization issues (Date, BigInt, etc.)
5. Re-run smoke test to verify fixes
