/**
 * Run Cornerstone -> Rehber category migration
 * Updates articles table: category = 'Rehber' WHERE category = 'Cornerstone'
 *
 * Usage: pnpm db:migrate-cornerstone
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {

  const { data, error } = await supabase
    .from('articles')
    .update({ category: 'Rehber' })
    .eq('category', 'Cornerstone')
    .select('id');

  if (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }

  const count = data?.length ?? 0;
  console.log(`✅ Cornerstone -> Rehber: ${count} article(s) updated`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
