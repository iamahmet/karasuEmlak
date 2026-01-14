/**
 * Fix syntax errors in generated cornerstone pages
 * Replace 'Türkiye'de with 'Türkiye\'de
 */

import * as fs from 'fs';
import * as path from 'path';

const baseDir = path.join(process.cwd(), 'apps/web/app/[locale]');

const pages = [
  'satilik-villa',
  'satilik-yazlik',
  'satilik-ev',
  'satilik-arsa',
  'kiralik-daire',
  'kiralik-ev',
  'kiralik-villa',
];

pages.forEach(slug => {
  const filePath = path.join(baseDir, slug, 'page.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix all instances of unescaped apostrophes in strings
  // Fix 'Türkiye'de
  content = content.replace(/'Türkiye'de/g, "'Türkiye\\'de");
  // Fix 1+1'den, 4+1'e, etc.
  content = content.replace(/(\d\+1)'den/g, "$1\\'den");
  content = content.replace(/(\d\+1)'e/g, "$1\\'e");
  // Fix any other unescaped apostrophes in single-quoted strings
  content = content.replace(/([^\\])'([a-z])/g, "$1\\'$2");
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Fixed: ${filePath}`);
});

console.log(`\n✅ Fixed ${pages.length} files!`);
