/**
 * Adapt copied cornerstone pages to their specific property types
 */

import * as fs from 'fs';
import * as path from 'path';

const baseDir = path.join(process.cwd(), 'apps/web/app/[locale]');

const adaptations: Record<string, {
  title: string;
  propertyType: string;
  status: 'satilik' | 'kiralik';
  description: string;
  keywords: string[];
  functionName: string;
}> = {
  'satilik-villa': {
    title: 'Satılık Villa',
    propertyType: 'villa',
    status: 'satilik',
    description: 'Türkiye\'de satılık villa ilanları. Denize sıfır konumlarda bahçeli, havuzlu lüks villalar.',
    keywords: ['satılık villa', 'satılık villalar', 'satılık villa ilanları', 'satılık villa fiyatları'],
    functionName: 'SatilikVilla',
  },
  'satilik-yazlik': {
    title: 'Satılık Yazlık',
    propertyType: 'yazlik',
    status: 'satilik',
    description: 'Türkiye\'de satılık yazlık ilanları. Denize yakın konumlarda uygun fiyatlı yazlık evler.',
    keywords: ['satılık yazlık', 'satılık yazlık ev', 'satılık yazlık ilanları', 'satılık yazlık fiyatları'],
    functionName: 'SatilikYazlik',
  },
  'satilik-ev': {
    title: 'Satılık Ev',
    propertyType: 'ev',
    status: 'satilik',
    description: 'Türkiye\'de satılık ev ilanları. Müstakil evler, bahçeli konutlar ve geniş yaşam alanları.',
    keywords: ['satılık ev', 'satılık evler', 'satılık konut', 'satılık müstakil ev'],
    functionName: 'SatilikEv',
  },
  'satilik-arsa': {
    title: 'Satılık Arsa',
    propertyType: 'arsa',
    status: 'satilik',
    description: 'Türkiye\'de satılık arsa ilanları. İmarlı arsalar, yatırım arsaları ve gelişim potansiyeli yüksek bölgeler.',
    keywords: ['satılık arsa', 'satılık arsalar', 'satılık arsa ilanları', 'imarlı arsa'],
    functionName: 'SatilikArsa',
  },
  'kiralik-daire': {
    title: 'Kiralık Daire',
    propertyType: 'daire',
    status: 'kiralik',
    description: 'Türkiye\'de kiralık daire ilanları. 1+1\'den 4+1\'e kadar geniş seçenek. Aylık kira fiyatları.',
    keywords: ['kiralık daire', 'kiralık daireler', 'kiralık daire ilanları', 'kiralık daire fiyatları'],
    functionName: 'KiralikDaire',
  },
  'kiralik-ev': {
    title: 'Kiralık Ev',
    propertyType: 'ev',
    status: 'kiralik',
    description: 'Türkiye\'de kiralık ev ilanları. Müstakil evler, bahçeli konutlar. Aylık kira fiyatları.',
    keywords: ['kiralık ev', 'kiralık evler', 'kiralık konut', 'kiralık müstakil ev'],
    functionName: 'KiralikEv',
  },
  'kiralik-villa': {
    title: 'Kiralık Villa',
    propertyType: 'villa',
    status: 'kiralik',
    description: 'Türkiye\'de kiralık villa ilanları. Denize sıfır konumlarda bahçeli, havuzlu lüks villalar.',
    keywords: ['kiralık villa', 'kiralık villalar', 'kiralık villa ilanları', 'kiralık villa fiyatları'],
    functionName: 'KiralikVilla',
  },
};

Object.entries(adaptations).forEach(([slug, config]) => {
  const filePath = path.join(baseDir, slug, 'page.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace title
  content = content.replace(/Satılık Daire/g, config.title);
  content = content.replace(/satilik-daire/g, slug);
  content = content.replace(/satilik\?propertyType=daire/g, `${config.status}?propertyType=${config.propertyType}`);
  content = content.replace(/property_type: \['daire'\]/g, `property_type: ['${config.propertyType}']`);
  content = content.replace(/status: 'satilik'/g, `status: '${config.status}'`);
  content = content.replace(/SatilikDairePage/g, `${config.functionName}Page`);
  content = content.replace(/getDaireFAQs/g, `get${config.functionName}FAQs`);
  content = content.replace(/daireListings/g, `${config.propertyType}Listings`);
  content = content.replace(/daire ilanları/g, `${config.propertyType} ilanları`);
  content = content.replace(/Daire/g, config.title.replace('Kiralık ', '').replace('Satılık ', ''));
  content = content.replace(/daireyi/g, config.propertyType === 'villa' ? 'villayı' : config.propertyType === 'yazlik' ? 'yazlığı' : config.propertyType === 'ev' ? 'evi' : 'arsayı');
  content = content.replace(/Daireyi/g, config.title.replace('Kiralık ', '').replace('Satılık ', ''));
  
  // Replace description and keywords
  content = content.replace(
    /description: 'Türkiye\\'de satılık daire ilanları\. 1\+1\\'den 4\+1\\'e kadar geniş seçenek\. Güncel fiyatlar, mahalle rehberi ve yatırım analizi\. Uzman emlak danışmanlığı ile hayalinizdeki daireyi bulun\.'/g,
    `description: '${config.description} Güncel fiyatlar, mahalle rehberi ve yatırım analizi. Uzman emlak danışmanlığı ile hayalinizdeki ${config.propertyType === 'villa' ? 'villayı' : config.propertyType === 'yazlik' ? 'yazlığı' : config.propertyType === 'ev' ? 'evi' : 'arsayı'} bulun.'`
  );
  
  content = content.replace(
    /keywords: \[[\s\S]*?\]/,
    `keywords: ${JSON.stringify(config.keywords)}`
  );
  
  // Replace FAQ function name
  content = content.replace(
    /async function getDaireFAQs\(\)/g,
    `async function get${config.functionName}FAQs()`
  );
  content = content.replace(
    /await getDaireFAQs\(\)/g,
    `await get${config.functionName}FAQs()`
  );
  content = content.replace(
    /getHighPriorityQAEntries\('satilik-daire'/g,
    `getHighPriorityQAEntries('${slug}'`
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Adapted: ${slug}`);
});

console.log(`\n✅ Adapted ${Object.keys(adaptations).length} pages!`);
