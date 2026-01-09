# Phase 3: Content Engine - Automated Content Pipeline

**Status:** In Progress  
**Goal:** Standardize content creation, review, and publishing workflow with Supabase storage

---

## Current State Analysis

### Content Tables
1. **`articles`** - Blog articles
   - Fields: title, slug, content, excerpt, status (draft/published), published_at
   - Direct publishing (no review workflow)

2. **`news_articles`** - News articles
   - Fields: title, slug, content, published (boolean), published_at
   - Direct publishing (no review workflow)

3. **`content_items`** - Content Studio items (newer system)
   - Fields: type, slug, status (draft/review/published)
   - Has `content_locales` for multi-language
   - Has `content_quality` for quality scores
   - **Issue:** Not fully integrated with articles/news_articles

### Current Workflows

#### Articles Workflow
```
Admin Panel → Create Article → Save as Draft → Publish Directly
```
- No review step
- No quality gate enforcement
- No translation workflow

#### News Articles Workflow
```
Admin Panel → Create News → Save as Draft → Publish Directly
```
- No review step
- No quality gate enforcement
- No translation workflow

#### Content Studio Workflow (Partial)
```
Content Studio → Generate AI Content → Draft → Quality Check → Review → Publish
```
- Has quality gate
- Has multi-language support
- **Issue:** Not connected to articles/news_articles tables

---

## Phase 3 Goals

### 1. Unified Content Pipeline
- Single workflow for all content types
- Draft → Review → Publish stages
- Quality gate enforcement
- Multi-language support

### 2. Content Storage Optimization
- Standardize on `content_items` + `content_locales` structure
- Migrate articles/news_articles to use content_items (optional, gradual)
- Or: Enhance articles/news_articles with review workflow

### 3. Automated Quality Checks
- Content quality scoring
- SEO optimization checks
- Duplicate content detection
- Thin content warnings

### 4. Translation Pipeline
- AI-powered translations
- Review workflow for translations
- Locale-specific publishing

---

## Implementation Plan

### Option A: Enhance Existing Tables (Recommended)
**Pros:**
- No migration needed
- Backward compatible
- Faster implementation

**Changes:**
1. Add `review_status` field to `articles` and `news_articles`
2. Add `quality_score` field
3. Add `translation_status` field
4. Create review workflow API endpoints
5. Add quality gate checks before publishing

### Option B: Migrate to content_items
**Pros:**
- Unified structure
- Better multi-language support
- More flexible

**Cons:**
- Requires migration
- Breaking changes
- More complex

**Recommendation:** Option A (enhance existing tables)

---

## Tasks

### Task 1: Add Review Workflow Fields
- [ ] Add `review_status` enum to articles (draft, pending_review, approved, rejected)
- [ ] Add `review_status` enum to news_articles
- [ ] Add `reviewed_by` and `reviewed_at` fields
- [ ] Add `quality_score` field (0-100)
- [ ] Add `quality_issues` JSON field

### Task 2: Create Review API Endpoints
- [ ] `POST /api/admin/content/review` - Submit for review
- [ ] `POST /api/admin/content/approve` - Approve content
- [ ] `POST /api/admin/content/reject` - Reject with feedback
- [ ] `GET /api/admin/content/pending-review` - List pending reviews

### Task 3: Quality Gate Integration
- [ ] Integrate quality checks into publish workflow
- [ ] Block publishing if quality score < 70
- [ ] Show quality issues in admin panel
- [ ] Auto-suggest improvements

### Task 4: Translation Pipeline
- [ ] Add `translation_status` to articles/news_articles
- [ ] Create translation API endpoint
- [ ] Store translations in separate table or JSON field
- [ ] Review workflow for translations

### Task 5: Content Studio Integration
- [ ] Connect Content Studio to articles/news_articles
- [ ] Use content_items as staging area
- [ ] Publish to articles/news_articles after approval

---

## Database Schema Changes

```sql
-- Add review workflow fields to articles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'draft' CHECK (review_status IN ('draft', 'pending_review', 'approved', 'rejected'));
ALTER TABLE articles ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS quality_issues JSONB DEFAULT '[]'::jsonb;

-- Add review workflow fields to news_articles
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'draft' CHECK (review_status IN ('draft', 'pending_review', 'approved', 'rejected'));
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100);
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS quality_issues JSONB DEFAULT '[]'::jsonb;
```

---

## API Endpoints

### Review Workflow
```typescript
// Submit for review
POST /api/admin/content/review
{
  contentType: 'article' | 'news',
  contentId: string
}

// Approve
POST /api/admin/content/approve
{
  contentType: 'article' | 'news',
  contentId: string,
  notes?: string
}

// Reject
POST /api/admin/content/reject
{
  contentType: 'article' | 'news',
  contentId: string,
  reason: string,
  notes?: string
}

// Get pending reviews
GET /api/admin/content/pending-review?type=article&limit=10
```

---

## Next Steps

1. Create database migration script
2. Implement review API endpoints
3. Update admin panel UI for review workflow
4. Integrate quality gate checks
5. Test end-to-end workflow
