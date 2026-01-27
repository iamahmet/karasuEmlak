/**
 * Clean Broken JSON Data in Database
 * 
 * This script identifies and fixes broken JSON data in JSONB columns.
 * It handles:
 * - Invalid JSON strings stored in JSONB columns
 * - Malformed JSON that causes parse errors
 * - Empty or null values that should be default objects/arrays
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../apps/web/.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

// Create service client directly
function createServiceClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing required Supabase environment variables.\n' +
      'Required: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Safe JSON parse function (inline to avoid path issues)
function safeParseJSON<T = any>(
  value: any,
  fallback: T,
  context?: string
): T {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value !== 'string') {
    return value as T;
  }

  if (value.trim() === '') {
    return fallback;
  }

  try {
    if (typeof value === 'object' && value !== null) {
      return value as T;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return fallback;
    }
    
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return fallback;
    }
    
    // Try to clean and parse
    let cleaned = value;
    
    // Remove BOM
    if (cleaned.charCodeAt(0) === 0xFEFF) {
      cleaned = cleaned.slice(1);
    }
    
    // Remove trailing commas
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    // Remove control characters
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    // Try to find valid JSON by truncating at last valid position
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const lastValidClose = Math.max(lastBrace, lastBracket);
    
    if (lastValidClose > 0 && lastValidClose < cleaned.length - 1) {
      cleaned = cleaned.substring(0, lastValidClose + 1);
    }
    
    return JSON.parse(cleaned) as T;
  } catch (error: any) {
    // If parsing fails, return fallback
    return fallback;
  }
}

interface CleanupResult {
  table: string;
  column: string;
  totalRows: number;
  brokenRows: number;
  fixedRows: number;
  errors: string[];
}

interface JSONColumn {
  table: string;
  column: string;
  defaultValue: any; // Default value if JSON is broken
  type: 'object' | 'array'; // Expected type
}

// Define JSONB columns to check
const JSON_COLUMNS: JSONColumn[] = [
  // Listings table
  { table: 'listings', column: 'features', defaultValue: {}, type: 'object' },
  { table: 'listings', column: 'images', defaultValue: [], type: 'array' },
  { table: 'listings', column: 'virtual_tour', defaultValue: null, type: 'object' },
  { table: 'listings', column: 'video_tour', defaultValue: null, type: 'object' },
  { table: 'listings', column: 'floor_plan', defaultValue: null, type: 'object' },
  
  // Articles table
  { table: 'articles', column: 'internal_links', defaultValue: [], type: 'array' },
  
  // Media assets table
  { table: 'media_assets', column: 'transformations', defaultValue: {}, type: 'object' },
];

/**
 * Check if a JSONB value is valid
 */
function isValidJSON(value: any): boolean {
  if (value === null || value === undefined) {
    return true; // null is valid for JSONB
  }
  
  // If it's already an object/array, it's valid
  if (typeof value === 'object') {
    return true;
  }
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }
  
  return false;
}

/**
 * Clean a single JSONB column in a table
 */
async function cleanJSONColumn(
  supabase: any,
  table: string,
  column: string,
  defaultValue: any,
  type: 'object' | 'array'
): Promise<CleanupResult> {
  const result: CleanupResult = {
    table,
    column,
    totalRows: 0,
    brokenRows: 0,
    fixedRows: 0,
    errors: [],
  };

  try {
    console.log(`\n🔍 Checking ${table}.${column}...`);

    // Get all rows (we'll check JSON validity in memory)
    // Use raw SQL to check for string values in JSONB columns
    const { data: rows, error: fetchError } = await supabase
      .from(table)
      .select(`id, ${column}`)
      .limit(10000); // Process in batches if needed

    if (fetchError) {
      result.errors.push(`Failed to fetch rows: ${fetchError.message}`);
      return result;
    }

    if (!rows || rows.length === 0) {
      console.log(`  ✅ No rows found`);
      return result;
    }

    result.totalRows = rows.length;
    console.log(`  📊 Found ${result.totalRows} rows`);

    // Find broken JSON rows
    const brokenRows: Array<{ id: string; value: any }> = [];
    
    for (const row of rows) {
      const value = row[column];
      
      // Skip null/undefined (valid for JSONB)
      if (value === null || value === undefined) {
        continue;
      }
      
      // If it's already an object/array, it's valid JSONB
      if (typeof value === 'object') {
        // Double-check: if it's an object but has string properties that look like JSON
        // This shouldn't happen with JSONB, but let's be safe
        continue;
      }
      
      // If it's a string, it might be stored as text instead of JSONB
      // This is the problematic case - JSONB should never return strings
      if (typeof value === 'string') {
        console.log(`  ⚠️  Found string value in JSONB column for row ${row.id}, length: ${value.length}`);
        brokenRows.push({ id: row.id, value });
        result.brokenRows++;
        continue;
      }
      
      // Check if JSON is invalid
      if (!isValidJSON(value)) {
        brokenRows.push({ id: row.id, value });
        result.brokenRows++;
      }
    }

    if (brokenRows.length === 0) {
      console.log(`  ✅ All JSON values are valid`);
      return result;
    }

    console.log(`  ⚠️  Found ${brokenRows.length} rows with broken JSON`);

    // Try to fix broken JSON
    const updates: Array<{ id: string; newValue: any }> = [];
    
    for (const brokenRow of brokenRows) {
      let newValue = defaultValue;
      
      // Try to parse and fix if it's a string
      if (typeof brokenRow.value === 'string') {
        const cleaned = safeParseJSON(brokenRow.value, defaultValue, `${table}.${column}`);
        
        // Validate the cleaned value matches expected type
        if (type === 'array' && !Array.isArray(cleaned)) {
          newValue = defaultValue;
        } else if (type === 'object' && Array.isArray(cleaned)) {
          newValue = defaultValue;
        } else {
          newValue = cleaned;
        }
      }
      
      updates.push({ id: brokenRow.id, newValue });
    }

    // Update rows in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE);
      
      for (const update of batch) {
        const { error: updateError } = await supabase
          .from(table)
          .update({ [column]: update.newValue })
          .eq('id', update.id);

        if (updateError) {
          result.errors.push(`Failed to update row ${update.id}: ${updateError.message}`);
        } else {
          result.fixedRows++;
        }
      }
      
      console.log(`  🔧 Updated ${Math.min(i + BATCH_SIZE, updates.length)}/${updates.length} rows...`);
    }

    console.log(`  ✅ Fixed ${result.fixedRows} rows`);
    
  } catch (error: any) {
    result.errors.push(`Unexpected error: ${error.message}`);
    console.error(`  ❌ Error cleaning ${table}.${column}:`, error);
  }

  return result;
}

/**
 * Main cleanup function
 */
async function main() {
  console.log('🧹 Starting JSON cleanup process...\n');
  
  const supabase = createServiceClient();
  const results: CleanupResult[] = [];
  let totalBroken = 0;
  let totalFixed = 0;

  // Clean each JSON column
  for (const jsonColumn of JSON_COLUMNS) {
    const result = await cleanJSONColumn(
      supabase,
      jsonColumn.table,
      jsonColumn.column,
      jsonColumn.defaultValue,
      jsonColumn.type
    );
    
    results.push(result);
    totalBroken += result.brokenRows;
    totalFixed += result.fixedRows;
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 CLEANUP SUMMARY');
  console.log('='.repeat(60));
  
  for (const result of results) {
    if (result.brokenRows > 0 || result.errors.length > 0) {
      console.log(`\n${result.table}.${result.column}:`);
      console.log(`  Total rows: ${result.totalRows}`);
      console.log(`  Broken rows: ${result.brokenRows}`);
      console.log(`  Fixed rows: ${result.fixedRows}`);
      
      if (result.errors.length > 0) {
        console.log(`  Errors: ${result.errors.length}`);
        result.errors.forEach(err => console.log(`    - ${err}`));
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Total broken JSON rows found: ${totalBroken}`);
  console.log(`Total rows fixed: ${totalFixed}`);
  console.log('='.repeat(60));

  if (totalFixed > 0) {
    console.log('\n✅ Cleanup completed successfully!');
  } else if (totalBroken === 0) {
    console.log('\n✅ No broken JSON found - database is clean!');
  } else {
    console.log('\n⚠️  Some rows could not be fixed. Check errors above.');
  }
}

// Run the cleanup
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
