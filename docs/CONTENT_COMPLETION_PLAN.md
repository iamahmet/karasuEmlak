# Content Completion Plan

**Status:** In Progress  
**Goal:** Make every existing page feel "complete" by filling missing content sections

---

## Phase 0: Route Inventory ✅

**Completed:**
- Scanned 79 routes
- Identified 30 routes needing content completion
- Generated `CONTENT_COVERAGE_REPORT.md`

**Key Findings:**
- Missing images: 53 pages
- Missing FAQ: 34 pages
- Missing schema: 32 pages
- Missing internal-links: 24 pages
- Missing sections: 2 pages

---

## Phase 1: Page Type Content Blueprints ✅

**Created:**
- `apps/web/lib/content/page-blueprints.ts` - Defines content structure per page type
- `apps/web/components/content/` - Reusable content components:
  - `PageIntro.tsx` - Hero section with H1, description, stats
  - `ContentSection.tsx` - Sectioned content with H2/H3
  - `FAQBlock.tsx` - FAQ section with schema support
  - `RelatedContent.tsx` - Related listings/articles/neighborhoods
  - `LastUpdated.tsx` - Last update date display

**Page Types Defined:**
- home
- listing-index
- listing-detail
- neighborhood
- neighborhood-index
- blog
- blog-index
- news
- news-index
- utility
- hub

---

## Phase 2: Auto-Fill Content Engine ✅

**Created:**
- `scripts/content/fill-all-pages.ts` - Auto-fills missing content using OpenAI
- Supports listings (description_long) and neighborhoods (seo_content)
- Idempotent: won't regenerate if already exists (unless --force)
- Rate limiting: 1 second delay between generations

**Usage:**
```bash
pnpm content:fill          # Fill missing content
pnpm content:fill:force   # Force regenerate all
```

---

## Phase 3: Internal Linking Engine ✅

**Created:**
- `apps/web/lib/internal-linker.ts` - Programmatic internal linking system
- Generates contextual links based on content type and location
- Natural Turkish anchor text (no "buraya tıkla")
- Links to hubs, neighborhoods, listings, blog, news

**Features:**
- Hub links (Karasu ↔ Kocaali)
- Neighborhood links from blog/news/listings
- Listing index links from blog/news
- Related content links
- Audit function to ensure minimum link counts

---

## Phase 4: AI Overviews Q&A Distribution ✅

**Created:**
- `scripts/content/generate-qa-distribution.ts` - Generates 40 Q&A sets
- 20 Karasu-specific Q&As
- 20 Kocaali-specific Q&As
- Categories: fiyat, rehber, yatirim, kiralama, konum, tip
- Page types: pillar, cornerstone, blog, neighborhood, comparison

**Usage:**
```bash
pnpm content:qa:generate
```

**Q&A Distribution:**
- Pillar pages: High-priority Q&As (priority 8-10)
- Cornerstone pages: Location-specific Q&As (priority 7-9)
- Blog pages: General Q&As (priority 4-6)
- Neighborhood pages: Location-specific Q&As (priority 6-8)

---

## Phase 5: Images for Content Pages (Pending)

**Planned:**
- `scripts/media/backfill-content-images.ts` - Generate hero images for blog/news/hub pages
- Cloudinary upload
- Alt text generation
- OG variant generation
- Fallback to default if generation fails

---

## Phase 6: Quality Gates (Pending)

**Planned Checks:**
- Sitemap + schema validation
- Single H1 per page
- No duplicated content blocks
- No empty placeholder pages
- Content reads like real local guide (not generic AI)

---

## Implementation Priority

### High Priority (Do First)
1. ✅ Route inventory
2. ✅ Content blueprints
3. ✅ Auto-fill engine
4. ✅ Internal linking
5. ✅ Q&A distribution
6. **Fill missing content for key pages:**
   - `/satilik` - Add FAQ, buyer guide, internal links
   - `/kiralik` - Add FAQ, renter guide, internal links
   - `/blog` - Add intro, categories, internal links
   - `/haberler` - Add intro, editorial note, internal links
   - `/iletisim` - Add FAQ, trust signals
   - `/hakkimizda` - Add FAQ, team section

### Medium Priority
7. Fill content for utility pages (tools, calculators, policies)
8. Enhance neighborhood pages with missing sections
9. Add images to content pages
10. Quality gates validation

### Low Priority
11. Fine-tune internal linking distribution
12. Optimize Q&A placement
13. A/B test content variations

---

## Next Steps

1. Run `pnpm content:qa:generate` to populate Q&A database
2. Run `pnpm content:fill` to auto-generate missing descriptions
3. Manually enhance key pages using new content components
4. Add images to content pages
5. Run quality gates validation

---

## Files Created

- `scripts/content/route-inventory.ts`
- `scripts/content/fill-all-pages.ts`
- `scripts/content/generate-qa-distribution.ts`
- `apps/web/lib/content/page-blueprints.ts`
- `apps/web/lib/internal-linker.ts`
- `apps/web/components/content/PageIntro.tsx`
- `apps/web/components/content/ContentSection.tsx`
- `apps/web/components/content/FAQBlock.tsx`
- `apps/web/components/content/RelatedContent.tsx`
- `apps/web/components/content/LastUpdated.tsx`
- `apps/web/components/content/index.ts`

---

## Documentation

- `docs/CONTENT_COVERAGE_REPORT.md` - Route inventory results
- `docs/CONTENT_COMPLETION_PLAN.md` - This file
