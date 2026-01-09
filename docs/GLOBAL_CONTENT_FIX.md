# Global Content Fix & Sanitization

## Problem
Listing detail pages were polluted with blog-style, AI-generated, long-form content. This needed to be fixed globally, not page by page.

## Solution

### PART 1: Content Type Separation

**Listing Descriptions:**
- Factual property description (as if showing in person)
- Max 6-10 short paragraphs
- NO blog structure (NO H2/H3)
- NO conclusion paragraph
- NO FAQ
- NO marketing clichés

**Blog Articles:**
- Can have headings, structure
- But NO placeholders or broken tags

### PART 2: Enhanced Clean Function

**File:** `apps/web/lib/utils/clean-description.ts`

**Removes:**
- Blog-style headings (H2/H3)
- Conclusion paragraphs
- FAQ sections
- AI writing patterns ("Bu yazıda", "Günümüzde", "Son yıllarda")
- Marketing clichés ("hayalinizdeki", "tatil cenneti")
- Comment requests ("yorumlarınızı bekliyorum")
- Placeholders ("image idea", "[IMAGE]", "[Alt Text]")
- Empty/broken tags
- Lists (listings should be paragraph-based)
- Limits to 10 paragraphs max

### PART 3: Listing-Specific Prompt

**File:** `apps/admin/lib/prompts/listing-description.ts`

**New prompt enforces:**
- Factual, calm, concise description
- 6-10 short paragraphs
- NO blog structure
- NO marketing language
- Professional real estate agent tone

### PART 4: Global Sanitization Script

**File:** `scripts/content/global-content-sanitizer.ts`
**Command:** `pnpm content:sanitize`

**What it does:**
- Scans all listings with `description_long`
- Cleans AI patterns, placeholders, blog structure
- Updates database
- Reports results

### PART 5: UI Fix

**File:** `apps/web/app/[locale]/ilan/[slug]/page.tsx`

**Changes:**
- Removed blog-style typography (prose classes)
- Smaller, utilitarian text blocks
- Clear spacing
- Visual hierarchy: Title → Key facts → Description → Location → CTA

### PART 6: Content Generation Fix

**File:** `scripts/content/fill-all-pages.ts`

**Updated prompt** to use listing-specific rules instead of blog-style generation.

## Usage

### Run Global Sanitization
```bash
pnpm content:sanitize
```

This will:
1. Clean all listing descriptions
2. Remove placeholders from articles
3. Report what was cleaned

### Manual Check
For any listing, ask: "Would a real emlak danışmanı explain it like this to a client?"

If not → the description needs rewriting.

## Files Changed

1. `apps/web/lib/utils/clean-description.ts` - Enhanced cleaning function
2. `apps/admin/lib/prompts/listing-description.ts` - New listing-specific prompt
3. `scripts/content/global-content-sanitizer.ts` - Global sanitization script
4. `scripts/content/fill-all-pages.ts` - Updated generation prompt
5. `apps/web/app/[locale]/ilan/[slug]/page.tsx` - UI improvements
6. `package.json` - Added `content:sanitize` script

## Rules Summary

### ✅ DO (Listings)
- Factual property description
- 6-10 short paragraphs
- Focus on layout, location, usability
- Professional, calm tone

### ❌ DON'T (Listings)
- Blog-style headings (H2/H3)
- Long introductions
- Generic regional essays
- Conclusion paragraphs
- FAQ sections
- Marketing clichés
- Comment requests
- Placeholders

## Next Steps

1. Run `pnpm content:sanitize` to clean existing content
2. Use listing-specific prompt for new listings
3. Monitor new content generation
4. Regular audits to catch AI patterns
