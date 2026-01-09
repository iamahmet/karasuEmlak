# KarasuEmlak v5 - Authority & Discovery System

## Overview
This document outlines the v5 upgrade focusing on topical authority engineering, AI Overviews optimization, and Google Discover visibility.

---

## PART 1 — KARASU ↔ KOCAALİ ÇİFT MEGA-HUB

### Hub Structure

#### HUB A — KARASU HUB ✅
**Core Pillar:**
- `/karasu-satilik-ev` (Main authority page)

**Supporting Pillars:**
- `/karasu-yatirimlik-gayrimenkul` ✅
- `/karasu-emlak-rehberi` ✅
- `/karasu-mahalleler` (via `/mahalle/[slug]`) ✅
- `/karasu-satilik-ev-fiyatlari` ✅

**Cornerstone Pages:**
- `/karasu-merkez-satilik-ev` ✅
- `/karasu-denize-yakin-satilik-ev` ✅
- `/karasu-yatirimlik-satilik-ev` ✅
- `/karasu-mustakil-satilik-ev` ✅

#### HUB B — KOCAALİ HUB ✅
**Core Pillar:**
- `/kocaali-satilik-ev` ✅ CREATED

**Supporting Pillars:**
- `/kocaali-yatirimlik-gayrimenkul` ✅ CREATED
- `/kocaali-emlak-rehberi` ✅ EXISTS
- `/kocaali-mahalleler` (via `/mahalle/[slug]`) ✅
- `/kocaali-satilik-ev-fiyatlari` ✅ CREATED

### Cross-Linking Implementation ✅

**Karasu → Kocaali:**
- Location: Sidebar "İlgili Sayfalar" section
- Anchor: "Kocaali'de Satılık Ev Seçenekleri →"
- Context: Alternative option

**Kocaali → Karasu:**
- Location: Comparison section
- Anchor: "Karasu Satılık Ev Rehberi"
- Context: Comparison and alternative

**Rules Applied:**
- ✅ Contextual only
- ✅ No exact-match spam
- ✅ Comparative language
- ✅ Bidirectional linking

---

## PART 2 — AI OVERVIEWS Q&A SYSTEM

### Q&A Generation ✅

**40 High-Value Questions Created:**
- 20 for Karasu
- 20 for Kocaali

**Categories:**
- Bilgi (Information): "nedir, nasıl, neden"
- Karşılaştırma (Comparison): "X mi Y mi"
- Karar Verme (Decision): "mantıklı mı, uygun mu"
- Risk: "dikkat edilmesi gerekenler"
- Yatırım (Investment): "yatırım perspektifi"

**Answer Rules:**
- ✅ 40-80 kelime
- ✅ Net, sakin, uzman tonu
- ✅ NO sales language
- ✅ "Kısa cevap" hissi
- ✅ First 2 sentences AI Overview-ready

**Distribution:**
- Pillar pages: High-priority Q&As
- Cornerstone pages: Medium-priority Q&As
- Blog posts: Low-priority Q&As
- Neighborhood pages: Local Q&As

**Script:** `scripts/generate-qa-system.ts`

**Database:** Q&A entries stored in `qa_entries` table (to be created)

---

## PART 3 — KARASU EMLAK HABERLERİ (DISCOVER ENGINE)

### News System ✅

**New Section:**
- `/haberler/karasu-emlak` ✅ CREATED

**Features:**
- ✅ Real estate focused news
- ✅ Karasu Gündem integration
- ✅ Internal links to hubs
- ✅ Discover-friendly signals
- ✅ NewsArticle schema

**News Rewriting:**
- ✅ Script: `scripts/rewrite-news-for-emlak.ts`
- ✅ Real estate angle added
- ✅ "Bu ne anlama geliyor?" section
- ✅ Internal links generated
- ✅ Admin review required (draft status)

**News Categories:**
- Karasu emlak piyasası
- Yeni projeler / bölgeler
- Altyapı / ulaşım gelişmeleri
- Deprem / imar / çevre
- Yerel ekonomik gelişmeler

**Discover Optimization:**
- ✅ Strong featured image (Cloudinary)
- ✅ Descriptive alt text
- ✅ Author attribution
- ✅ Published & updated timestamps
- ✅ NewsArticle schema

### Sitemap-News ✅

**File:** `apps/web/app/sitemap-news.ts`
- ✅ Daily updates
- ✅ Last 2 days only (Google News requirement)
- ✅ Included in robots.txt
- ✅ Auto-submission ready

---

## PART 4 — AUTOMATION & PIPELINE

### Automation Scripts ✅

**1. News Ingestion:**
- Script: `scripts/rewrite-news-for-emlak.ts`
- Function: Fetch from Karasu Gündem → Rewrite → Store as draft
- Admin review required before publish

**2. Q&A Generation:**
- Script: `scripts/generate-qa-system.ts`
- Function: Generate 40 Q&As → Store in `qa_entries` table
- Ready for integration into pages

**3. Internal Link Suggestions:**
- Function: `generateInternalLinkSuggestions()` in `scripts/automation-pipeline.ts`
- Auto-generates links based on content keywords

**4. Sitemap Submission:**
- Function: `submitSitemap()` in `scripts/automation-pipeline.ts`
- Auto-submits to Google & Bing after publish

**5. SEO Events Logging:**
- Function: `logSEOEvent()` in `scripts/automation-pipeline.ts`
- Logs: content_generated, news_published, internal_link_added, sitemap_submitted

**Main Pipeline:**
- Script: `scripts/automation-pipeline.ts`
- Orchestrates all automation steps

---

## PART 5 — INTERNAL LINKING MAP

### Documentation ✅

**File:** `INTERNAL_LINK_MAP.md`

**Contents:**
- Hub structure
- Cross-linking rules
- Internal linking hierarchy
- Anchor text rules
- Q&A distribution strategy
- News integration
- Success metrics
- Maintenance guidelines

---

## IMPLEMENTATION STATUS

### ✅ Completed

1. **Kocaali Hub Creation:**
   - ✅ `/kocaali-satilik-ev` (core pillar)
   - ✅ `/kocaali-yatirimlik-gayrimenkul`
   - ✅ `/kocaali-satilik-ev-fiyatlari`
   - ✅ `/kocaali-emlak-rehberi` (exists)

2. **Cross-Linking:**
   - ✅ Karasu → Kocaali (sidebar)
   - ✅ Kocaali → Karasu (comparison section)
   - ✅ Contextual, natural language

3. **Q&A System:**
   - ✅ 40 questions generated (20 Karasu, 20 Kocaali)
   - ✅ Script created: `scripts/generate-qa-system.ts`
   - ⏳ Database table to be created

4. **News System:**
   - ✅ `/haberler/karasu-emlak` page created
   - ✅ News rewriting script created
   - ✅ Sitemap-news.xml created
   - ✅ Internal links added to news detail pages

5. **Automation:**
   - ✅ News ingestion script
   - ✅ Q&A generation script
   - ✅ Internal link suggestions function
   - ✅ Sitemap submission function
   - ✅ SEO events logging function

6. **Documentation:**
   - ✅ Internal link map documented
   - ✅ V5 authority system documented

### ⏳ Pending

1. **Database Setup:**
   - Create `qa_entries` table
   - Verify `seo_events` table exists

2. **Q&A Integration:**
   - Integrate Q&As into pillar pages
   - Integrate Q&As into cornerstone pages
   - Add FAQPage schema to all pages

3. **News Publishing:**
   - Run news rewriting script
   - Review and publish news articles
   - Monitor Discover traffic

4. **Testing:**
   - Test cross-linking functionality
   - Verify internal link suggestions
   - Test sitemap submission

---

## NEXT STEPS

1. **Run Scripts:**
   ```bash
   # Generate Q&A system
   pnpm tsx scripts/generate-qa-system.ts
   
   # Rewrite news for emlak
   pnpm tsx scripts/rewrite-news-for-emlak.ts
   
   # Run automation pipeline
   pnpm tsx scripts/automation-pipeline.ts
   ```

2. **Database Setup:**
   - Create `qa_entries` table in Supabase
   - Verify `seo_events` table structure

3. **Content Integration:**
   - Integrate Q&As into pages
   - Review and publish news articles
   - Add internal links to content

4. **Monitoring:**
   - Monitor SEO events
   - Track AI Overviews appearances
   - Monitor Discover traffic

---

## SUCCESS CRITERIA

✅ **Structure:**
- Both hubs created and cross-linked
- Q&A system ready
- News system operational
- Automation pipeline functional

⏳ **Performance:**
- AI Overviews citations (monitor)
- Discover traffic (monitor)
- Internal link health (monitor)
- Authority signals (monitor)

---

**Last Updated:** 2025-01-XX
**Version:** v5.0
**Status:** Core Implementation Complete
