/**
 * Script to standardize blog categories to predefined standard categories
 * Run with: pnpm tsx scripts/standardize-blog-categories.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

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

/**
 * Category mapping: non-standard categories to standard categories
 */
const CATEGORY_MAPPING: Record<string, string> = {
  // Blog variations
  'blog': 'Emlak',
  'Blog': 'Emlak',
  
  // Rehber variations
  'rehber': 'Rehber',
  'Rehber': 'Rehber',
  
  // Yatırım variations
  'yatirim': 'Yatırım',
  'Yatirim': 'Yatırım',
  'Yatırım Rehberi': 'Yatırım',
  'Yatırım rehberi': 'Yatırım',
  'yatırım': 'Yatırım',
  
  // Sağlık variations
  'sağlık': 'Sağlık',
  'Sağlık': 'Sağlık',
  
  // Piyasa Analizi variations
  'Piyasa Analizi': 'Piyasa Analizi',
  'Piyasa analizi': 'Piyasa Analizi',
  'piyasa-analizi': 'Piyasa Analizi',
  
  // Cornerstone - keep as is or map to Rehber
  'cornerstone': 'Rehber',
  'Cornerstone': 'Rehber',
};

/**
 * Standard categories
 */
const STANDARD_CATEGORIES = [
  'Yatırım',
  'Sağlık',
  'Emlak',
  'Rehber',
  'Piyasa Analizi',
  'Mahalle Rehberi',
  'Haberler',
];

function mapToStandardCategory(category: string | null): string | null {
  if (!category) return null;
  
  const trimmed = category.trim();
  if (!trimmed) return null;
  
  // Check mapping first
  if (CATEGORY_MAPPING[trimmed]) {
    return CATEGORY_MAPPING[trimmed];
  }
  
  // Case-insensitive check
  const lowerTrimmed = trimmed.toLowerCase();
  for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
    if (key.toLowerCase() === lowerTrimmed) {
      return value;
    }
  }
  
  // Check if it matches a standard category (case-insensitive)
  for (const standard of STANDARD_CATEGORIES) {
    if (standard.toLowerCase() === lowerTrimmed) {
      return standard;
    }
  }
  
  // If no match, capitalize first letter and return
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

async function standardizeCategories() {
  console.log('🚀 Starting blog category standardization...\n');

  // Get all articles with categories
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
  const categoryChanges: Record<string, { from: string; to: string; count: number }> = {};

  for (const article of articles) {
    const originalCategory = article.category;
    const standardCategory = mapToStandardCategory(originalCategory);

    if (!standardCategory) {
      console.log(`⚠️  Article "${article.title}" has invalid category, skipping...`);
      continue;
    }

    if (originalCategory === standardCategory) {
      unchangedCount++;
      continue;
    }

    // Track category changes
    const changeKey = `${originalCategory} → ${standardCategory}`;
    if (!categoryChanges[changeKey]) {
      categoryChanges[changeKey] = {
        from: originalCategory,
        to: standardCategory,
        count: 0,
      };
    }
    categoryChanges[changeKey].count++;

    // Update article with standard category
    const { error: updateError } = await supabase
      .from('articles')
      .update({ category: standardCategory })
      .eq('id', article.id);

    if (updateError) {
      console.error(`❌ Error updating article "${article.title}":`, updateError);
      continue;
    }

    updatedCount++;

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Updated: ${updatedCount} articles`);
  console.log(`⏭️  Unchanged: ${unchangedCount} articles`);
  console.log(`📝 Total: ${articles.length} articles\n`);

  if (Object.keys(categoryChanges).length > 0) {
    console.log('📋 Category Changes:');
    Object.values(categoryChanges)
      .sort((a, b) => b.count - a.count)
      .forEach((change) => {
        console.log(`   "${change.from}" → "${change.to}": ${change.count} articles`);
      });
    console.log('');
  }

  if (updatedCount > 0) {
    console.log('🎉 Category standardization completed!');
  } else {
    console.log('ℹ️  All categories are already standardized.');
  }
}

// Run the script
standardizeCategories()
  .then(() => {
    console.log('\n✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
