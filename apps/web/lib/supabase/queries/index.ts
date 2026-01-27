export * from './listings';
export * from './articles';
export * from './news';
export * from './neighborhoods';
export * from './qa';

// Compatibility wrapper for getNeighborhoods (returns string[] for legacy usage)
// İlan/mahalle yok veya DB hata verirse boş dizi; sayfa 404/500 vermesin.
export async function getNeighborhoods(): Promise<string[]> {
  try {
    const { getNeighborhoods: getNeighborhoodsFromDb } = await import('@/lib/db/neighborhoods');
    const result = await getNeighborhoodsFromDb();
    const names = (result?.neighborhoods ?? []).map((n) => n?.name).filter((x): x is string => typeof x === 'string' && x.length > 0);
    return names;
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[getNeighborhoods] Fallback to []:', (e as Error)?.message);
    }
    return [];
  }
}

