/**
 * Script to normalize blog categories
 * Run with: pnpm tsx scripts/normalize-blog-categories.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { normalizeCategoryName } from '../apps/web/lib/utils/category-utils';

// Load environment variables
const envPaths = [
  resolve(__dirname, '../.env.local'),
  resolve(__dirname, '../../.env.local'),
  resolve(process.cwd(), '.env.local'),
];

for (const envPath of envPaths) {
  try {
    dotenv.config({ path: envPath });
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      break;
    }
  } catch {
    // Continue to next path
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function normalizeCategories() {
  console.log('🚀 Starting blog category normalization...\n');

  // Get all articles
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, category')
    .not('category', 'is', null);

  if (error) {
    console.error('❌ Error fetching articles:', error);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('ℹ️  No articles with categories found.');
    return;
  }

  console.log(`📝 Found ${articles.length} articles with categories\n`);

  let updatedCount = 0;
  let unchangedCount = 0;

  for (const article of articles) {
    const originalCategory = article.category;
    const normalizedCategory = normalizeCategoryName(originalCategory);

    if (!normalizedCategory) {
      console.log(`⚠️  Article "${article.title}" has invalid category, skipping...`);
      continue;
    }

    if (originalCategory === normalizedCategory) {
      unchangedCount++;
      continue;
    }

    // Update article with normalized category
    const { error: updateError } = await supabase
      .from('articles')
      .update({ category: normalizedCategory })
      .eq('id', article.id);

    if (updateError) {
      console.error(`❌ Error updating article "${article.title}":`, updateError);
      continue;
    }

    console.log(`✅ Updated: "${article.title}"`);
    console.log(`   "${originalCategory}" → "${normalizedCategory}"\n`);
    updatedCount++;

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Updated: ${updatedCount} articles`);
  console.log(`⏭️  Unchanged: ${unchangedCount} articles`);
  console.log(`📝 Total: ${articles.length} articles\n`);

  if (updatedCount > 0) {
    console.log('🎉 Category normalization completed!');
  } else {
    console.log('ℹ️  All categories are already normalized.');
  }
}

// Run the script
normalizeCategories()
  .then(() => {
    console.log('\n✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
