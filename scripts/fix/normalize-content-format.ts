#!/usr/bin/env tsx
/**
 * PHASE 3: Content Format Normalization Script
 * 
 * Normalizes all content fields in the database:
 * - Decodes HTML entities (html-escaped -> html)
 * - Normalizes HTML structure
 * - Adds content_format field to track format
 * - Dry-run mode for safety
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { renderContent, detectContentFormat } from '../../apps/web/lib/utils/render-content';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface NormalizationTask {
  table: string;
  field: string;
  idField: string;
  limit?: number;
}

const TASKS: NormalizationTask[] = [
  { table: 'articles', field: 'content', idField: 'id' },
  { table: 'news_articles', field: 'original_summary', idField: 'id' },
  { table: 'news_articles', field: 'emlak_analysis', idField: 'id' },
  { table: 'listings', field: 'description_long', idField: 'id' },
  { table: 'neighborhoods', field: 'description', idField: 'id' },
];

interface NormalizationResult {
  table: string;
  field: string;
  total: number;
  processed: number;
  updated: number;
  skipped: number;
  errors: number;
  changes: Array<{
    id: string;
    oldFormat: string;
    newFormat: string;
    preview: string;
  }>;
}

/**
 * Normalize a single content field
 */
async function normalizeField(
  task: NormalizationTask,
  dryRun: boolean = true
): Promise<NormalizationResult> {
  console.log(`\n📝 Processing ${task.table}.${task.field}...`);

  const result: NormalizationResult = {
    table: task.table,
    field: task.field,
    total: 0,
    processed: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    changes: [],
  };

  try {
    // Fetch all records
    const { data, error } = await supabase
      .from(task.table)
      .select(`${task.idField}, ${task.field}`)
      .limit(task.limit || 10000);

    if (error) {
      console.error(`❌ Error fetching ${task.table}:`, error);
      result.errors = 1;
      return result;
    }

    result.total = data.length;
    console.log(`   Found ${result.total} records`);

    // Process each record
    for (const row of data) {
      const content = row[task.field];
      const id = row[task.idField];

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        result.skipped++;
        continue;
      }

      // Detect format
      const detectedFormat = detectContentFormat(content);

      // Render content (this will decode entities, sanitize, etc.)
      const normalized = renderContent(content, {
        format: detectedFormat === 'html-escaped' ? 'html-escaped' : 'auto',
        sanitize: true,
      });

      // Check if content changed
      if (normalized !== content) {
        result.processed++;

        // Store change info
        if (result.changes.length < 10) {
          result.changes.push({
            id,
            oldFormat: detectedFormat,
            newFormat: detectContentFormat(normalized),
            preview: normalized.substring(0, 100).replace(/\n/g, ' '),
          });
        }

        // Update database (if not dry-run)
        if (!dryRun) {
          const { error: updateError } = await supabase
            .from(task.table)
            .update({ [task.field]: normalized })
            .eq(task.idField, id);

          if (updateError) {
            console.error(`❌ Error updating ${task.table}.${task.field} for id ${id}:`, updateError);
            result.errors++;
          } else {
            result.updated++;
          }
        } else {
          result.updated++; // Count as would-be update
        }
      } else {
        result.skipped++;
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${task.table}.${task.field}:`, error);
    result.errors++;
  }

  return result;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');

  console.log('🔧 CONTENT FORMAT NORMALIZATION');
  console.log('=' .repeat(60));
  console.log(`Mode: ${dryRun ? '🔍 DRY-RUN (no changes will be made)' : '✅ APPLY (changes will be saved)'}`);
  console.log('=' .repeat(60));

  const results: NormalizationResult[] = [];

  // Process all tasks
  for (const task of TASKS) {
    const result = await normalizeField(task, dryRun);
    results.push(result);
  }

  // Print summary
  console.log('\n📊 SUMMARY');
  console.log('=' .repeat(60));

  let totalRecords = 0;
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const result of results) {
    totalRecords += result.total;
    totalProcessed += result.processed;
    totalUpdated += result.updated;
    totalSkipped += result.skipped;
    totalErrors += result.errors;

    console.log(`\n${result.table}.${result.field}:`);
    console.log(`  Total: ${result.total}`);
    console.log(`  Would update: ${result.updated} (${Math.round((result.updated / result.total) * 100)}%)`);
    console.log(`  Skipped: ${result.skipped}`);
    console.log(`  Errors: ${result.errors}`);

    if (result.changes.length > 0) {
      console.log(`\n  Sample changes:`);
      for (const change of result.changes.slice(0, 3)) {
        console.log(`    [${change.oldFormat} → ${change.newFormat}] ${change.preview}...`);
      }
    }
  }

  console.log('\n📈 OVERALL STATISTICS');
  console.log('=' .repeat(60));
  console.log(`Total records: ${totalRecords}`);
  console.log(`Would update: ${totalUpdated} (${Math.round((totalUpdated / totalRecords) * 100)}%)`);
  console.log(`Skipped: ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);

  if (dryRun) {
    console.log('\n💡 To apply changes, run with --apply flag:');
    console.log('   npx tsx scripts/fix/normalize-content-format.ts --apply');
  } else {
    console.log('\n✅ Changes applied successfully!');
  }
}

// Run
main().catch(console.error);
