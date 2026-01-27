/**
 * Wraps a Supabase/PostgREST call and retries once after 2s on PGRST205
 * (schema cache is stale). Use for critical reads in server components.
 *
 * Example:
 *   const { data } = await withPostgRESTRetry(() =>
 *     supabase.from('articles').select('id,title').limit(10)
 *   );
 */
export async function withPostgRESTRetry<T>(fn: () => Promise<{ data: T; error: { code?: string; message?: string } | null }>): Promise<{ data: T; error: { code?: string; message?: string } | null }> {
  const out = await fn();
  if (out.error && (out.error.code === "PGRST205" || /schema cache is stale/i.test(out.error.message || ""))) {
    await new Promise((r) => setTimeout(r, 2000));
    return fn();
  }
  return out;
}
