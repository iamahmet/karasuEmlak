# Parity Auditor & Auto-Fix System

Automated system to ensure the new local version doesn't miss any important pages from production. Preserves SEO equity by identifying missing URLs and automatically fixing them.

## Overview

This system performs a comprehensive audit comparing production and local URLs, then automatically:
- Recreates missing blog/news/static pages
- Sets up 301 redirects for obsolete/merged pages
- Imports content from production when needed
- Verifies all fixes are working

## Prerequisites

```bash
# Install dependencies (from project root)
npm install --save-dev xml2js @types/xml2js cheerio glob
```

## Usage

### Phase 0: Scan Production

```bash
npm run parity:scan:prod
```

Fetches and parses production sitemap(s) to build URL inventory.
- Output: `scripts/parity/prod-urls.json`

### Phase 1: Scan Local

```bash
# Make sure local server is running
npm run dev:web

# In another terminal
npm run parity:scan:local
```

Scans local sitemap and route files to build URL inventory.
- Output: `scripts/parity/local-urls.json`

### Phase 2: Compute Diff

```bash
npm run parity:diff
```

Compares production and local inventories to identify missing URLs.
- Output: 
  - `scripts/parity/diff-report.json` (machine-readable)
  - `scripts/parity/diff-report.md` (human-readable)

### Phase 3: Auto-Fix

```bash
npm run parity:fix
```

For each missing URL, decides and applies fix:
- **RECREATE**: Blog/news/static content → recreates in new system
- **REDIRECT**: Obsolete/merged pages → sets up 301 redirects
- **NOINDEX**: Thin/spam/duplicate → marks noindex (last resort)

- Output:
  - `scripts/parity/redirect-map.json` (redirect mappings)
  - `scripts/parity/fix-report.json` (fix actions taken)

### Phase 4: Import Blog/News Content

```bash
npm run parity:import
```

Imports blog and news content from production into local database.
- Fetches HTML from production
- Extracts and cleans content
- Inserts into Supabase (articles or news_articles table)

### Phase 7: Verify

```bash
npm run parity:verify
```

Verifies that all fixes were applied correctly:
- Random sampling: Checks 20 previously missing URLs locally
- Confirms redirects return 301 and land on correct target
- Output: `scripts/parity/verification-report.json`

## Complete Workflow

```bash
# 1. Scan production
npm run parity:scan:prod

# 2. Scan local (with server running)
npm run dev:web  # Terminal 1
npm run parity:scan:local  # Terminal 2

# 3. Compute diff
npm run parity:diff

# 4. Review diff-report.md
cat scripts/parity/diff-report.md

# 5. Apply fixes
npm run parity:fix

# 6. Import content (if needed)
npm run parity:import

# 7. Verify fixes
npm run parity:verify
```

## Output Files

All output files are saved in `scripts/parity/`:

- `prod-urls.json` - Production URL inventory
- `local-urls.json` - Local URL inventory
- `diff-report.json` - Machine-readable diff report
- `diff-report.md` - Human-readable diff report
- `redirect-map.json` - Redirect mappings (for code generation)
- `fix-report.json` - Fix actions taken
- `verification-report.json` - Verification results

## Integration with Next.js

### Redirects

After running `parity:fix`, redirect mappings are saved in `redirect-map.json`. To integrate:

1. Add redirects to `next.config.ts`:
```typescript
import redirectMap from './scripts/parity/redirect-map.json';

export default {
  async redirects() {
    return redirectMap.map(redirect => ({
      source: redirect.from,
      destination: redirect.to,
      permanent: redirect.status === 301,
    }));
  },
};
```

2. Or use middleware for dynamic redirects (see `apps/web/middleware.ts`)

### Sitemap Updates

The local sitemap (`apps/web/app/sitemap.ts`) automatically includes:
- Static routes
- Dynamic listings
- Blog articles
- News articles
- Neighborhoods
- Property types

After importing content, the sitemap will automatically include new URLs.

## Example: Missing Blog Article

If production has `/blog/karasuda-en-iyi-balik-restoranlari` but local doesn't:

1. **Diff** identifies it as missing
2. **Fix** decides to recreate (blog content)
3. **Import** fetches content from production and inserts into `articles` table
4. **Verify** confirms the URL now returns 200 locally

## Troubleshooting

### Local sitemap not available

If `scan:local` can't fetch local sitemap:
- Make sure `npm run dev:web` is running
- Check `http://localhost:3000/sitemap.xml` in browser
- The script will fall back to scanning route files

### Content import fails

If blog/news import fails:
- Check Supabase connection
- Verify `articles` and `news_articles` tables exist
- Check RLS policies allow inserts
- Review error messages in console

### Redirects not working

If redirects don't work:
- Ensure `redirect-map.json` is integrated into `next.config.ts`
- Check middleware configuration
- Verify redirect targets exist

## Non-Negotiables

✅ **Never break existing SEO winners**
- Prefer recreating pages over redirecting
- Only redirect if page is truly obsolete/duplicate
- Use 301 (permanent) redirects

✅ **Preserve SEO equity**
- Keep same slugs when possible
- Maintain structured data
- Preserve canonical URLs
- Update sitemaps accordingly

✅ **Clean redirects**
- Redirects should not appear in sitemap
- Only final URLs in sitemap
- Redirect chains should be avoided

## CI/CD Integration

Add to CI pipeline:

```yaml
# .github/workflows/parity-check.yml
- name: Parity Check
  run: |
    npm run parity:scan:prod
    npm run parity:scan:local
    npm run parity:diff
    # Fail if missing URLs above threshold
    node -e "const diff = require('./scripts/parity/diff-report.json'); if (diff.summary.missing > 10) process.exit(1);"
```

## License

Part of Karasu Emlak project.
