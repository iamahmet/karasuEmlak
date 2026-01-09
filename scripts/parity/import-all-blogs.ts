#!/usr/bin/env tsx
/**
 * Import all missing blog articles from production
 * 
 * Imports all blog articles from diff report in batches
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { importContentList } from './import-blog-content';

const DIFF_FILE = path.join(process.cwd(), 'scripts/parity/diff-report.json');
const PROD_BASE_URL = 'https://www.karasuemlak.net';

async function importAllBlogs() {
  console.log('📥 Importing All Missing Blog Articles\n');
  
  // Load diff report
  const diffData = JSON.parse(await fs.readFile(DIFF_FILE, 'utf-8'));
  
  // Get all blog articles
  const allBlogs = diffData.missing
    .filter((entry: any) => entry.type === 'blog')
    .map((entry: any) => ({
      url: entry.url.replace(PROD_BASE_URL, ''),
      type: 'blog' as const,
      priority: entry.priority || 0,
    }))
    .sort((a: any, b: any) => b.priority - a.priority); // Sort by priority
  
  console.log(`Found ${allBlogs.length} blog articles to import\n`);
  console.log('Importing in batches of 20...\n');
  
  let totalImported = 0;
  let totalFailed = 0;
  
  // Process in batches
  for (let i = 0; i < allBlogs.length; i += 20) {
    const batch = allBlogs.slice(i, i + 20);
    const batchNum = Math.floor(i / 20) + 1;
    const totalBatches = Math.ceil(allBlogs.length / 20);
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} articles)`);
    
    const result = await importContentList(batch);
    totalImported += result.imported;
    totalFailed += result.failed;
    
    console.log(`   Batch ${batchNum} complete: ${result.imported} imported, ${result.failed} failed`);
    
    // Small delay between batches
    if (i + 20 < allBlogs.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n✅ Final Summary:`);
  console.log(`   Total Imported: ${totalImported}`);
  console.log(`   Total Failed: ${totalFailed}`);
  console.log(`   Success Rate: ${((totalImported / allBlogs.length) * 100).toFixed(1)}%`);
  
  return { imported: totalImported, failed: totalFailed };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importAllBlogs().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { importAllBlogs };
