# Cloudinary Image Optimization System

Bu sistem, Cloudinary görsellerini otomatik olarak optimize eder ve performansı artırır.

## Özellikler

- ✅ Otomatik format seçimi (WebP/AVIF)
- ✅ Responsive görseller
- ✅ Lazy loading
- ✅ Blur placeholder'lar
- ✅ Hata yönetimi
- ✅ Otomatik boyutlandırma
- ✅ Pre-configured component'ler

## Kullanım

### OptimizedImage Component

Temel optimize edilmiş görsel component'i:

```tsx
import { OptimizedImage } from '@/components/images';

<OptimizedImage
  publicId="listing/image-1"
  alt="İlan görseli"
  width={800}
  height={600}
  priority={false}
  loading="lazy"
/>
```

### Pre-configured Components

Farklı kullanım senaryoları için hazır component'ler:

```tsx
import { ListingImage, CardImage, HeroImage, ThumbnailImage, GalleryImage } from '@/components/images';

// İlan kartı için
<ListingImage publicId="..." alt="..." />

// Genel kart için
<CardImage publicId="..." alt="..." />

// Hero/banner için
<HeroImage publicId="..." alt="..." />

// Thumbnail için
<ThumbnailImage publicId="..." alt="..." />

// Galeri için
<GalleryImage publicId="..." alt="..." />
```

### LazyImage Component

Intersection Observer ile lazy loading:

```tsx
import { LazyImage } from '@/components/images';

<LazyImage
  publicId="..."
  alt="..."
  width={800}
  height={600}
  threshold={0.1}
  rootMargin="50px"
/>
```

### useImageOptimization Hook

Görsel optimizasyonu için hook:

```tsx
import { useImageOptimization } from '@/hooks/useImageOptimization';

const { imageUrl, blurPlaceholder, isLoading, error } = useImageOptimization({
  publicId: 'listing/image-1',
  width: 800,
  height: 600,
});
```

## Utility Functions

### getOptimizedCloudinaryUrl

Optimize edilmiş Cloudinary URL'i oluşturur:

```tsx
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';

const url = getOptimizedCloudinaryUrl('listing/image-1', {
  width: 800,
  height: 600,
  quality: 'auto',
  format: 'auto',
});
```

### Image Helpers

Yaygın kullanım senaryoları için helper fonksiyonlar:

```tsx
import {
  getListingCardImageUrl,
  getListingDetailImageUrl,
  getArticleImageUrl,
  getThumbnailImageUrl,
  getHeroImageUrl,
} from '@/lib/cloudinary/image-helpers';

const cardUrl = getListingCardImageUrl('listing/image-1');
const detailUrl = getListingDetailImageUrl('listing/image-1', 0);
const articleUrl = getArticleImageUrl('article/image-1', true);
```

## Otomatik Optimizasyonlar

1. **Format Seçimi**: Cloudinary otomatik olarak tarayıcının desteklediği en iyi formatı seçer (WebP/AVIF)
2. **Boyutlandırma**: Responsive breakpoint'lere göre otomatik boyutlandırma
3. **Kalite**: Otomatik kalite optimizasyonu
4. **Lazy Loading**: Görseller viewport'a girdiğinde yüklenir
5. **Placeholder**: Blur placeholder'lar ile daha iyi UX

## Best Practices

1. Her zaman `alt` text kullanın
2. `priority={true}` sadece above-the-fold görseller için
3. Responsive `sizes` attribute'unu doğru ayarlayın
4. Fallback görselleri sağlayın
5. Görsel boyutlarını doğru belirtin

