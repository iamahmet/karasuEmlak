export * from './listings';
export * from './articles';
export * from './news';
export * from './neighborhoods';
export * from './qa';

// Compatibility wrapper for getNeighborhoods (returns string[] for legacy usage)
export async function getNeighborhoods(): Promise<string[]> {
  const { getNeighborhoods: getNeighborhoodsFromDb } = await import('@/lib/db/neighborhoods');
  const result = await getNeighborhoodsFromDb();
  return result.neighborhoods.map(n => n.name);
}

