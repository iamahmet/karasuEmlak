#!/usr/bin/env tsx
/**
 * Fix ENV Whitespace Issues
 * 
 * Reads .env.local, trims all values, writes back
 * 
 * Usage:
 *   pnpm tsx scripts/fix-env-whitespace.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');

if (!existsSync(envPath)) {
  console.error('❌ .env.local not found!');
  process.exit(1);
}

console.log('🔧 Fixing ENV whitespace issues...\n');

const content = readFileSync(envPath, 'utf-8');
const lines = content.split('\n');
const fixed: string[] = [];
let fixedCount = 0;

for (const line of lines) {
  // Skip comments and empty lines
  if (line.trim().startsWith('#') || line.trim() === '') {
    fixed.push(line);
    continue;
  }
  
  // Parse KEY=VALUE
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2];
    
    // Check if value has whitespace
    const trimmed = value.trim();
    if (value !== trimmed) {
      fixed.push(`${key}=${trimmed}`);
      fixedCount++;
      console.log(`   ✅ Fixed: ${key} (removed whitespace)`);
    } else {
      fixed.push(line);
    }
  } else {
    fixed.push(line);
  }
}

if (fixedCount > 0) {
  // Backup original
  const backupPath = `${envPath}.backup.${Date.now()}`;
  writeFileSync(backupPath, content, 'utf-8');
  console.log(`\n📦 Backup created: ${backupPath}`);
  
  // Write fixed
  writeFileSync(envPath, fixed.join('\n'), 'utf-8');
  console.log(`\n✅ Fixed ${fixedCount} environment variable(s)`);
  console.log(`📝 Updated: ${envPath}\n`);
} else {
  console.log('✅ No whitespace issues found!\n');
}

process.exit(0);
