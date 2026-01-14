/**
 * Script to automatically add AI Checker to all important pages
 * 
 * Usage: pnpm tsx scripts/add-ai-checker-to-pages.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const PAGES_TO_UPDATE = [
  'apps/web/app/[locale]/satilik-villa/page.tsx',
  'apps/web/app/[locale]/satilik-daire/page.tsx',
  'apps/web/app/[locale]/karasu-satilik-ev/page.tsx',
  'apps/web/app/[locale]/karasu-satilik-villa/page.tsx',
  'apps/web/app/[locale]/karasu-satilik-daire/page.tsx',
  'apps/web/app/[locale]/karasu-kiralik-ev/page.tsx',
  'apps/web/app/[locale]/karasu-kiralik-daire/page.tsx',
  'apps/web/app/[locale]/kiralik-ev/page.tsx',
  'apps/web/app/[locale]/kiralik-daire/page.tsx',
  'apps/web/app/[locale]/kiralik-villa/page.tsx',
  'apps/web/app/[locale]/satilik-yazlik/page.tsx',
  'apps/web/app/[locale]/satilik-arsa/page.tsx',
];

interface PageInfo {
  path: string;
  title: string;
  sections: Array<{ id: string; title: string }>;
}

const PAGE_CONFIGS: Record<string, PageInfo> = {
  'satilik-villa': {
    path: 'apps/web/app/[locale]/satilik-villa/page.tsx',
    title: 'Satılık Villa',
    sections: [
      { id: 'genel-bakis', title: 'Satılık Villa Arayanlar İçin Genel Bakış' },
      { id: 'oda-sayisina-gore', title: 'Oda Sayısına Göre Satılık Villa Seçenekleri' },
      { id: 'fiyat-analizi', title: 'Satılık Villa Fiyat Analizi' },
      { id: 'mahalle-rehberi', title: 'Mahalle Rehberi' },
      { id: 'yatirim-tavsiyeleri', title: 'Yatırım Tavsiyeleri' },
    ],
  },
  'satilik-daire': {
    path: 'apps/web/app/[locale]/satilik-daire/page.tsx',
    title: 'Satılık Daire',
    sections: [
      { id: 'genel-bakis', title: 'Satılık Daire Arayanlar İçin Genel Bakış' },
      { id: 'oda-sayisina-gore', title: 'Oda Sayısına Göre Satılık Daire Seçenekleri' },
      { id: 'fiyat-analizi', title: 'Satılık Daire Fiyat Analizi' },
      { id: 'mahalle-rehberi', title: 'Mahalle Rehberi' },
      { id: 'yatirim-tavsiyeleri', title: 'Yatırım Tavsiyeleri' },
    ],
  },
  'karasu-satilik-ev': {
    path: 'apps/web/app/[locale]/karasu-satilik-ev/page.tsx',
    title: 'Karasu Satılık Ev',
    sections: [
      { id: 'genel-bakis', title: 'Karasu\'da Satılık Ev Arayanlar İçin Genel Bakış' },
      { id: 'emlak-tiplerine-gore', title: 'Emlak Tiplerine Göre Seçenekler' },
      { id: 'fiyat-analizi', title: 'Karasu Satılık Ev Fiyat Analizi' },
      { id: 'mahalleler', title: 'Mahallelere Göre Karasu Satılık Ev Seçenekleri' },
      { id: 'dikkat-edilmesi-gerekenler', title: 'Dikkat Edilmesi Gerekenler' },
    ],
  },
  'karasu-satilik-villa': {
    path: 'apps/web/app/[locale]/karasu-satilik-villa/page.tsx',
    title: 'Karasu Satılık Villa',
    sections: [
      { id: 'genel-bakis', title: 'Karasu\'da Satılık Villa Arayanlar İçin Genel Bakış' },
      { id: 'ozelliklerine-gore', title: 'Özelliklerine Göre Karasu Satılık Villa Seçenekleri' },
      { id: 'fiyat-analizi', title: 'Karasu Satılık Villa Fiyat Analizi' },
      { id: 'mahalleler', title: 'Mahallelere Göre Karasu Satılık Villa Seçenekleri' },
      { id: 'dikkat-edilmesi-gerekenler', title: 'Dikkat Edilmesi Gerekenler' },
    ],
  },
  'karasu-satilik-daire': {
    path: 'apps/web/app/[locale]/karasu-satilik-daire/page.tsx',
    title: 'Karasu Satılık Daire',
    sections: [
      { id: 'genel-bakis', title: 'Karasu\'da Satılık Daire Arayanlar İçin Genel Bakış' },
      { id: 'oda-sayisina-gore', title: 'Oda Sayısına Göre Karasu Satılık Daire Seçenekleri' },
      { id: 'fiyat-analizi', title: 'Karasu Satılık Daire Fiyat Analizi' },
      { id: 'mahalleler', title: 'Mahallelere Göre Karasu Satılık Daire Seçenekleri' },
      { id: 'dikkat-edilmesi-gerekenler', title: 'Dikkat Edilmesi Gerekenler' },
    ],
  },
  'karasu-kiralik-ev': {
    path: 'apps/web/app/[locale]/karasu-kiralik-ev/page.tsx',
    title: 'Karasu Kiralık Ev',
    sections: [
      { id: 'genel-bakis', title: 'Karasu\'da Kiralık Ev Arayanlar İçin Genel Bakış' },
      { id: 'emlak-tiplerine-gore', title: 'Emlak Tiplerine Göre Seçenekler' },
      { id: 'fiyat-analizi', title: 'Karasu Kiralık Ev Fiyat Analizi' },
      { id: 'mahalleler', title: 'Mahallelere Göre Karasu Kiralık Ev Seçenekleri' },
      { id: 'dikkat-edilmesi-gerekenler', title: 'Dikkat Edilmesi Gerekenler' },
    ],
  },
  'karasu-kiralik-daire': {
    path: 'apps/web/app/[locale]/karasu-kiralik-daire/page.tsx',
    title: 'Karasu Kiralık Daire',
    sections: [
      { id: 'genel-bakis', title: 'Karasu\'da Kiralık Daire Arayanlar İçin Genel Bakış' },
      { id: 'oda-sayisina-gore', title: 'Oda Sayısına Göre Karasu Kiralık Daire Seçenekleri' },
      { id: 'fiyat-analizi', title: 'Karasu Kiralık Daire Fiyat Analizi' },
      { id: 'mahalleler', title: 'Mahallelere Göre Karasu Kiralık Daire Seçenekleri' },
      { id: 'dikkat-edilmesi-gerekenler', title: 'Dikkat Edilmesi Gerekenler' },
    ],
  },
  'kiralik-ev': {
    path: 'apps/web/app/[locale]/kiralik-ev/page.tsx',
    title: 'Kiralık Ev',
    sections: [
      { id: 'genel-bakis', title: 'Kiralık Ev Arayanlar İçin Genel Bakış' },
      { id: 'oda-sayisina-gore', title: 'Oda Sayısına Göre Kiralık Ev Seçenekleri' },
      { id: 'fiyat-analizi', title: 'Kiralık Ev Fiyat Analizi' },
      { id: 'mahalle-rehberi', title: 'Mahalle Rehberi' },
      { id: 'yatirim-tavsiyeleri', title: 'Yatırım Tavsiyeleri' },
    ],
  },
  'kiralik-daire': {
    path: 'apps/web/app/[locale]/kiralik-daire/page.tsx',
    title: 'Kiralık Daire',
    sections: [
      { id: 'genel-bakis', title: 'Kiralık Daire Arayanlar İçin Genel Bakış' },
      { id: 'oda-sayisina-gore', title: 'Oda Sayısına Göre Kiralık Daire Seçenekleri' },
      { id: 'fiyat-analizi', title: 'Kiralık Daire Fiyat Analizi' },
      { id: 'mahalle-rehberi', title: 'Mahalle Rehberi' },
      { id: 'yatirim-tavsiyeleri', title: 'Yatırım Tavsiyeleri' },
    ],
  },
  'kiralik-villa': {
    path: 'apps/web/app/[locale]/kiralik-villa/page.tsx',
    title: 'Kiralık Villa',
    sections: [
      { id: 'genel-bakis', title: 'Kiralık Villa Arayanlar İçin Genel Bakış' },
      { id: 'oda-sayisina-gore', title: 'Oda Sayısına Göre Kiralık Villa Seçenekleri' },
      { id: 'fiyat-analizi', title: 'Kiralık Villa Fiyat Analizi' },
      { id: 'mahalle-rehberi', title: 'Mahalle Rehberi' },
      { id: 'yatirim-tavsiyeleri', title: 'Yatırım Tavsiyeleri' },
    ],
  },
  'satilik-yazlik': {
    path: 'apps/web/app/[locale]/satilik-yazlik/page.tsx',
    title: 'Satılık Yazlık',
    sections: [
      { id: 'genel-bakis', title: 'Satılık Yazlık Arayanlar İçin Genel Bakış' },
      { id: 'ozelliklerine-gore', title: 'Özelliklerine Göre Satılık Yazlık Seçenekleri' },
      { id: 'fiyat-analizi', title: 'Satılık Yazlık Fiyat Analizi' },
      { id: 'mahalle-rehberi', title: 'Mahalle Rehberi' },
      { id: 'yatirim-tavsiyeleri', title: 'Yatırım Tavsiyeleri' },
    ],
  },
  'satilik-arsa': {
    path: 'apps/web/app/[locale]/satilik-arsa/page.tsx',
    title: 'Satılık Arsa',
    sections: [
      { id: 'genel-bakis', title: 'Satılık Arsa Arayanlar İçin Genel Bakış' },
      { id: 'konum-secenekleri', title: 'Konum Seçenekleri' },
      { id: 'fiyat-analizi', title: 'Satılık Arsa Fiyat Analizi' },
      { id: 'mahalle-rehberi', title: 'Mahalle Rehberi' },
      { id: 'yatirim-tavsiyeleri', title: 'Yatırım Tavsiyeleri' },
    ],
  },
};

function addAICheckerToPage(filePath: string, pageInfo: PageInfo) {
  try {
    const fullPath = join(process.cwd(), filePath);
    let content = readFileSync(fullPath, 'utf-8');

    // Check if already has AI checker
    if (content.includes('AIChecker') || content.includes('AICheckerBadge')) {
      console.log(`⏭️  ${filePath} already has AI Checker, skipping...`);
      return false;
    }

    // Add imports
    if (!content.includes("import { AIChecker }")) {
      const importMatch = content.match(/import.*from.*['"]@\/lib\/utils\/timeout['"];?/);
      if (importMatch) {
        const newImports = `import { AIChecker } from '@/components/content/AIChecker';\nimport { AICheckerBadge } from '@/components/content/AICheckerBadge';\nimport { generatePageContentInfo } from '@/lib/content/ai-checker-helper';`;
        content = content.replace(importMatch[0], `${importMatch[0]}\n${newImports}`);
      }
    }

    // Generate page content HTML
    const pageContentHTML = pageInfo.sections
      .map((s) => `<h2 id="${s.id}">${s.title}</h2>\n<p>İçerik bölümü...</p>`)
      .join('\n\n');

    // Add page content info before return statement
    const returnMatch = content.match(/(\s+return\s+\()/);
    if (returnMatch) {
      const beforeReturn = returnMatch.index!;
      const pageContentCode = `
  // Generate page content for AI checker
  const pageContentInfo = generatePageContentInfo('${pageInfo.title}', [
${pageInfo.sections.map((s) => `    { id: '${s.id}', title: '${s.title}', content: 'İçerik bölümü...' },`).join('\n')}
  ]);
`;
      content = content.slice(0, beforeReturn) + pageContentCode + content.slice(beforeReturn);
    }

    // Add AI Checker Badge after Breadcrumbs
    const breadcrumbsMatch = content.match(/(<Breadcrumbs[\s\S]*?\/>)/);
    if (breadcrumbsMatch) {
      const afterBreadcrumbs = breadcrumbsMatch.index! + breadcrumbsMatch[0].length;
      const badgeCode = `
      
      {/* AI Checker Badge */}
      <AICheckerBadge
        content={pageContentInfo.content}
        title="${pageInfo.title}"
        position="top-right"
      />
`;
      content = content.slice(0, afterBreadcrumbs) + badgeCode + content.slice(afterBreadcrumbs);
    }

    // Add AI Checker in main content area
    const mainContentMatch = content.match(/(<div className="lg:col-span-2[^>]*>)/);
    if (mainContentMatch) {
      const afterMainContent = mainContentMatch.index! + mainContentMatch[0].length;
      const checkerCode = `
                {/* AI Checker */}
                <div id="ai-checker">
                  <AIChecker
                    content={pageContentInfo.content}
                    title="${pageInfo.title}"
                    contentType="article"
                    showDetails={true}
                  />
                </div>
`;
      content = content.slice(0, afterMainContent) + checkerCode + content.slice(afterMainContent);
    }

    // Add IDs to sections
    pageInfo.sections.forEach((section) => {
      const h2Pattern = new RegExp(`(<h2[^>]*>${section.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\/h2>)`, 'i');
      if (h2Pattern.test(content)) {
        content = content.replace(h2Pattern, (match) => {
          if (!match.includes('id=')) {
            return match.replace('<h2', `<h2 id="${section.id}" className="scroll-mt-24"`);
          }
          return match;
        });
      }
    });

    writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ ${filePath} - AI Checker eklendi`);
    return true;
  } catch (error) {
    console.error(`❌ ${filePath} - Hata:`, error);
    return false;
  }
}

// Main execution
console.log('🚀 AI Checker ekleme işlemi başlatılıyor...\n');

let successCount = 0;
let skipCount = 0;

// Process pages from PAGES_TO_UPDATE list
PAGES_TO_UPDATE.forEach((pagePath) => {
  // Find matching config
  const configKey = Object.keys(PAGE_CONFIGS).find(key => PAGE_CONFIGS[key].path === pagePath);
  
  if (configKey) {
    const pageInfo = PAGE_CONFIGS[configKey];
    const result = addAICheckerToPage(pageInfo.path, pageInfo);
    if (result) {
      successCount++;
    } else {
      skipCount++;
    }
  } else {
    console.log(`⚠️  ${pagePath} - Config bulunamadı, atlanıyor...`);
    skipCount++;
  }
});

console.log(`\n📊 Özet:`);
console.log(`✅ Başarılı: ${successCount}`);
console.log(`⏭️  Atlandı: ${skipCount}`);
console.log(`\n✨ Tamamlandı!`);
