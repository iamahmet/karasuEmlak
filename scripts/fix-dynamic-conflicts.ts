#!/usr/bin/env tsx
/**
 * Fix dynamic keyword conflicts by aliasing import dynamic to dynamicImport
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join } from 'path';

const filesToFix = [
  'apps/web/app/[locale]/satilik/page.tsx',
  'apps/web/app/[locale]/rehber/page.tsx',
  'apps/web/app/[locale]/kullanim-kosullari/page.tsx',
  'apps/web/app/[locale]/kocaali/mahalleler/page.tsx',
  'apps/web/app/[locale]/kocaali-yatirimlik-gayrimenkul/page.tsx',
  'apps/web/app/[locale]/kocaali-satilik-ev-fiyatlari/page.tsx',
  'apps/web/app/[locale]/kocaali-satilik-ev/page.tsx',
  'apps/web/app/[locale]/kocaali-emlak-rehberi/page.tsx',
  'apps/web/app/[locale]/kocaali/page.tsx',
  'apps/web/app/[locale]/kiralik/page.tsx',
  'apps/web/app/[locale]/karasu-yatirimlik-satilik-ev/page.tsx',
  'apps/web/app/[locale]/karasu-vs-kocaali-yatirim/page.tsx',
  'apps/web/app/[locale]/karasu-vs-kocaali-yasam/page.tsx',
  'apps/web/app/[locale]/karasu-vs-kocaali-satilik-ev/page.tsx',
  'apps/web/app/[locale]/karasu-satilik-ev/page.tsx',
  'apps/web/app/[locale]/karasu-emlak-rehberi/page.tsx',
  'apps/web/app/[locale]/karasu/page.tsx',
  'apps/web/app/[locale]/page.tsx',
  'apps/web/app/[locale]/ilan/[slug]/page.tsx',
];

const workspaceRoot = process.cwd();

function fixDynamicConflict(filePath: string): boolean {
  const fullPath = join(workspaceRoot, filePath);
  
  try {
    let content = readFileSync(fullPath, 'utf-8');
    
    // Check if file has both export const dynamic and import dynamic
    const hasExportDynamic = content.includes("export const dynamic = 'force-dynamic'");
    const hasImportDynamic = /import dynamic from ['"]next\/dynamic['"]/.test(content);
    
    if (!hasExportDynamic || !hasImportDynamic) {
      console.log(`⊘ ${filePath} - no conflict (has export: ${hasExportDynamic}, has import: ${hasImportDynamic})`);
      return false;
    }
    
    // Check if already fixed
    if (content.includes("import dynamicImport from 'next/dynamic'")) {
      console.log(`✓ ${filePath} already fixed`);
      return false;
    }
    
    // Replace import dynamic with dynamicImport
    content = content.replace(
      /import dynamic from ['"]next\/dynamic['"]/g,
      "import dynamicImport from 'next/dynamic'"
    );
    
    // Replace dynamic( with dynamicImport(
    content = content.replace(
      /(\b)dynamic\(/g,
      '$1dynamicImport('
    );
    
    writeFileSync(fullPath, content, 'utf-8');
    console.log(`✓ Fixed ${filePath}`);
    return true;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🚀 Fixing dynamic keyword conflicts...\n');
  
  let updated = 0;
  let skipped = 0;
  
  for (const file of filesToFix) {
    if (fixDynamicConflict(file)) {
      updated++;
    } else {
      skipped++;
    }
  }
  
  console.log(`\n✅ Done! Updated: ${updated}, Skipped: ${skipped}`);
}

main();
