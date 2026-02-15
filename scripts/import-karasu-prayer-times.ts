/**
 * Import prayer times into Supabase (public.prayer_times)
 *
 * Default: dry-run (no DB writes)
 * Use --apply to upsert into DB.
 *
 * Usage:
 *   pnpm tsx scripts/import-karasu-prayer-times.ts
 *   pnpm tsx scripts/import-karasu-prayer-times.ts --apply
 *   pnpm tsx scripts/import-karasu-prayer-times.ts --apply --year=2026 --district=9803
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type ApiResponse = {
  success: boolean;
  data: Array<{
    district_id: {
      _id: string;
      name: string;
      state_id?: { _id: string; name: string; country_id?: string };
      country_id?: { _id: string; name: string };
    };
    date: string; // ISO at 00:00:00Z
    times: {
      imsak: string;
      gunes: string;
      ogle: string;
      ikindi: string;
      aksam: string;
      yatsi: string;
    };
    meta?: { source?: string };
    updated_at?: string;
  }>;
};

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const year = Number(parseArg('year') || '2026');
  const districtId = Number(parseArg('district') || '9803'); // Karasu

  const url = `https://ezanvakti.imsakiyem.com/api/prayer-times/${districtId}/yearly?year=${year}`;
  console.log(`[prayer_times] Fetching: ${url}`);

  const res = await fetch(url, { headers: { 'User-Agent': 'KarasuEmlak/1.0' } });
  if (!res.ok) {
    throw new Error(`[prayer_times] Failed to fetch: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as ApiResponse;
  if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
    throw new Error('[prayer_times] Unexpected response payload');
  }

  const rows = json.data.map((d) => {
    const date = new Date(d.date).toISOString().slice(0, 10); // YYYY-MM-DD
    const state = d.district_id?.state_id;
    const country = d.district_id?.country_id;

    return {
      district_id: Number(d.district_id?._id || districtId),
      district_name: d.district_id?.name || null,
      state_id: state?._id ? Number(state._id) : null,
      state_name: state?.name || null,
      country_id: country?._id ? Number(country._id) : null,
      country_name: country?.name || null,
      date,
      imsak: d.times.imsak,
      gunes: d.times.gunes,
      ogle: d.times.ogle,
      ikindi: d.times.ikindi,
      aksam: d.times.aksam,
      yatsi: d.times.yatsi,
      source: 'imsakiyem_diyanet',
      fetched_at: new Date().toISOString(),
      updated_at: d.updated_at || new Date().toISOString(),
    };
  });

  console.log(`[prayer_times] Prepared ${rows.length} rows for district ${districtId}, year ${year}.`);
  console.log(`[prayer_times] First:`, rows[0]);
  console.log(`[prayer_times] Last:`, rows[rows.length - 1]);

  if (!apply) {
    console.log('[prayer_times] Dry-run. Pass --apply to upsert into Supabase.');
    return;
  }

  // Upsert in chunks to avoid payload limits.
  const chunkSize = 250;
  let upserted = 0;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('prayer_times')
      .upsert(chunk, { onConflict: 'district_id,date' });

    if (error) {
      throw new Error(`[prayer_times] Upsert failed: ${error.message}`);
    }
    upserted += chunk.length;
    console.log(`[prayer_times] Upserted ${upserted}/${rows.length}...`);
  }

  console.log(`[prayer_times] Done. Upserted ${upserted} rows.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

