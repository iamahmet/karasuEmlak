/**
 * Add Internal Links to Cornerstone Pages
 * 
 * Enhances internal linking by adding related page links to cornerstone pages
 */

import * as fs from 'fs';
import * as path from 'path';

const baseDir = path.join(process.cwd(), 'apps/web/app/[locale]');

const internalLinkMaps: Record<string, string[]> = {
  'satilik-daire': [
    '/karasu-satilik-daire',
    '/satilik-villa',
    '/satilik-ev',
    '/satilik-yazlik',
    '/satilik-arsa',
    '/kiralik-daire',
    '/karasu',
    '/karasu-emlak-rehberi',
  ],
  'satilik-villa': [
    '/karasu-satilik-villa',
    '/satilik-daire',
    '/satilik-ev',
    '/satilik-yazlik',
    '/kiralik-villa',
    '/karasu',
    '/karasu-emlak-rehberi',
  ],
  'satilik-yazlik': [
    '/karasu-satilik-yazlik',
    '/satilik-daire',
    '/satilik-villa',
    '/satilik-ev',
    '/kiralik-daire',
    '/karasu',
  ],
  'satilik-ev': [
    '/karasu-satilik-ev',
    '/satilik-daire',
    '/satilik-villa',
    '/satilik-yazlik',
    '/satilik-arsa',
    '/kiralik-ev',
    '/karasu',
  ],
  'satilik-arsa': [
    '/satilik-daire',
    '/satilik-ev',
    '/karasu',
    '/karasu-emlak-rehberi',
  ],
  'kiralik-daire': [
    '/karasu-kiralik-daire',
    '/kiralik-ev',
    '/kiralik-villa',
    '/satilik-daire',
    '/karasu',
  ],
  'kiralik-ev': [
    '/karasu-kiralik-ev',
    '/kiralik-daire',
    '/kiralik-villa',
    '/satilik-ev',
    '/karasu',
  ],
  'kiralik-villa': [
    '/kiralik-daire',
    '/kiralik-ev',
    '/satilik-villa',
    '/karasu',
  ],
};

async function addInternalLinks() {
  let updated = 0;
  
  for (const [slug, links] of Object.entries(internalLinkMaps)) {
    const filePath = path.join(baseDir, slug, 'page.tsx');
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if "İlgili Sayfalar" section exists
    if (!content.includes('İlgili Sayfalar')) {
      console.log(`⏭️  Skipping ${slug} - no "İlgili Sayfalar" section found`);
      continue;
    }
    
    // Find the Related Pages section and add missing links
    const relatedPagesPattern = /(İlgili Sayfalar[\s\S]*?<\/div>\s*<\/div>)/;
    const match = content.match(relatedPagesPattern);
    
    if (match) {
      // Check which links are missing
      const existingLinks = links.filter(link => content.includes(link));
      const missingLinks = links.filter(link => !content.includes(link));
      
      if (missingLinks.length > 0) {
        // Add missing links before closing div
        const linkHTML = missingLinks.map(link => {
          const linkName = link.split('/').pop()?.replace(/-/g, ' ') || '';
          const displayName = linkName.split(' ').map(w => 
            w.charAt(0).toUpperCase() + w.slice(1)
          ).join(' ');
          
          return `                    <Link href={\`\${basePath}${link}\`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-semibold text-gray-900">${displayName}</div>
                      <div className="text-sm text-gray-600">İlgili sayfa</div>
                    </Link>`;
        }).join('\n');
        
        // Insert before closing divs
        content = content.replace(
          relatedPagesPattern,
          (match) => {
            return match.replace(
              /(\s*<\/div>\s*<\/div>\s*)$/,
              `\n${linkHTML}$1`
            );
          }
        );
        
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Added ${missingLinks.length} links to ${slug}`);
        updated++;
      } else {
        console.log(`✓ ${slug} already has all links`);
      }
    }
  }
  
  console.log(`\n✅ Updated ${updated} files!`);
}

addInternalLinks().catch(console.error);
