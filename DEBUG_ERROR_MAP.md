# DEBUG_ERROR_MAP.md

Generated: 2026-01-27T11:47:40.198Z
Base URL: http://localhost:3000

## Summary

- Total endpoints tested: 23
- ✅ Passed: 0
- ❌ Failed: 23
- 🔴 JSON Parse Errors: 0
- ⚠️  Non-JSON Responses: 0

## ❌ Failed Endpoints

| Endpoint | Status | Error | Caller Pages |
|----------|--------|-------|--------------|
| `healthz` | 0 | fetch failed | - |
| `api/health` | 0 | fetch failed | - |
| `api/listings` | 0 | fetch failed | /, /kiralik, /satilik |
| `api/articles` | 0 | fetch failed | /, /blog |
| `api/news` | 0 | fetch failed | /, /haberler |
| `api/neighborhoods` | 0 | fetch failed | / |
| `api/faq` | 0 | fetch failed | - |
| `api/stats/listings` | 0 | fetch failed | / |
| `homepage` | 0 | fetch failed | - |
| `kiralik` | 0 | fetch failed | - |
| `satilik` | 0 | fetch failed | - |
| `karasu` | 0 | fetch failed | - |
| `kocaali` | 0 | fetch failed | - |
| `sapanca` | 0 | fetch failed | - |
| `tr/kocaali` | 0 | fetch failed | - |
| `tr/sapanca` | 0 | fetch failed | - |
| `blog` | 0 | fetch failed | - |
| `haberler` | 0 | fetch failed | - |
| `sitemap.xml` | 0 | fetch failed | - |
| `robots.txt` | 0 | fetch failed | - |
| `api/dashboard/stats` | 0 | fetch failed | /admin/dashboard |
| `api/analytics/web-vitals GET` | 0 | fetch failed | - |
| `api/analytics/web-vitals POST` | 0 | fetch failed | - |

## 📋 All Test Results

| Endpoint | Status | Content-Type | JSON OK | Error |
|----------|--------|---------------|---------|-------|
| `healthz` | 0 |  | - | fetch failed |
| `api/health` | 0 |  | - | fetch failed |
| `api/listings` | 0 |  | - | fetch failed |
| `api/articles` | 0 |  | - | fetch failed |
| `api/news` | 0 |  | - | fetch failed |
| `api/neighborhoods` | 0 |  | - | fetch failed |
| `api/faq` | 0 |  | - | fetch failed |
| `api/stats/listings` | 0 |  | - | fetch failed |
| `homepage` | 0 |  | - | fetch failed |
| `kiralik` | 0 |  | - | fetch failed |
| `satilik` | 0 |  | - | fetch failed |
| `karasu` | 0 |  | - | fetch failed |
| `kocaali` | 0 |  | - | fetch failed |
| `sapanca` | 0 |  | - | fetch failed |
| `tr/kocaali` | 0 |  | - | fetch failed |
| `tr/sapanca` | 0 |  | - | fetch failed |
| `blog` | 0 |  | - | fetch failed |
| `haberler` | 0 |  | - | fetch failed |
| `sitemap.xml` | 0 |  | - | fetch failed |
| `robots.txt` | 0 |  | - | fetch failed |
| `api/dashboard/stats` | 0 |  | - | fetch failed |
| `api/analytics/web-vitals GET` | 0 |  | - | fetch failed |
| `api/analytics/web-vitals POST` | 0 |  | - | fetch failed |

## 🔍 Next Steps

1. Fix all endpoints marked as failed
2. Replace unsafe JSON.parse with safeJsonParse utility
3. Ensure all API routes return valid JSON
4. Fix serialization issues (Date, BigInt, etc.)
5. Re-run smoke test to verify fixes
