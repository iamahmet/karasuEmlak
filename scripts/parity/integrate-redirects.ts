#!/usr/bin/env tsx
/**
 * Integrate redirect mappings into next.config
 * 
 * Reads redirect-map.json and generates redirects configuration
 * for Next.js next.config.mjs
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const REDIRECT_MAP_FILE = path.join(process.cwd(), 'scripts/parity/redirect-map.json');
const NEXT_CONFIG_FILE = path.join(process.cwd(), 'apps/web/next.config.mjs');

interface RedirectMapping {
  from: string;
  to: string;
  reason: string;
  status: 301 | 302;
}

/**
 * Generate redirects code for next.config.mjs
 */
function generateRedirectsCode(redirects: RedirectMapping[]): string {
  if (redirects.length === 0) {
    return '    // No redirects from parity audit';
  }
  
  let code = '    // Redirects from parity audit\n';
  code += '    ...(\n';
  code += '      await import(\'./scripts/parity/redirect-map.json\', { assert: { type: \'json\' } })\n';
  code += '    ).then(m => m.default.map(redirect => ({\n';
  code += '      source: redirect.from,\n';
  code += '      destination: redirect.to,\n';
  code += '      permanent: redirect.status === 301,\n';
  code += '    }))),\n';
  
  return code;
}

/**
 * Integrate redirects into next.config.mjs
 */
async function integrateRedirects(): Promise<void> {
  console.log('🔗 Integrating redirects into next.config.mjs...\n');
  
  // Load redirect map
  let redirects: RedirectMapping[] = [];
  try {
    const content = await fs.readFile(REDIRECT_MAP_FILE, 'utf-8');
    redirects = JSON.parse(content);
    console.log(`Loaded ${redirects.length} redirects from ${REDIRECT_MAP_FILE}`);
  } catch (error) {
    console.log(`⚠️  No redirect map found: ${REDIRECT_MAP_FILE}`);
    console.log('   Run `npm run parity:fix` first to generate redirects.');
    return;
  }
  
  if (redirects.length === 0) {
    console.log('✅ No redirects to integrate.');
    return;
  }
  
  // Read next.config.mjs
  let configContent: string;
  try {
    configContent = await fs.readFile(NEXT_CONFIG_FILE, 'utf-8');
  } catch (error) {
    console.error(`Error reading ${NEXT_CONFIG_FILE}:`, error);
    return;
  }
  
  // Check if redirects already exist
  if (configContent.includes('redirects from parity audit')) {
    console.log('⚠️  Redirects already integrated. Skipping...');
    return;
  }
  
  // Find where to insert redirects
  const redirectsCode = generateRedirectsCode(redirects);
  
  // Look for async redirects() function
  if (configContent.includes('async redirects()')) {
    // Insert into existing redirects function
    const redirectsMatch = configContent.match(/(async redirects\(\)\s*\{[\s\S]*?return\s*\[)([\s\S]*?)(\];)/);
    if (redirectsMatch) {
      const before = redirectsMatch[1];
      const existing = redirectsMatch[2];
      const after = redirectsMatch[3];
      
      const newContent = before + '\n' + redirectsCode + existing + after;
      configContent = configContent.replace(redirectsMatch[0], newContent);
    } else {
      console.log('⚠️  Could not find redirects() function structure. Manual integration required.');
      console.log('\nAdd this to your next.config.mjs:\n');
      console.log(redirectsCode);
      return;
    }
  } else {
    // Add new redirects function
    const exportDefaultMatch = configContent.match(/(export default\s+)(\{)/);
    if (exportDefaultMatch) {
      const before = exportDefaultMatch[0];
      const after = configContent.substring(configContent.indexOf(exportDefaultMatch[0]) + before.length);
      
      const newRedirectsFunction = `
  async redirects() {
    return [
${redirectsCode}    ];
  },
`;
      configContent = before + newRedirectsFunction + after;
    } else {
      console.log('⚠️  Could not find export default. Manual integration required.');
      console.log('\nAdd this to your next.config.mjs:\n');
      console.log('async redirects() {');
      console.log('  return [');
      console.log(redirectsCode);
      console.log('  ];');
      console.log('},');
      return;
    }
  }
  
  // Write updated config
  await fs.writeFile(NEXT_CONFIG_FILE, configContent, 'utf-8');
  console.log(`✅ Integrated ${redirects.length} redirects into ${NEXT_CONFIG_FILE}`);
  console.log('\n⚠️  Review the changes and test before deploying!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  integrateRedirects().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { integrateRedirects };
