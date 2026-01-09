# Design System - KarasuEmlak v4

**Status:** Phase 1 Implementation  
**Last Updated:** 2026-01-04

---

## 🎯 Core Principles

1. **Trust > Style** - Professional, calm, confident
2. **Consistency > Cleverness** - Predictable patterns
3. **Accessibility First** - WCAG AA compliant
4. **Performance > Polish** - Fast, lightweight
5. **System > Ad-hoc** - Reusable components, not one-offs

---

## 🎨 Design Tokens

### Colors

#### Primary (Trust Blue)
```css
--primary: 210 100% 50%;        /* #006AFF */
--primary-dark: 210 100% 40%;  /* #0052CC */
--primary-light: 210 100% 55%; /* #1A8CFF */
--primary-subtle: 210 100% 97%; /* #E6F2FF */
```

#### Neutral Scale
```css
--neutral-50: #FAFAFA   /* Backgrounds */
--neutral-100: #F5F5F5  /* Subtle backgrounds */
--neutral-200: #E5E5E5  /* Borders */
--neutral-300: #D4D4D4  /* Disabled */
--neutral-400: #A3A3A3  /* Placeholder */
--neutral-500: #737373  /* Muted text */
--neutral-600: #525252  /* Body text */
--neutral-700: #404040  /* Headings */
--neutral-800: #262626  /* Dark text */
--neutral-900: #171717  /* Dark headings */
```

#### Status Colors
- **Success:** `#00A862` (green)
- **Warning:** `#FFA500` (orange)
- **Error:** `#FF5A5F` (red)
- **Info:** `#006AFF` (blue)

### Typography

#### Font Families
- **Sans:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Display:** `Plus Jakarta Sans, Inter, system-ui, sans-serif`

#### Scale
```css
/* Display */
font-size: 3rem (48px)
line-height: 1.1
font-weight: 700
letter-spacing: -0.02em

/* H1 */
font-size: 2rem (32px)
line-height: 1.2
font-weight: 600
letter-spacing: -0.01em

/* H2 */
font-size: 1.5rem (24px)
line-height: 1.3
font-weight: 600

/* H3 */
font-size: 1.25rem (20px)
line-height: 1.4
font-weight: 600

/* Body */
font-size: 1rem (16px)
line-height: 1.6
font-weight: 400

/* Small */
font-size: 0.875rem (14px)
line-height: 1.5

/* Caption */
font-size: 0.75rem (12px)
line-height: 1.4
```

### Spacing (8px base)

```css
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */
--spacing-2xl: 3rem;    /* 48px */
--spacing-3xl: 4rem;    /* 64px */
```

**Usage:**
- Section padding: `py-12` (48px) or `py-16` (64px)
- Container padding: `px-4 md:px-6 lg:px-8`
- Gap between elements: `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - small elements */
--radius-md: 0.5rem;    /* 8px - buttons, inputs */
--radius-lg: 0.75rem;   /* 12px - cards */
--radius-xl: 1rem;      /* 16px - large cards */
--radius-full: 9999px;  /* pills, avatars */
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 1px 3px rgba(0,0,0,0.1);
--shadow-lg: 0 4px 6px rgba(0,0,0,0.1);
--shadow-xl: 0 10px 15px rgba(0,0,0,0.1);
--shadow-card: 0 1px 3px rgba(0,0,0,0.1);
```

---

## 🧩 Component Standards

### Card Component

**Location:** `packages/ui/components/card.tsx`

**Variants:**
- `default` - Standard card
- `elevated` - With shadow
- `outlined` - Border only
- `interactive` - Hover effects

**Usage:**
```tsx
<Card variant="elevated" className="p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Badge Component

**Location:** `packages/ui/components/badge.tsx`

**Variants:**
- `default` - Neutral
- `primary` - Blue
- `success` - Green
- `warning` - Orange
- `error` - Red

**Usage:**
```tsx
<Badge variant="primary">New</Badge>
```

### Button Component

**Location:** `packages/ui/components/button.tsx`

**Variants:**
- `default` - Primary action
- `secondary` - Secondary action
- `outline` - Outlined
- `ghost` - Minimal
- `destructive` - Delete/danger

**Sizes:**
- `sm` - Small (h-8)
- `default` - Default (h-10)
- `lg` - Large (h-12)

### SectionHeader Component

**Purpose:** Consistent section headers across pages

**Props:**
- `title` - Section title (H2)
- `description?` - Optional description
- `action?` - Optional action button/link
- `align?: 'left' | 'center'`

**Usage:**
```tsx
<SectionHeader
  title="Featured Listings"
  description="Handpicked properties for you"
  action={<Link href="/satilik">View All</Link>}
/>
```

### Grid Component

**Purpose:** Consistent grid layouts

**Variants:**
- `default` - 1 col mobile, 2 col tablet, 3 col desktop
- `featured` - 1 col mobile, 2 col desktop
- `compact` - 2 col mobile, 3 col tablet, 4 col desktop

**Usage:**
```tsx
<Grid variant="default" className="gap-6">
  {items.map(item => <Card key={item.id}>...</Card>)}
</Grid>
```

### SidebarRail Component

**Purpose:** Consistent sidebar layout for blog/news/listing pages

**Props:**
- `children` - Main content
- `sidebar` - Sidebar content
- `sticky?: boolean` - Sticky sidebar

**Usage:**
```tsx
<SidebarRail sidebar={<ArticleSidebar />} sticky>
  <ArticleContent />
</SidebarRail>
```

---

## 📐 Layout Standards

### Global Layout

**File:** `apps/web/app/[locale]/layout.tsx`

**Rules:**
- Minimal, server-only
- No Supabase calls
- No analytics loading
- Only structure: `<html>`, `<body>`, providers

### Section Layouts

#### Content Section (Blog/News)
- **Max width:** 1200px
- **Layout:** SidebarRail (content + sidebar)
- **Typography:** Editorial reading layout
- **Features:** TOC, reading progress, related content

#### Listings Section
- **Max width:** 1280px
- **Layout:** Filters sidebar + grid
- **Features:** Sticky filters, chips, map toggle, sticky CTA

#### Tools Section
- **Max width:** 1200px
- **Layout:** Centered, single column
- **Features:** Calculator widgets, results

### Page Structure

**Standard Pattern:**
```tsx
<main>
  {/* Hero/Breadcrumbs */}
  <section className="py-8 lg:py-12">
    <div className="container mx-auto px-4 lg:px-6">
      {/* Hero content */}
    </div>
  </section>

  {/* Main Content */}
  <section className="py-12 lg:py-16">
    <div className="container mx-auto px-4 lg:px-6">
      {/* Content */}
    </div>
  </section>
</main>
```

**Rules:**
- ONE H1 per page
- Breadcrumbs where relevant
- Consistent section spacing
- No duplicate info panels

---

## 🚫 Anti-Patterns (DO NOT)

1. **Duplicate Widgets**
   - ❌ Multiple "Makale Bilgileri" blocks
   - ✅ Single source of truth component

2. **Inline Styles**
   - ❌ `style={{ padding: '16px' }}`
   - ✅ Tailwind classes or component variants

3. **Ad-hoc Spacing**
   - ❌ `mb-7`, `mt-13`
   - ✅ Standard spacing scale (4/8/16/24/32/48/64)

4. **Hardcoded Colors**
   - ❌ `text-[#006AFF]`
   - ✅ `text-primary` or CSS variable

5. **Page-Specific Hacks**
   - ❌ Special styling for one page
   - ✅ Refactor to reusable component

---

## ✅ Implementation Checklist

### Phase 1 Tasks

- [x] Design tokens defined (CSS variables)
- [ ] Card component standardized
- [ ] Badge component standardized
- [ ] Button component standardized
- [ ] SectionHeader component created
- [ ] Grid component created
- [ ] SidebarRail component created
- [ ] Duplicate widgets removed
- [ ] Blog pages → editorial layout
- [ ] News pages → editorial layout
- [ ] Listing pages → high-conversion layout
- [ ] No CLS regressions
- [ ] No hydration mismatches

---

## 📚 Component Library

### Location: `packages/ui/components/`

**Existing:**
- `button.tsx` ✅
- `card.tsx` ✅
- `badge.tsx` ✅
- `input.tsx` ✅
- `textarea.tsx` ✅
- `select.tsx` ✅
- `dialog.tsx` ✅
- `dropdown-menu.tsx` ✅
- `tabs.tsx` ✅
- `accordion.tsx` ✅
- `skeleton.tsx` ✅
- `toast.tsx` ✅
- `tooltip.tsx` ✅

**To Create:**
- `section-header.tsx` ⏳
- `grid.tsx` ⏳
- `sidebar-rail.tsx` ⏳

---

## 🎨 Usage Examples

### Standard Section
```tsx
<section className="py-12 lg:py-16 bg-white">
  <div className="container mx-auto px-4 lg:px-6">
    <SectionHeader
      title="Featured Properties"
      description="Handpicked listings for you"
    />
    <Grid variant="default" className="mt-8">
      {listings.map(listing => (
        <Card key={listing.id} variant="elevated">
          {/* Listing content */}
        </Card>
      ))}
    </Grid>
  </div>
</section>
```

### Editorial Layout (Blog/News)
```tsx
<SidebarRail
  sidebar={<ArticleSidebar article={article} />}
  sticky
>
  <article>
    <ArticleHero article={article} />
    <TableOfContents content={article.content} />
    <ArticleContent article={article} />
    <RelatedArticles articles={related} />
  </article>
</SidebarRail>
```

### High-Conversion Layout (Listings)
```tsx
<div className="container mx-auto px-4 lg:px-6">
  <div className="grid lg:grid-cols-4 gap-6">
    {/* Filters Sidebar */}
    <aside className="lg:col-span-1">
      <FiltersSidebar sticky />
    </aside>
    
    {/* Main Content */}
    <main className="lg:col-span-3">
      <FilterChips />
      <ListingsGrid listings={listings} />
      <Pagination />
    </main>
  </div>
  
  {/* Sticky CTA */}
  <StickyCTA />
</div>
```

---

**Next Steps:**
1. Create missing components (SectionHeader, Grid, SidebarRail)
2. Refactor duplicate widgets
3. Apply layout standards to blog/news/listing pages
4. Test for CLS and hydration issues
