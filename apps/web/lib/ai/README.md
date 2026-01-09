# AI Image Generation System

## Overview

Optimized AI image generation system with rate limiting, cost control, caching, and database integration.

## Features

### 1. Rate Limiting
- **Hourly Limit**: 20 requests/hour
- **Daily Limit**: 100 requests/day
- **Cost Limit**: $10/day maximum
- Automatic retry-after headers

### 2. Cost Tracking
- DALL-E 3 pricing integration
- Per-image cost calculation
- Daily cost tracking
- Cost logging in `ai_image_generation_logs` table

### 3. Image Caching & Reuse
- Context hash-based deduplication
- Prompt hash-based reuse
- Usage count tracking
- Cache hits = $0 cost

### 4. Database Integration
- Direct storage in `media_assets` table
- AI metadata (prompt, context, cost)
- Entity relationships
- Usage tracking

## API Endpoints

### POST `/api/ai/generate-image`

Generate and upload AI image.

**Request Body:**
```json
{
  "type": "listing" | "article" | "neighborhood" | "hero" | "custom",
  "prompt": "string (for custom type)",
  "context": {
    "title": "string",
    "propertyType": "string",
    "location": "string",
    "features": {},
    "status": "satilik" | "kiralik",
    "category": "string",
    "name": "string",
    "district": "string",
    "description": "string",
    "theme": "string"
  },
  "options": {
    "size": "1024x1024" | "1792x1024" | "1024x1792",
    "quality": "standard" | "hd",
    "style": "vivid" | "natural"
  },
  "upload": {
    "folder": "string",
    "entityType": "listing" | "article" | "news" | "neighborhood" | "other",
    "entityId": "string",
    "alt": "string",
    "tags": ["string"]
  },
  "skipCache": false
}
```

**Response:**
```json
{
  "success": true,
  "cached": false,
  "public_id": "cloudinary-public-id",
  "url": "https://...",
  "width": 1792,
  "height": 1024,
  "format": "webp",
  "media_asset_id": "uuid",
  "revised_prompt": "string",
  "cost": 0.12
}
```

### GET `/api/ai/generate-image`

Get rate limit status and statistics.

**Response:**
```json
{
  "rateLimit": {
    "allowed": true,
    "reason": "string (if not allowed)",
    "retryAfter": 3600
  },
  "stats": {
    "today": {
      "count": 10,
      "success": 9,
      "failed": 1,
      "cost": 1.2
    }
  }
}
```

## Usage Examples

### Generate Listing Image
```typescript
const response = await fetch('/api/ai/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'listing',
    context: {
      title: 'Modern Daire',
      propertyType: 'daire',
      location: 'Karasu, Sakarya',
      status: 'satilik',
    },
    options: {
      size: '1792x1024',
      quality: 'hd',
    },
    upload: {
      entityType: 'listing',
      entityId: 'listing-id',
      alt: 'Modern Daire - Karasu',
    },
  }),
});
```

### Check Rate Limits
```typescript
const response = await fetch('/api/ai/generate-image');
const { rateLimit, stats } = await response.json();
```

## Database Schema

### `ai_image_generation_logs`
- `id` (UUID)
- `generation_type` (TEXT)
- `image_size` (TEXT)
- `image_quality` (TEXT)
- `cost` (NUMERIC)
- `success` (BOOLEAN)
- `error_message` (TEXT)
- `media_asset_id` (UUID)
- `prompt_hash` (TEXT)
- `context_hash` (TEXT)
- `created_at` (TIMESTAMPTZ)

### `media_assets` (Extended)
- `prompt_hash` (TEXT) - For deduplication
- `context_hash` (TEXT) - For deduplication
- `generation_cost` (NUMERIC) - Cost in USD
- `generation_metadata` (JSONB) - AI generation details
- `ai_generated` (BOOLEAN) - Flag for AI images

## Cost Calculation

DALL-E 3 Pricing (as of 2024):
- `1024x1024`: $0.04 (standard), $0.08 (hd)
- `1792x1024`: $0.08 (standard), $0.12 (hd)
- `1024x1792`: $0.08 (standard), $0.12 (hd)

## Best Practices

1. **Always check cache first** - Use `skipCache: false` by default
2. **Monitor costs** - Check `/api/ai/generate-image` GET endpoint regularly
3. **Use appropriate sizes** - Use `1024x1024` for thumbnails, `1792x1024` for hero images
4. **Provide context** - Better context = better cache hits
5. **Handle rate limits** - Check `rateLimit.allowed` before generating

## Scripts

### `scripts/generate-missing-images.ts`
Batch script to generate images for entities without images.
- Includes rate limiting
- Cache checking
- Error handling
- Progress tracking

**Usage:**
```bash
npm run scripts:generate-images
```

