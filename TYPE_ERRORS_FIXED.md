# ✅ Type Errors Fixed

## Fixed Issues

1. ✅ `getNewsArticles` import - Changed from `@/lib/db/news` to `@/lib/supabase/queries/news` in:
   - `apps/web/app/[locale]/karasu/gezilecek-yerler/page.tsx`
   - `apps/web/app/[locale]/karasu/restoranlar/page.tsx`

2. ✅ `size_m2` property - Changed to `listing.features?.sizeM2` in:
   - `apps/web/app/[locale]/ilan/[slug]/page.tsx`

3. ✅ `coordinates_lat/lng` - Removed (not in Neighborhood type) in:
   - `apps/web/app/[locale]/mahalle/[slug]/page.tsx`

4. ✅ `generateOrganizationSchema` - Fixed overload calls

## Remaining Issues

Check build output for any remaining type errors.
