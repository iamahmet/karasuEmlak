# AI Görsel Oluşturma Sistemi

Bu sistem, OpenAI DALL-E 3 kullanarak gerçekçi görseller oluşturur ve Cloudinary'ye yükler.

## Özellikler

- ✅ OpenAI DALL-E 3 entegrasyonu
- ✅ Otomatik Cloudinary upload
- ✅ Database tracking (media_assets tablosu)
- ✅ Gerçekçi emlak görselleri
- ✅ Blog/article görselleri
- ✅ Neighborhood görselleri
- ✅ Hero/banner görselleri
- ✅ Otomatik prompt optimizasyonu

## Kurulum

### 1. Environment Variables

`.env.local` dosyanıza ekleyin:

```bash
OPENAI_API_KEY=sk-...
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Kullanım

#### API Endpoint

```typescript
POST /api/ai/generate-image

{
  "type": "listing",
  "context": {
    "title": "Denize Sıfır 3+1 Daire",
    "propertyType": "daire",
    "location": "Sahil Mahallesi, Karasu",
    "status": "satilik",
    "features": {
      "seaView": true,
      "balcony": true,
      "parking": true
    }
  },
  "options": {
    "size": "1792x1024",
    "quality": "hd",
    "style": "natural"
  },
  "upload": {
    "folder": "listings",
    "entityType": "listing",
    "entityId": "listing-id",
    "alt": "Denize Sıfır 3+1 Daire",
    "tags": ["daire", "satilik"]
  }
}
```

#### Client-side Helper

```typescript
import { generateListingImage } from '@/lib/ai/image-generator';

const result = await generateListingImage({
  title: 'Denize Sıfır 3+1 Daire',
  propertyType: 'daire',
  location: 'Sahil Mahallesi, Karasu',
  status: 'satilik',
  features: {
    seaView: true,
    balcony: true,
  },
});

if (result.success) {
  console.log('Generated image:', result.public_id);
}
```

#### Component Kullanımı

```tsx
import { AIImageGenerator } from '@/components/admin/AIImageGenerator';

<AIImageGenerator
  type="listing"
  context={{
    title: "Denize Sıfır 3+1 Daire",
    propertyType: "daire",
    location: "Sahil Mahallesi, Karasu",
    status: "satilik",
  }}
  onImageGenerated={(publicId, url) => {
    console.log('Image generated:', publicId);
  }}
/>
```

## Otomatik Görsel Oluşturma Script'i

Eksik görselleri otomatik olarak oluşturmak için:

```bash
pnpm scripts:generate-images
```

Bu script:
1. Görseli olmayan ilanları tespit eder
2. Görseli olmayan blog yazılarını tespit eder
3. Görseli olmayan mahalleleri tespit eder
4. Her biri için gerçekçi görseller oluşturur
5. Cloudinary'ye yükler
6. Database'e kaydeder

## Prompt Optimizasyonu

Sistem otomatik olarak optimize edilmiş prompt'lar oluşturur:

- **Listing**: Emlak tipi, konum, özellikler, stil, zaman, mevsim
- **Article**: Başlık, kategori, içerik analizi
- **Neighborhood**: Mahalle adı, ilçe, açıklama
- **Hero**: Lüks emlak, golden hour, cinematic

## Görsel Kalitesi

- **Size**: 1792x1024 (landscape) veya 1024x1792 (portrait)
- **Quality**: HD (yüksek kalite)
- **Style**: Natural (gerçekçi) veya Vivid (canlı)
- **Format**: Otomatik (WebP/AVIF)

## Rate Limiting

OpenAI API rate limit'leri nedeniyle:
- Script'ler arasında 1 saniye bekleme
- Batch işlemlerde dikkatli olun
- Günlük limit: ~50 görsel (DALL-E 3)

## Maliyet

- DALL-E 3: ~$0.04 per image (HD, 1792x1024)
- Cloudinary: Ücretsiz tier yeterli

## Best Practices

1. **Görsel Oluşturma**: Sadece gerçekten ihtiyaç duyulan yerlerde
2. **Prompt Detayı**: Mümkün olduğunca detaylı context sağlayın
3. **Cache**: Aynı görseli tekrar oluşturmayın
4. **Quality**: HD kalite kullanın (daha iyi sonuçlar)
5. **Tags**: Cloudinary tag'leri doğru kullanın (arama için)

## Örnekler

### İlan Görseli

```typescript
const image = await generateListingImage({
  title: 'Denize Sıfır Lüks Villa',
  propertyType: 'villa',
  location: 'Yalı Mahallesi, Karasu',
  status: 'satilik',
  features: {
    seaView: true,
    parking: true,
    elevator: true,
  },
});
```

### Blog Görseli

```typescript
const image = await generateArticleImage({
  title: 'Karasu\'da Emlak Yatırımı Rehberi',
  category: 'yatirim',
  content: '...',
});
```

### Mahalle Görseli

```typescript
const image = await generateNeighborhoodImage({
  name: 'Sahil Mahallesi',
  district: 'Karasu',
  description: 'Denize yakın, modern mahalle',
});
```

## Troubleshooting

### OpenAI API Key Hatası

```
⚠️  OpenAI API key not configured for image generation
```

Çözüm: `.env.local` dosyasına `OPENAI_API_KEY` ekleyin.

### Rate Limit Hatası

```
Rate limit exceeded. Please try again later.
```

Çözüm: Birkaç dakika bekleyin veya daha az görsel oluşturun.

### Cloudinary Upload Hatası

```
Cloudinary upload failed
```

Çözüm: Cloudinary credentials'ları kontrol edin.

## Güvenlik

- API key'ler server-side only
- Rate limiting uygulanır
- Input validation yapılır
- Error handling mevcut

## Gelecek İyileştirmeler

- [ ] Batch görsel oluşturma
- [ ] Görsel varyasyonları
- [ ] Prompt önerileri
- [ ] Görsel kalite analizi
- [ ] Otomatik alt text oluşturma

