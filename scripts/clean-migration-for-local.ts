#!/usr/bin/env tsx
/**
 * Clean migration file for local Supabase setup
 * Removes RLS policies, grants, and auth schema references
 * Keeps only: table creation, constraints, indexes
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const migrationFile = join(process.cwd(), 'supabase/migrations/20260104215603_remote_schema.sql');

function cleanMigration() {
  let content = readFileSync(migrationFile, 'utf-8');
  const lines = content.split('\n');
  const cleaned: string[] = [];
  
  let inTable = false;
  let inFunction = false;
  let inPolicy = false;
  let skipUntilSemicolon = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines at the start
    if (cleaned.length === 0 && !trimmed) continue;
    
    // Keep extensions
    if (trimmed.startsWith('create extension')) {
      cleaned.push(line);
      continue;
    }
    
    // Keep table creation
    if (trimmed.startsWith('create table')) {
      inTable = true;
      cleaned.push(line);
      continue;
    }
    
    // End of table creation
    if (inTable && trimmed === ');') {
      inTable = false;
      cleaned.push(line);
      cleaned.push(''); // Add blank line
      continue;
    }
    
    // Keep table content while in table
    if (inTable) {
      cleaned.push(line);
      continue;
    }
    
    // Skip RLS enable
    if (trimmed.includes('enable row level security')) {
      continue;
    }
    
    // Skip grant statements
    if (trimmed.startsWith('grant ')) {
      continue;
    }
    
    // Skip policy creation
    if (trimmed.startsWith('create policy') || trimmed.startsWith('CREATE POLICY')) {
      inPolicy = true;
      continue;
    }
    
    if (inPolicy) {
      if (trimmed.endsWith(';')) {
        inPolicy = false;
      }
      continue;
    }
    
    // Skip function creation (they often reference auth)
    if (trimmed.startsWith('create function') || trimmed.startsWith('CREATE FUNCTION') || trimmed.startsWith('create or replace function')) {
      inFunction = true;
      continue;
    }
    
    if (inFunction) {
      if (trimmed === '$$;' || trimmed === '$function$;' || (trimmed.endsWith(';') && !trimmed.includes('$'))) {
        inFunction = false;
      }
      continue;
    }
    
    // Keep constraints (but skip auth.users references)
    if (trimmed.startsWith('alter table') && trimmed.includes('add constraint')) {
      // Skip if it references auth.users
      if (trimmed.includes('auth.users') || line.includes('auth.users')) {
        // Skip this constraint and its validate
        skipUntilSemicolon = true;
        continue;
      }
      cleaned.push(line);
      continue;
    }
    
    // Skip validate constraint for auth.users foreign keys
    if (trimmed.includes('validate constraint') && (trimmed.includes('user_id_fkey') || line.includes('user_id_fkey'))) {
      continue;
    }
    
    // Keep validate constraint for others
    if (trimmed.includes('validate constraint')) {
      cleaned.push(line);
      continue;
    }
    
    // Keep indexes
    if (trimmed.startsWith('create index') || trimmed.startsWith('create unique index')) {
      cleaned.push(line);
      continue;
    }
    
    // Skip everything else (grants, policies, functions, etc.)
    if (skipUntilSemicolon && trimmed.endsWith(';')) {
      skipUntilSemicolon = false;
      continue;
    }
    
    if (skipUntilSemicolon) {
      continue;
    }
  }
  
  // Remove trailing empty lines
  while (cleaned.length > 0 && !cleaned[cleaned.length - 1].trim()) {
    cleaned.pop();
  }
  
  const cleanedContent = cleaned.join('\n');
  writeFileSync(migrationFile, cleanedContent, 'utf-8');
  console.log(`✅ Migration file cleaned: ${lines.length} lines → ${cleaned.length} lines`);
  console.log(`   Removed: RLS policies, grants, functions, auth references`);
}

cleanMigration();
