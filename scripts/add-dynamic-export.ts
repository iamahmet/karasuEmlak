#!/usr/bin/env tsx
/**
 * Add export const dynamic = 'force-dynamic' to pages that need it
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join } from 'path';

const pagesToMakeDynamic = [
  'apps/web/app/[locale]/page.tsx',
  'apps/web/app/[locale]/karasu/page.tsx',
  'apps/web/app/[locale]/karasu-emlak-rehberi/page.tsx',
  'apps/web/app/[locale]/karasu-mahalleler/page.tsx',
  'apps/web/app/[locale]/karasu-satilik-ev/page.tsx',
  'apps/web/app/[locale]/karasu-vs-kocaali-satilik-ev/page.tsx',
  'apps/web/app/[locale]/karasu-vs-kocaali-yasam/page.tsx',
  'apps/web/app/[locale]/karasu-vs-kocaali-yatirim/page.tsx',
  'apps/web/app/[locale]/karasu-yatirimlik-satilik-ev/page.tsx',
  'apps/web/app/[locale]/karasu/gezilecek-yerler/page.tsx',
  'apps/web/app/[locale]/karasu/hastaneler/page.tsx',
  'apps/web/app/[locale]/karasu/mahalle-karsilastirma/page.tsx',
  'apps/web/app/[locale]/karasu/nobetci-eczaneler/page.tsx',
  'apps/web/app/[locale]/karasu/onemli-telefonlar/page.tsx',
  'apps/web/app/[locale]/karasu/restoranlar/page.tsx',
  'apps/web/app/[locale]/karasu/ulasim/page.tsx',
  'apps/web/app/[locale]/karsilastir/page.tsx',
  'apps/web/app/[locale]/kiralik/page.tsx',
  'apps/web/app/[locale]/kocaali/page.tsx',
  'apps/web/app/[locale]/kocaali-emlak-rehberi/page.tsx',
  'apps/web/app/[locale]/kocaali-satilik-ev/page.tsx',
  'apps/web/app/[locale]/kocaali-satilik-ev-fiyatlari/page.tsx',
  'apps/web/app/[locale]/kocaali-yatirimlik-gayrimenkul/page.tsx',
  'apps/web/app/[locale]/kocaali/gezilecek-yerler/page.tsx',
  'apps/web/app/[locale]/kocaali/hastaneler/page.tsx',
  'apps/web/app/[locale]/kocaali/mahalleler/page.tsx',
  'apps/web/app/[locale]/kocaali/nobetci-eczaneler/page.tsx',
  'apps/web/app/[locale]/kocaali/onemli-telefonlar/page.tsx',
  'apps/web/app/[locale]/kocaali/restoranlar/page.tsx',
  'apps/web/app/[locale]/kocaali/ulasim/page.tsx',
  'apps/web/app/[locale]/kullanim-kosullari/page.tsx',
  'apps/web/app/[locale]/kvkk-basvuru/page.tsx',
  'apps/web/app/[locale]/listings/new/page.tsx',
  'apps/web/app/[locale]/rehber/page.tsx',
  'apps/web/app/[locale]/rehber/emlak-alim-satim/page.tsx',
  'apps/web/app/[locale]/rehber/kiralama/page.tsx',
  'apps/web/app/[locale]/rehber/yatirim/page.tsx',
  'apps/web/app/[locale]/satilik/page.tsx',
  'apps/web/app/[locale]/yatirim/piyasa-analizi/page.tsx',
  'apps/web/app/[locale]/yatirim/roi-hesaplayici/page.tsx',
  'apps/web/app/[locale]/yorumlar/page.tsx',
];

const workspaceRoot = process.cwd();

function addDynamicExport(filePath: string): boolean {
  const fullPath = join(workspaceRoot, filePath);
  
  try {
    let content = readFileSync(fullPath, 'utf-8');
    
    // Check if already has export const dynamic
    if (content.includes("export const dynamic = 'force-dynamic'")) {
      console.log(`✓ ${filePath} already has dynamic export`);
      return false;
    }
    
    // Check if file starts with import type { Metadata }
    if (content.startsWith("import type { Metadata }")) {
      // Add after the first import line
      content = content.replace(
        /^(import type { Metadata } from 'next';)/m,
        "$1\n\nexport const dynamic = 'force-dynamic';"
      );
    } else if (content.startsWith("import")) {
      // Find first import line and add after it
      const firstImportMatch = content.match(/^(import .+?;)/m);
      if (firstImportMatch) {
        content = content.replace(
          firstImportMatch[0],
          `${firstImportMatch[0]}\n\nexport const dynamic = 'force-dynamic';`
        );
      } else {
        // Add at the top
        content = `export const dynamic = 'force-dynamic';\n\n${content}`;
      }
    } else {
      // Add at the top
      content = `export const dynamic = 'force-dynamic';\n\n${content}`;
    }
    
    writeFileSync(fullPath, content, 'utf-8');
    console.log(`✓ Added dynamic export to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🚀 Adding export const dynamic = "force-dynamic" to pages...\n');
  
  let updated = 0;
  let skipped = 0;
  
  for (const page of pagesToMakeDynamic) {
    if (addDynamicExport(page)) {
      updated++;
    } else {
      skipped++;
    }
  }
  
  console.log(`\n✅ Done! Updated: ${updated}, Skipped: ${skipped}`);
}

main();
