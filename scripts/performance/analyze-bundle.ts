/**
 * Bundle Analysis Script
 * Analyzes bundle sizes and identifies optimization opportunities
 */

import * as fs from 'fs';
import * as path from 'path';

interface BundleInfo {
  name: string;
  size: number;
  gzipped?: number;
  path: string;
}

/**
 * Analyze Next.js build output
 */
async function analyzeBundle() {
  const buildDir = path.join(process.cwd(), 'apps/web/.next');
  
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run "pnpm build" first.');
    process.exit(1);
  }

  console.log('📊 Analyzing bundle...\n');

  // Check for build artifacts
  const staticDir = path.join(buildDir, 'static');
  if (fs.existsSync(staticDir)) {
    console.log('✅ Static files found');
    analyzeDirectory(staticDir, 'static');
  }

  // Check for server chunks
  const serverDir = path.join(buildDir, 'server');
  if (fs.existsSync(serverDir)) {
    console.log('✅ Server files found');
    analyzeDirectory(serverDir, 'server');
  }
}

function analyzeDirectory(dir: string, prefix: string) {
  const files = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
  const bundles: BundleInfo[] = [];

  for (const file of files) {
    if (file.isFile()) {
      const filePath = path.join(file.path || dir, file.name);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      
      if (size > 100 * 1024) { // Files larger than 100KB
        bundles.push({
          name: file.name,
          size,
          path: filePath,
        });
      }
    }
  }

  // Sort by size
  bundles.sort((a, b) => b.size - a.size);

  console.log(`\n📦 Largest files in ${prefix}:`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  bundles.slice(0, 20).forEach((bundle) => {
    const sizeKB = (bundle.size / 1024).toFixed(2);
    const sizeMB = (bundle.size / (1024 * 1024)).toFixed(2);
    const sizeStr = bundle.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
    console.log(`${sizeStr.padEnd(10)} ${bundle.name}`);
  });

  const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
  const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total: ${totalMB} MB (files > 100KB)`);
}

if (require.main === module) {
  analyzeBundle().catch(console.error);
}

export { analyzeBundle };
