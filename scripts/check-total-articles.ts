/**
 * Check Total Articles Count
 */

import dotenv from 'dotenv';
import { createServiceClient } from '../packages/lib/supabase/service';

dotenv.config({ path: '.env.local' });

async function checkTotalArticles() {
  const supabase = createServiceClient();
  
  const { data, count, error } = await supabase
    .from('articles')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  const published = data?.filter(a => a.status === 'published').length || 0;
  const draft = data?.filter(a => a.status === 'draft').length || 0;
  const archived = data?.filter(a => a.status === 'archived').length || 0;

  console.log('📊 Articles Summary:');
  console.log(`   Total: ${count || 0}`);
  console.log(`   Published: ${published}`);
  console.log(`   Draft: ${draft}`);
  console.log(`   Archived: ${archived}`);
}

checkTotalArticles();
