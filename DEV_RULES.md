# Development Rules - KarasuEmlak v4

## 🚫 NEVER Do These

### Root Layout (`apps/web/app/layout.tsx`)
- ❌ NO Supabase calls
- ❌ NO analytics loading
- ❌ NO consent logic
- ❌ NO widgets
- ❌ NO AI logic
- ❌ NO database queries
- ✅ ONLY: `<html>`, `<body>`, fonts, theme classes

### Middleware (`apps/web/middleware.ts`)
- ❌ NO fetch
- ❌ NO database
- ❌ NO auth
- ❌ NO logging
- ✅ ONLY: Routing logic (next-intl)

### Homepage (`apps/web/app/[locale]/page.tsx`)
- ❌ NO blocking data fetching
- ❌ NO operations without timeout
- ✅ ALWAYS: Use `withTimeoutAll()` for data fetching
- ✅ ALWAYS: Render with empty data if fetch fails

### Page Components
- ❌ NO heavy computations
- ❌ NO long-running operations
- ✅ MOVE: Heavy work to API routes or background scripts

## ✅ ALWAYS Do These

### Data Fetching
```typescript
// ✅ GOOD: With timeout
const data = await withTimeout(fetchData(), 3000, null);

// ❌ BAD: No timeout
const data = await fetchData();
```

### Error Handling
```typescript
// ✅ GOOD: Graceful degradation
const data = await withTimeout(fetchData(), 3000, []);
// Page renders with empty array if timeout

// ❌ BAD: Throws error
const data = await fetchData();
// Page crashes if fetch fails
```

### Health Checks
```typescript
// ✅ GOOD: Instant response
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

// ❌ BAD: Blocking operations
export async function GET() {
  await checkDatabase(); // NO!
  return NextResponse.json({ status: 'ok' });
}
```

### Dev Server
```bash
# ✅ GOOD: Clean start
npm run dev:clean:web

# ❌ BAD: Port conflicts
npm run dev
# (if port 3000 is already in use)
```

## 📋 Code Review Checklist

Before submitting PR:

- [ ] Root layout has no blocking operations
- [ ] Middleware is ultra-light (no fetch/db/auth)
- [ ] Homepage uses timeout for all data fetching
- [ ] All API routes have error handling
- [ ] Health endpoints return instantly
- [ ] No heavy work in page components
- [ ] Graceful degradation for all features
- [ ] Timeouts configured appropriately
- [ ] Error boundaries in place
- [ ] Logging for critical operations

## 🔧 Common Patterns

### Timeout Pattern
```typescript
import { withTimeout } from '@/lib/utils/timeout';

// Single promise
const data = await withTimeout(fetchData(), 3000, null);

// Multiple promises
const [data1, data2] = await withTimeoutAll([
  fetchData1(),
  fetchData2(),
], 3000, null);
```

### Graceful Degradation
```typescript
// Page renders with empty state if data fails
const listings = await withTimeout(getListings(), 3000, []);

return (
  <div>
    {listings.length > 0 ? (
      <ListingGrid listings={listings} />
    ) : (
      <EmptyState message="İlanlar yüklenemedi" />
    )}
  </div>
);
```

### Health Check Pattern
```typescript
// apps/web/app/healthz/route.ts
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: Date.now() });
}
```

### Background Work Pattern
```typescript
// ✅ GOOD: Background job
// scripts/generate-images.ts
async function generateImages() {
  // Heavy work here
}

// ❌ BAD: In page component
export default async function Page() {
  await generateImages(); // NO!
  return <div>...</div>;
}
```

## 🎯 Performance Targets

- **Dev server start**: <10 seconds
- **Homepage render**: <3 seconds (even with empty data)
- **Health check**: <100ms
- **API routes**: <10 seconds (configurable)
- **Background jobs**: No time limit (async)

## 🐛 Debugging

### Check Health
```bash
curl --max-time 2 http://localhost:3000/healthz
curl --max-time 2 http://localhost:3001/healthz
```

### Check Ports
```bash
lsof -ti:3000  # Web
lsof -ti:3001  # Admin
```

### Clean Start
```bash
npm run dev:clean:web    # Web only
npm run dev:clean:admin  # Admin only
npm run dev:clean        # Both
```

## 📚 Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [RUNBOOK.md](./RUNBOOK.md) - Operations guide
- [SEO_SYSTEM.md](./SEO_SYSTEM.md) - SEO implementation

