/**
 * Optimize All Meta Descriptions
 * 
 * Batch optimize meta descriptions across all cornerstone pages
 */

import * as fs from 'fs';
import * as path from 'path';
import { optimizeMetaDescription } from '../apps/web/lib/seo/meta-description-optimizer';

const pages = [
  {
    file: 'apps/web/app/[locale]/satilik-daire/page.tsx',
    keywords: ['satılık daire', 'daire ilanları'],
  },
  {
    file: 'apps/web/app/[locale]/satilik-villa/page.tsx',
    keywords: ['satılık villa', 'villa ilanları'],
  },
  {
    file: 'apps/web/app/[locale]/satilik-yazlik/page.tsx',
    keywords: ['satılık yazlık', 'yazlık ilanları'],
  },
  {
    file: 'apps/web/app/[locale]/satilik-ev/page.tsx',
    keywords: ['satılık ev', 'ev ilanları'],
  },
  {
    file: 'apps/web/app/[locale]/satilik-arsa/page.tsx',
    keywords: ['satılık arsa', 'arsa ilanları'],
  },
  {
    file: 'apps/web/app/[locale]/kiralik-daire/page.tsx',
    keywords: ['kiralık daire', 'kiralık daire ilanları'],
  },
  {
    file: 'apps/web/app/[locale]/kiralik-ev/page.tsx',
    keywords: ['kiralık ev', 'kiralık ev ilanları'],
  },
  {
    file: 'apps/web/app/[locale]/kiralik-villa/page.tsx',
    keywords: ['kiralık villa', 'kiralık villa ilanları'],
  },
];

async function optimizeDescriptions() {
  let updated = 0;

  for (const page of pages) {
    const filePath = path.join(process.cwd(), page.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Check if optimizeMetaDescription is imported
    if (!content.includes('optimizeMetaDescription')) {
      // Add import
      const importMatch = content.match(/(import.*from '@/i18n/routing';)/);
      if (importMatch) {
        content = content.replace(
          importMatch[0],
          `${importMatch[0]}\nimport { optimizeMetaDescription } from '@/lib/seo/meta-description-optimizer';`
        );
      }
    }

    // Find and optimize description in generateMetadata
    const descriptionPattern = /description:\s*['"]([^'"]+)['"]/g;
    let hasChanges = false;

    content = content.replace(descriptionPattern, (match, description) => {
      // Skip if already optimized (contains optimizeMetaDescription call)
      if (match.includes('optimizeMetaDescription')) {
        return match;
      }

      // Remove AI-like phrases
      const cleaned = description
        .replace(/geniş seçenek/gi, 'seçenek')
        .replace(/kapsamlı rehber/gi, 'rehber')
        .replace(/detaylı bilgi/gi, 'bilgi')
        .trim();

      // Optimize
      const optimized = optimizeMetaDescription(cleaned, {
        keywords: page.keywords,
        includeCTA: true,
      });

      hasChanges = true;
      return `description: '${optimized.replace(/'/g, "\\'")}'`;
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Optimized: ${page.file}`);
      updated++;
    } else {
      console.log(`⏭️  Skipped (already optimized): ${page.file}`);
    }
  }

  console.log(`\n✅ Updated ${updated} files!`);
}

optimizeDescriptions().catch(console.error);
