#!/usr/bin/env tsx
/**
 * Type Error Fixer Script
 * Automatically fixes common TypeScript type errors
 */

import * as fs from 'fs';
import * as path from 'path';

interface Fix {
  file: string;
  pattern: string;
  replacement: string;
  description: string;
}

const fixes: Fix[] = [
  // Fix 1: getNewsArticles signature
  {
    file: 'apps/web/app/[locale]/karasu/gezilecek-yerler/page.tsx',
    pattern: /getNewsArticles\((\d+),\s*(\d+)\)/g,
    replacement: 'getNewsArticles($1, $2)',
    description: 'getNewsArticles call - already correct',
  },
  // Fix 2: size_m2 -> features.sizeM2
  {
    file: 'apps/web/app/[locale]/ilan/[slug]/page.tsx',
    pattern: /size_m2:\s*listing\.size_m2/g,
    replacement: 'size_m2: listing.features?.sizeM2',
    description: 'Fix size_m2 property access',
  },
  // Fix 3: generateOrganizationSchema calls
  {
    file: 'apps/web/lib/seo/structured-data-cache.ts',
    pattern: /generateOrganizationSchema\(\)/g,
    replacement: 'generateOrganizationSchema(undefined)',
    description: 'Fix generateOrganizationSchema call',
  },
];

/**
 * Apply fixes
 */
function applyFixes() {
  console.log('🔧 Applying type error fixes...\n');

  let fixedCount = 0;

  for (const fix of fixes) {
    const filePath = path.join(process.cwd(), fix.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      continue;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      const originalContent = content;

      // Apply fix
      if (fix.pattern instanceof RegExp) {
        content = content.replace(fix.pattern, fix.replacement);
      } else {
        content = content.replace(new RegExp(fix.pattern, 'g'), fix.replacement);
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Fixed: ${fix.file}`);
        console.log(`   ${fix.description}`);
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ Error fixing ${fix.file}:`, error);
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} files`);
}

// Run
applyFixes();
