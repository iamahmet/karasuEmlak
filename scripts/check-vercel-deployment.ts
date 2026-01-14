#!/usr/bin/env tsx

/**
 * Check Vercel deployment configuration
 * Verifies that admin and web apps are correctly configured
 */

import { execSync } from 'child_process';

console.log('🔍 Vercel Deployment Configuration Check\n');

// Check if vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch {
  console.error('❌ Vercel CLI is not installed.');
  console.log('   Install it with: npm install -g vercel\n');
  process.exit(1);
}

console.log('📋 Checking project configuration...\n');

// Check web project
console.log('🌐 Web Project (karasuemlak.net):');
try {
  const webProject = execSync('cd apps/web && vercel project ls 2>&1', { encoding: 'utf-8' });
  console.log('   ✅ Vercel project found');
  console.log('   Project info:', webProject.split('\n')[0]);
} catch (error: any) {
  console.log('   ⚠️  Could not detect web project');
  console.log('   Run: cd apps/web && vercel link');
}

console.log('\n');

// Check admin project
console.log('🔐 Admin Project (admin.karasuemlak.net):');
try {
  const adminProject = execSync('cd apps/admin && vercel project ls 2>&1', { encoding: 'utf-8' });
  console.log('   ✅ Vercel project found');
  console.log('   Project info:', adminProject.split('\n')[0]);
} catch (error: any) {
  console.log('   ⚠️  Could not detect admin project');
  console.log('   Run: cd apps/admin && vercel link');
}

console.log('\n');

// Check vercel.json files
console.log('📄 Checking vercel.json files...\n');

const fs = require('fs');
const path = require('path');

const webVercelJson = path.join(process.cwd(), 'apps/web/vercel.json');
const adminVercelJson = path.join(process.cwd(), 'apps/admin/vercel.json');

if (fs.existsSync(webVercelJson)) {
  const webConfig = JSON.parse(fs.readFileSync(webVercelJson, 'utf-8'));
  console.log('🌐 Web vercel.json:');
  console.log('   Root Directory:', webConfig.rootDirectory || 'not set (default: apps/web)');
  console.log('   Build Command:', webConfig.buildCommand || 'not set');
}

if (fs.existsSync(adminVercelJson)) {
  const adminConfig = JSON.parse(fs.readFileSync(adminVercelJson, 'utf-8'));
  console.log('\n🔐 Admin vercel.json:');
  console.log('   Root Directory:', adminConfig.rootDirectory || 'not set (default: apps/admin)');
  console.log('   Build Command:', adminConfig.buildCommand || 'not set');
}

console.log('\n✅ Configuration check complete!');
console.log('\n📝 Next Steps:');
console.log('   1. Verify Root Directory in Vercel Dashboard');
console.log('   2. Check domain mappings');
console.log('   3. Ensure admin.karasuemlak.net is mapped to admin project');
console.log('   4. Ensure karasuemlak.net is mapped to web project\n');
