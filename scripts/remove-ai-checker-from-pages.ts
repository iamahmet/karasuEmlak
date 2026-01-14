/**
 * Script to remove AI Checker from all public pages
 * AI checker should only be visible in admin panel
 * 
 * Usage: pnpm tsx scripts/remove-ai-checker-from-pages.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

const PAGES_TO_CLEAN = [
  'apps/web/app/[locale]/**/page.tsx',
];

async function removeAICheckerFromPage(filePath: string) {
  try {
    const fullPath = join(process.cwd(), filePath);
    let content = readFileSync(fullPath, 'utf-8');

    // Skip if no AI checker found
    if (!content.includes('AIChecker') && !content.includes('AICheckerBadge')) {
      return false;
    }

    // Skip admin pages
    if (filePath.includes('/admin/')) {
      return false;
    }

    let modified = false;

    // Remove AICheckerBadge components - simple pattern matching
    if (content.includes('<AICheckerBadge')) {
      // Find and replace AICheckerBadge blocks
      const badgeStart = content.indexOf('<AICheckerBadge');
      if (badgeStart !== -1) {
        const badgeEnd = content.indexOf('</AICheckerBadge>', badgeStart);
        if (badgeEnd !== -1) {
          const before = content.substring(0, badgeStart);
          const after = content.substring(badgeEnd + '</AICheckerBadge>'.length);
          // Find comment before badge
          const commentStart = before.lastIndexOf('{/*');
          const commentEnd = before.lastIndexOf('*/}');
          if (commentStart !== -1 && commentEnd !== -1) {
            content = before.substring(0, commentStart) + '{/* AI Checker Badge - Admin Only (Hidden from public) */}' + after;
          } else {
            content = before + '{/* AI Checker Badge - Admin Only (Hidden from public) */}' + after;
          }
          modified = true;
        }
      }
    }

    // Remove AIChecker components
    if (content.includes('<AIChecker')) {
      const checkerStart = content.indexOf('<AIChecker');
      if (checkerStart !== -1) {
        const checkerEnd = content.indexOf('</AIChecker>', checkerStart);
        if (checkerEnd !== -1) {
          const divEnd = content.indexOf('</div>', checkerEnd);
          const before = content.substring(0, checkerStart);
          const after = divEnd !== -1 ? content.substring(divEnd + '</div>'.length) : content.substring(checkerEnd + '</AIChecker>'.length);
          // Find comment before checker
          const commentStart = before.lastIndexOf('{/*');
          const commentEnd = before.lastIndexOf('*/}');
          if (commentStart !== -1 && commentEnd !== -1) {
            content = before.substring(0, commentStart) + '{/* AI Checker - Admin Only (Hidden from public) */}' + after;
          } else {
            content = before + '{/* AI Checker - Admin Only (Hidden from public) */}' + after;
          }
          modified = true;
        }
      }
    }

    // Remove imports if not used
    if (modified && !content.includes('<AIChecker') && !content.includes('<AICheckerBadge')) {
      content = content.replace(/import.*AIChecker.*from.*['"]@\/components\/content\/AIChecker['"];?\n?/g, '');
      content = content.replace(/import.*AICheckerBadge.*from.*['"]@\/components\/content\/AICheckerBadge['"];?\n?/g, '');
    }

    if (modified) {
      writeFileSync(fullPath, content, 'utf-8');
      console.log(`✅ ${filePath} - AI Checker kaldırıldı`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ ${filePath} - Hata:`, error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 AI Checker kaldırma işlemi başlatılıyor...\n');

  const files = await glob(PAGES_TO_CLEAN[0], { cwd: process.cwd() });
  
  let successCount = 0;
  let skipCount = 0;

  for (const file of files) {
    const result = await removeAICheckerFromPage(file);
    if (result) {
      successCount++;
    } else {
      skipCount++;
    }
  }

  console.log(`\n📊 Özet:`);
  console.log(`✅ Güncellendi: ${successCount}`);
  console.log(`⏭️  Atlandı: ${skipCount}`);
  console.log(`\n✨ Tamamlandı!`);
}

main().catch(console.error);
