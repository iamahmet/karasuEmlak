#!/usr/bin/env tsx
/**
 * Import top priority blog articles from production
 * 
 * Imports the most important blog articles (priority 0.9+) from diff report
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { importContentList } from './import-blog-content';

const DIFF_FILE = path.join(process.cwd(), 'scripts/parity/diff-report.json');
const PROD_BASE_URL = 'https://www.karasuemlak.net';

async function importTopBlogs() {
  console.log('📥 Importing Top Priority Blog Articles\n');
  
  // Load diff report
  const diffData = JSON.parse(await fs.readFile(DIFF_FILE, 'utf-8'));
  
  // Filter blog articles with priority >= 0.9
  const topBlogs = diffData.missing
    .filter((entry: any) => entry.type === 'blog' && (entry.priority || 0) >= 0.9)
    .slice(0, 20) // Import top 20
    .map((entry: any) => ({
      url: entry.url.replace(PROD_BASE_URL, ''),
      type: 'blog' as const,
    }));
  
  console.log(`Found ${topBlogs.length} high-priority blog articles to import\n`);
  
  // Import them
  const result = await importContentList(topBlogs);
  
  console.log(`\n✅ Import Summary:`);
  console.log(`   Imported: ${result.imported}`);
  console.log(`   Failed: ${result.failed}`);
  
  return result;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importTopBlogs().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { importTopBlogs };
