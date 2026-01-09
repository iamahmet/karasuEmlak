# Cloudinary Best Practices & Automation Guide

**Date:** 2025-01-27  
**Status:** ✅ Complete

---

## SUMMARY

Comprehensive guide for Cloudinary integration, optimization, and automation in the KarasuEmlak project.

---

## CURRENT INTEGRATION STATUS

### ✅ Existing Infrastructure

1. **Cloudinary Client** (`packages/lib/cloudinary/client.ts`)
   - Server-side client configuration
   - Environment variable management

2. **Optimization Utilities** (`apps/web/lib/cloudinary/optimization.ts`)
   - `getOptimizedCloudinaryUrl()` - Generate optimized URLs
   - `generateSrcSet()` - Responsive image srcsets
   - `generateBlurPlaceholder()` - Blur placeholders
   - `getResponsiveImageUrls()` - Multiple sizes

3. **AI Image Upload** (`apps/web/lib/cloudinary/ai-upload.ts`)
   - AI-generated image uploads
   - Caching and cost tracking
   - Database integration

4. **Components**
   - `OptimizedImage` - Main image component
   - Pre-configured components (ListingImage, CardImage, HeroImage, etc.)

5. **API Endpoints**
   - `/api/listings/upload-image` - Listing image uploads
   - `/api/ai/generate-image` - AI image generation

---

## BEST PRACTICES

### 1. Image Upload Strategy

#### ✅ Use Cloudinary for:
- Public-facing images (listings, articles, news)
- AI-generated images
- Optimized delivery

#### ⚠️ Current Issue:
- Admin panel uses Supabase Storage (`/api/upload/image`)
- Web app uses Cloudinary
- **Recommendation:** Standardize on Cloudinary for all image uploads

### 2. Image Optimization

#### Automatic Optimization:
```typescript
// Use auto format and quality
getOptimizedCloudinaryUrl(publicId, {
  width: 800,
  format: 'auto',  // WebP/AVIF when supported
  quality: 'auto', // Optimal quality
  crop: 'fill',
});
```

#### Responsive Images:
```typescript
// Generate srcset for responsive images
const srcSet = generateSrcSet(publicId, 800, 600);
// Result: Multiple sizes for different viewports
```

#### Blur Placeholders:
```typescript
// Generate blur placeholder for better UX
const placeholder = generateBlurPlaceholder(publicId, 20);
// Use as blurDataURL in Next.js Image component
```

### 3. Folder Structure

```
cloudinary/
├── listings/          # Property listing images
├── articles/          # Blog article images
├── news/              # News article images
├── neighborhoods/     # Neighborhood images
├── ai-generated/      # AI-generated images
└── media/             # General media assets
```

### 4. Naming Conventions

- Use descriptive public_ids: `listings/karasu-villa-123-main`
- Include entity type: `articles/ev-alim-rehberi-cover`
- Use slugs: `neighborhoods/sahil-mahallesi`

### 5. Image Sizes

#### Standard Sizes:
- **Thumbnail:** 150x150 (cards, lists)
- **Small:** 400x300 (mobile)
- **Medium:** 800x600 (tablet)
- **Large:** 1200x800 (desktop)
- **Hero:** 1920x1080 (banners)

#### Aspect Ratios:
- **Square:** 1:1 (thumbnails)
- **Landscape:** 16:9 (hero, listings)
- **Portrait:** 3:4 (profiles)

---

## AUTOMATION SCRIPTS

### 1. Image Optimization Script

**File:** `scripts/media/optimize-cloudinary-images.ts`

**Usage:**
```bash
# Dry run
tsx scripts/media/optimize-cloudinary-images.ts --dry-run

# Optimize specific folder
tsx scripts/media/optimize-cloudinary-images.ts --folder listings

# Optimize with specific format
tsx scripts/media/optimize-cloudinary-images.ts --format webp --quality 80
```

**Features:**
- Batch optimize existing images
- Format conversion (auto, webp, avif)
- Quality optimization
- Dry run mode

### 2. Migration Script

**File:** `scripts/media/migrate-supabase-to-cloudinary.ts`

**Usage:**
```bash
# Dry run
tsx scripts/media/migrate-supabase-to-cloudinary.ts --dry-run

# Migrate specific bucket
tsx scripts/media/migrate-supabase-to-cloudinary.ts --bucket content-images
```

**Features:**
- Migrate from Supabase Storage to Cloudinary
- Preserve folder structure
- Update database references (TODO)

---

## CDN BEST PRACTICES

### 1. URL Generation

#### ✅ Server-Side (Recommended):
```typescript
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';

const url = getOptimizedCloudinaryUrl(publicId, {
  width: 800,
  format: 'auto',
  quality: 'auto',
});
```

#### ✅ Client-Side (Alternative):
```typescript
import { getCloudinaryUrl } from '@/lib/cloudinary/utils';

const url = getCloudinaryUrl(publicId, {
  width: 800,
  format: 'auto',
});
```

### 2. Next.js Image Component

```tsx
import { OptimizedImage } from '@/components/images';

<OptimizedImage
  publicId="listings/villa-123"
  alt="Villa görseli"
  width={800}
  height={600}
  priority={false}
  loading="lazy"
/>
```

### 3. Responsive Images

```tsx
import { generateSrcSet, generateSizes } from '@/lib/cloudinary/optimization';

const srcSet = generateSrcSet(publicId, 800, 600);
const sizes = generateSizes('100vw', {
  '640px': '100vw',
  '1024px': '50vw',
});

<img
  src={baseUrl}
  srcSet={srcSet}
  sizes={sizes}
  alt="..."
/>
```

---

## PERFORMANCE OPTIMIZATION

### 1. Lazy Loading

```tsx
<OptimizedImage
  publicId="..."
  loading="lazy"  // Enable lazy loading
  priority={false}
/>
```

### 2. Priority Images

```tsx
<OptimizedImage
  publicId="..."
  priority={true}  // Above-the-fold images
  loading="eager"
/>
```

### 3. Blur Placeholders

```tsx
<OptimizedImage
  publicId="..."
  blurDataURL={generateBlurPlaceholder(publicId, 20)}
/>
```

### 4. Format Selection

- **Auto:** Cloudinary serves best format (WebP/AVIF when supported)
- **WebP:** Good balance of quality and size
- **AVIF:** Best compression (modern browsers)

---

## COST OPTIMIZATION

### 1. Caching

- Use Cloudinary's built-in CDN caching
- Set appropriate cache headers
- Use transformation URLs (cached automatically)

### 2. Image Sizes

- Don't serve larger images than needed
- Use responsive images (srcset)
- Optimize for target viewport

### 3. Format Selection

- Use `format: 'auto'` for automatic best format
- Prefer WebP/AVIF over JPEG/PNG
- Use appropriate quality settings

### 4. Storage Management

- Regular cleanup of unused images
- Archive old images
- Monitor storage usage

---

## SECURITY

### 1. Upload Restrictions

- Validate file types
- Limit file sizes
- Sanitize filenames
- Use signed uploads for sensitive content

### 2. Access Control

- Use private folders for sensitive images
- Implement signed URLs for private content
- Use Cloudinary's access control features

---

## MONITORING

### 1. Cloudinary Dashboard

- Monitor bandwidth usage
- Track storage usage
- Review transformation usage
- Check error rates

### 2. Application Logging

- Log upload failures
- Track optimization success
- Monitor CDN performance

---

## RECOMMENDATIONS

### ✅ Immediate Actions:

1. **Standardize Upload System:**
   - Migrate admin panel from Supabase Storage to Cloudinary
   - Use consistent upload endpoints
   - Update all image references

2. **Implement Automation:**
   - Run optimization script regularly
   - Set up batch processing for large migrations
   - Automate format conversion

3. **Monitor Usage:**
   - Set up Cloudinary usage alerts
   - Track bandwidth and storage
   - Optimize based on usage patterns

### 🔄 Future Improvements:

1. **Advanced Transformations:**
   - Automatic face detection
   - Smart cropping
   - Background removal

2. **Video Support:**
   - Video uploads
   - Video transformations
   - Thumbnail generation

3. **AI Integration:**
   - Automatic alt text generation
   - Image tagging
   - Content moderation

---

## FILES REFERENCED

1. `packages/lib/cloudinary/client.ts` - Cloudinary client
2. `apps/web/lib/cloudinary/optimization.ts` - Optimization utilities
3. `apps/web/lib/cloudinary/ai-upload.ts` - AI image uploads
4. `apps/web/components/images/OptimizedImage.tsx` - Image component
5. `scripts/media/optimize-cloudinary-images.ts` - Optimization script
6. `scripts/media/migrate-supabase-to-cloudinary.ts` - Migration script

---

**Status:** ✅ Cloudinary Best Practices Documented  
**Next:** Implement standardization or continue with Phase 8
