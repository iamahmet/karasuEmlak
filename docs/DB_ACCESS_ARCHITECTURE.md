# Database Access Architecture

**Date:** 2025-01-06  
**Status:** Phase 1 - In Progress  
**Purpose:** Document the standardized data access layer

---

## 🎯 Core Principles

1. **Single Source of Truth**: All database access goes through `lib/supabase/clients.ts`
2. **Repository Pattern**: All table operations go through `lib/db/*.ts` repositories
3. **Client Type Declaration**: Each repository function declares which client it uses (anon/service)
4. **RLS Enforcement**: Anon clients respect RLS, service clients bypass RLS
5. **Type Safety**: All functions return typed results
6. **Error Handling**: Consistent error logging with requestId

---

## 📁 File Structure

```
apps/web/lib/
├── supabase/
│   ├── clients.ts          # Single source of truth for client creation
│   ├── client.ts           # Browser client (legacy - will be deprecated)
│   └── server.ts           # Server client (legacy - will be deprecated)
└── db/
    ├── listings.ts         # Listings repository
    ├── articles.ts         # Articles repository
    ├── news.ts             # News articles repository
    ├── neighborhoods.ts    # Neighborhoods repository
    ├── qa.ts               # Q&A entries repository
    └── content.ts          # Content items repository
```

---

## 🔌 Client Creation (`lib/supabase/clients.ts`)

### Functions

#### `createAnonClient()`
- **Usage**: Browser/client-side components
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **RLS**: Enforced - only sees published/approved data
- **Returns**: `SupabaseClient`

#### `createAnonServerClient()`
- **Usage**: Server components, server actions with session management
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **RLS**: Enforced - only sees published/approved data
- **Returns**: `Promise<SupabaseClient>`

#### `createServiceClient()`
- **Usage**: Admin API routes, server-side operations requiring full access
- **Key**: `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- **RLS**: Bypassed - sees ALL data
- **Returns**: `SupabaseClient`
- **WARNING**: Never use in client-side code

---

## 📚 Repository Pattern (`lib/db/*.ts`)

### Standard Structure

Each repository file follows this pattern:

```typescript
/**
 * [Table] Repository
 * 
 * Client Type Declaration:
 * - anon: Public reads (published/approved only)
 * - service: Admin operations (all data)
 */

import { createAnonClient, createServiceClient } from '@/lib/supabase/clients';

// Public functions (anon client)
export async function get[Table]s(...): Promise<[Table][]> {
  const supabase = createAnonClient();
  // ... query with RLS
}

// Admin functions (service client)
export async function get[Table]sAdmin(...): Promise<[Table][]> {
  const supabase = createServiceClient();
  // ... query without RLS
}

// CRUD operations (service client only)
export async function create[Table](...): Promise<[Table]> { ... }
export async function update[Table](...): Promise<[Table]> { ... }
export async function delete[Table](...): Promise<void> { ... }
```

### Implemented Repositories

#### ✅ `lib/db/listings.ts`
- `getListings()` - Public reads (published, available, not deleted)
- `getListingsAdmin()` - Admin reads (all data)
- `getListingBySlug()` - Public single listing
- `getListingBySlugAdmin()` - Admin single listing
- `createListing()` - Create listing
- `updateListing()` - Update listing
- `deleteListing()` - Soft delete listing
- `getListingCounts()` - Admin statistics

#### ✅ `lib/db/qa.ts`
- `getQAEntries()` - Public reads (all entries)
- `getQAEntriesAdmin()` - Admin reads
- `createQAEntry()` - Create entry
- `updateQAEntry()` - Update entry
- `deleteQAEntry()` - Delete entry

#### ⏳ `lib/db/articles.ts` (Pending)
- `getArticles()` - Public reads (published only)
- `getArticlesAdmin()` - Admin reads
- `getArticleBySlug()` - Public single article
- `getArticleBySlugAdmin()` - Admin single article
- CRUD operations

#### ⏳ `lib/db/news.ts` (Pending)
- `getNewsArticles()` - Public reads (published only)
- `getNewsArticlesAdmin()` - Admin reads
- `getNewsArticleBySlug()` - Public single article
- CRUD operations

#### ⏳ `lib/db/neighborhoods.ts` (Pending)
- `getNeighborhoods()` - Public reads (published, not deleted)
- `getNeighborhoodsAdmin()` - Admin reads
- `getNeighborhoodBySlug()` - Public single neighborhood
- CRUD operations

#### ⏳ `lib/db/content.ts` (Pending)
- `getContentItems()` - Public reads (published only)
- `getContentItemsAdmin()` - Admin reads
- CRUD operations

---

## 🔄 Migration Plan

### Step 1: Replace Direct Client Creation
- [ ] Replace `createClient` from `@supabase/supabase-js` with `createAnonClient()` or `createServiceClient()`
- [ ] Replace `createServiceClient` from `@karasu/lib/supabase/service` with `createServiceClient()` from `clients.ts`
- [ ] Update all API routes to use repository functions

### Step 2: Replace Ad-Hoc Queries
- [ ] Replace direct `.from('listings')` queries with `getListings()`, `getListingBySlug()`, etc.
- [ ] Replace direct `.from('articles')` queries with repository functions
- [ ] Replace direct `.from('neighborhoods')` queries with repository functions
- [ ] Replace direct `.from('qa_entries')` queries with repository functions

### Step 3: Update Legacy Files
- [ ] Deprecate `lib/supabase/client.ts` (browser client)
- [ ] Deprecate `lib/supabase/server.ts` (server client)
- [ ] Update `lib/supabase/queries/*.ts` to use repository pattern or mark as deprecated

---

## 📋 Usage Examples

### Public Read (Anon Client)
```typescript
import { getListings } from '@/lib/db/listings';

// In a server component or API route
const { listings, total } = await getListings({
  status: 'satilik',
  property_type: 'villa',
}, {
  field: 'created_at',
  order: 'desc',
}, 20, 0);
```

### Admin Read (Service Client)
```typescript
import { getListingsAdmin } from '@/lib/db/listings';

// In an admin API route
const { listings, total } = await getListingsAdmin();
// Returns ALL listings, including unpublished/deleted
```

### Create/Update (Service Client Only)
```typescript
import { createListing, updateListing } from '@/lib/db/listings';

// In an admin API route
const listing = await createListing({
  title: 'Beautiful Villa',
  slug: 'beautiful-villa',
  // ... other fields
});

await updateListing(listing.id, {
  published: true,
});
```

---

## ✅ Benefits

1. **Consistency**: All database access follows the same pattern
2. **Type Safety**: Typed interfaces for all operations
3. **RLS Enforcement**: Clear separation between public and admin access
4. **Error Handling**: Consistent error logging and handling
5. **Maintainability**: Single place to update query logic
6. **Testability**: Easy to mock repositories for testing

---

## 🚨 Rules

1. **NEVER** use `createServiceClient()` in client-side code
2. **NEVER** expose service role key to browser
3. **ALWAYS** use repository functions instead of direct Supabase queries
4. **ALWAYS** declare which client type a function uses (anon/service)
5. **ALWAYS** filter by `published = true` and `deleted_at IS NULL` for anon clients

---

**End of Architecture Document**
