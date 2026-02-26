const fs = require('fs');
const glob = require('glob');

const files = glob.sync('apps/web/app/**/*.tsx');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const h1Match = content.match(/<h1[^>]*>/g);
  if (h1Match && h1Match.length > 1) {
    console.log(file, 'has', h1Match.length, 'H1 tags');
  } else if (!h1Match && file.includes('page.tsx')) {
    console.log(file, 'has NO H1 tags');
  }
});
