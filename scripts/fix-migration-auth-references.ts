#!/usr/bin/env tsx
/**
 * Fix migration file to work with local Supabase
 * Comments out auth schema references that don't exist in local setup
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const migrationFile = join(process.cwd(), 'supabase/migrations/20260104215603_remote_schema.sql');

function fixMigration() {
  let content = readFileSync(migrationFile, 'utf-8');
  
  // Comment out auth.users references
  content = content.replace(
    /REFERENCES auth\.users\(id\)/g,
    '-- REFERENCES auth.users(id) -- Commented for local setup'
  );
  
  // Comment out auth.uid() and auth.role() in constraints
  content = content.replace(
    /using \(\(auth\.(uid|role)\(\)/g,
    'using ((false -- auth.$1() commented for local setup'
  );
  
  // Comment out FROM auth.users
  content = content.replace(
    /FROM auth\.users/g,
    '-- FROM auth.users -- Commented for local setup'
  );
  
  // Comment out validate constraint for auth.users foreign keys
  content = content.replace(
    /alter table.*validate constraint.*user_id_fkey/g,
    (match) => `-- ${match} -- Commented for local setup`
  );
  
  writeFileSync(migrationFile, content, 'utf-8');
  console.log('✅ Migration file fixed for local setup');
}

fixMigration();
