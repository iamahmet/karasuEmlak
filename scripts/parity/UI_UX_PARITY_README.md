# UI/UX Parity System

Automated system to ensure the new version maintains or improves UI/UX quality compared to production.

## Overview

This system performs comprehensive UI/UX audits comparing production and local versions:
- Visual snapshots (screenshots)
- DOM metrics extraction
- Component scoring (0-10 rubric)
- Design system consistency
- Regression detection
- Improvement tracking

## Quick Start

### Prerequisites

```bash
# Install Playwright browsers
npx playwright install chromium
```

### Run Full UI Audit

```bash
# Make sure local server is running
npm run dev:web  # Terminal 1

# Run full UI audit (Terminal 2)
npm run parity:ui:full
```

This will:
1. Capture screenshots of production and local
2. Extract DOM metrics
3. Score each screen
4. Audit design system
5. Generate comprehensive report
6. Verify thresholds

## Individual Commands

### Visual Snapshots

```bash
npm run parity:ui
```

Captures screenshots and extracts DOM metrics for all routes.

**Output:**
- `scripts/parity/ui-report.json` - Machine-readable data
- `scripts/parity/parity-artifacts/screenshots/*` - Screenshots

### Scoring

```bash
npm run parity:ui:score
```

Scores each screen (0-10) and compares old vs new.

**Output:**
- `scripts/parity/ui-scoring-report.json` - Scoring data

### Design System Audit

```bash
npm run parity:ui:audit
```

Audits design tokens and component consistency.

**Output:**
- `scripts/parity/design-system-audit.json` - Audit data

### Verification

```bash
npm run parity:ui:verify
```

Checks if regressions are below threshold.

**Exit codes:**
- 0: Passed (meets thresholds)
- 1: Failed (too many regressions or low scores)

## What Gets Compared

### Core Pages
- Home (`/`)
- Satılık listings (`/satilik`)
- Kiralık listings (`/kiralik`)
- Listing detail (`/ilan/[slug]`)
- Neighborhood (`/karasu/[mahalle]`)
- Blog listing (`/blog`)
- Blog detail (`/blog/[slug]`)
- News listing (`/haberler`)
- News detail (`/haberler/[slug]`)
- Search (`/arama`)
- Contact (`/iletisim`)

### Categories Per Screen

1. **Layout & Hierarchy**
   - Hero sections
   - Content structure
   - Visual hierarchy

2. **Navigation & IA**
   - Breadcrumbs
   - Menu structure
   - Navigation clarity

3. **Listing Card Quality**
   - Image presence
   - Price visibility
   - Key features
   - CTA buttons

4. **Filter/Search UX**
   - Filter visibility
   - Ease of use
   - Active state indicators

5. **Trust Signals**
   - NAP (Name, Address, Phone)
   - Badges/certifications
   - Testimonials

6. **Conversion Widgets**
   - WhatsApp buttons
   - Call buttons
   - Contact forms
   - Inquiry CTAs

7. **Performance**
   - LCP (Largest Contentful Paint)
   - CLS (Cumulative Layout Shift)
   - TBT (Total Blocking Time)

8. **Accessibility**
   - Keyboard navigation
   - Focus indicators
   - Contrast ratios
   - ARIA labels

9. **Mobile UX**
   - Sticky actions
   - Thumb-friendly zones
   - Mobile menu
   - Bottom sheet filters

## Scoring Rubric

Each screen is scored 0-10 based on:

- **Listing Cards:** Image (+2), Price (+2), CTA (+2), Trust (+2), Conversion (+2)
- **Filters:** Presence (+3), Trust (+2), Conversion (+2), Navigation (+3)
- **Detail Pages:** Gallery (+2), Price (+2), CTA (+2), Trust (+2), Conversion (+2)
- **Blog/News:** H1 (+2), Breadcrumbs (+2), Trust (+2), Conversion (+2), Hero (+2)

## Thresholds

Verification passes if:
- **Max regressions:** ≤ 3 screens
- **Min average score:** ≥ 7.0/10

## Output Files

All outputs in `scripts/parity/`:

- `ui-report.json` - Machine-readable snapshot data
- `ui-report.md` - Human-readable report
- `ui-scoring-report.json` - Scoring data
- `design-system-audit.json` - Design system audit
- `parity-artifacts/screenshots/*` - Screenshots

## Integration with CI/CD

Add to `.github/workflows/ui-parity.yml`:

```yaml
name: UI Parity Check

on:
  pull_request:
    branches: [main]

jobs:
  ui-parity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install chromium
      - run: npm run dev:web &
      - run: sleep 10
      - run: npm run parity:ui:full
```

## Troubleshooting

### Playwright not found
```bash
npx playwright install chromium
```

### Local server not running
```bash
npm run dev:web
# Wait for server to start, then run audit
```

### Screenshots not generated
- Check `parity-artifacts/screenshots/` directory exists
- Verify routes are accessible
- Check browser console for errors

## Next Steps After Audit

1. **Review regressions** in `ui-report.md`
2. **Fix critical issues** (score < 7 or missing features)
3. **Migrate old wins** (better patterns from production)
4. **Improve design system** (consistency issues)
5. **Re-run audit** to verify fixes

## Design System Consolidation

After audit, consolidate design tokens:

1. **Colors:** Unify primary/secondary/accent
2. **Spacing:** Use 8px base system consistently
3. **Typography:** Standardize font sizes/weights
4. **Components:** Create reusable component library
5. **States:** Define hover/focus/disabled consistently

## Performance Optimization

If performance regressions found:

1. **Analyze bundle** with `npm run build`
2. **Reduce client components** (use server components)
3. **Optimize images** (Cloudinary transformations)
4. **Lazy load** heavy components
5. **Memoize** expensive selectors

## Related Documentation

- `README.md` - URL parity system
- `PARITY_SYSTEM_COMPLETE.md` - URL parity overview
- `DESIGN_SYSTEM.md` - Design system documentation
