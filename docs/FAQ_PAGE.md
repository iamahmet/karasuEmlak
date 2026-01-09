# FAQ (SSS) Page Documentation

**Last Updated:** 2026-01-05  
**Status:** ✅ Production-ready

---

## 📋 Overview

The `/sss` (Sıkça Sorulan Sorular) page is a premium editorial FAQ page with:
- Server-side data fetching (zero loading states)
- Clean, accessible UI
- SEO-optimized with FAQPage schema
- Category navigation and search
- Related links section

---

## 🏗️ Architecture

### Server Component (`page.tsx`)
- Fetches FAQs from Supabase `qa_entries` table
- Generates FAQPage JSON-LD schema
- Generates BreadcrumbList schema
- Passes data to client component

### Client Component (`FAQContent.tsx`)
- Search and filter functionality
- Category navigation (sticky sidebar on desktop)
- Accordion interactions
- Related links section

---

## 📊 Data Source

### Database Table: `qa_entries`

**Columns:**
- `id` (UUID)
- `question` (text)
- `answer` (text)
- `category` (enum: bilgi, yatirim, karar_verme, hukuki, finansman, kiralama, risk, karsilastirma)
- `priority` (text: high, medium, low)
- `region` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**RLS Policies:**
- Public read access
- Service role full access

---

## 🎨 UI/UX Features

### Desktop Layout
- **Left Sidebar:** Sticky category navigation
- **Main Content:** FAQ accordions grouped by category
- **Search Bar:** Prominent at top
- **Related Links:** Bottom section with internal links

### Mobile Layout
- **Category Filter:** Select dropdown
- **FAQ List:** Full-width accordions
- **Search Bar:** Full-width at top

### Accessibility
- ✅ Keyboard navigation
- ✅ ARIA labels and roles
- ✅ Focus management
- ✅ Screen reader friendly

---

## 🔍 SEO Features

### Schema.org Markup

1. **FAQPage Schema:**
   ```json
   {
     "@context": "https://schema.org",
     "@type": "FAQPage",
     "mainEntity": [...]
   }
   ```

2. **BreadcrumbList Schema:**
   ```json
   {
     "@context": "https://schema.org",
     "@type": "BreadcrumbList",
     "itemListElement": [...]
   }
   ```

### Metadata
- ✅ Single H1
- ✅ Canonical URL
- ✅ Hreflang tags
- ✅ Open Graph tags
- ✅ Twitter Cards

---

## 🚀 Performance

- **Server-side rendering:** Zero client-side loading
- **Memoized filters:** useMemo for performance
- **Lazy loading:** Only search/filter is client-side
- **No heavy libraries:** Vanilla React hooks

---

## 📝 Content Guidelines

### Categories
- **bilgi:** Genel bilgiler
- **yatirim:** Yatırım soruları
- **karar_verme:** Karar verme süreçleri
- **hukuki:** Hukuki süreçler
- **finansman:** Finansman ve kredi
- **kiralama:** Kiralama işlemleri
- **risk:** Risk ve dikkat edilmesi gerekenler
- **karsilastirma:** Karşılaştırma soruları

### Content Quality
- ✅ Natural Turkish language
- ✅ Local to Karasu/Kocaali
- ✅ No keyword stuffing
- ✅ Clear, helpful answers

---

## 🧪 Testing

### Manual Test
1. Visit `/sss`
2. Verify FAQs load immediately (no loading state)
3. Test search functionality
4. Test category filters
5. Test accordion interactions
6. Check browser console for CSP errors (should be zero)

### Schema Validation
- Use [Google Rich Results Test](https://search.google.com/test/rich-results)
- Validate FAQPage schema
- Validate BreadcrumbList schema

---

## 🔧 Maintenance

### Adding New FAQs
1. Insert into `qa_entries` table via Supabase
2. FAQs appear automatically (no code changes needed)
3. Categories are auto-detected

### Updating Categories
1. Update `categoryLabels` in `FAQContent.tsx`
2. Update `categoryOrder` array for sorting
3. Update database constraint if adding new category

---

## ✅ Status

- ✅ Server-side data fetching
- ✅ Premium UI/UX
- ✅ SEO-optimized
- ✅ Accessible
- ✅ Performance optimized
- ✅ Zero loading states

**Production-ready:** ✅
