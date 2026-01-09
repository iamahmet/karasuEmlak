/**
 * Local Environment Health Check
 * Checks: ports, env vars, dependencies, file structure
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local if exists
dotenv.config({ path: '.env.local' });

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const checks: HealthCheck[] = [];

// Check 1: Required environment variables
function checkEnvVars() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const optional = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'RESEND_API_KEY',
    'OPENAI_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  const missingOptional = optional.filter(key => !process.env[key]);

  if (missing.length > 0) {
    checks.push({
      name: 'Environment Variables (Required)',
      status: 'fail',
      message: `Missing: ${missing.join(', ')}`,
    });
  } else {
    checks.push({
      name: 'Environment Variables (Required)',
      status: 'pass',
      message: 'All required env vars present',
    });
  }

  if (missingOptional.length > 0) {
    checks.push({
      name: 'Environment Variables (Optional)',
      status: 'warn',
      message: `Missing optional: ${missingOptional.join(', ')}`,
    });
  } else {
    checks.push({
      name: 'Environment Variables (Optional)',
      status: 'pass',
      message: 'All optional env vars present',
    });
  }
}

// Check 2: Port availability
async function checkPorts() {
  const ports = [3000, 3001];
  const { default: net } = await import('net');

  for (const port of ports) {
    const available = await new Promise<boolean>((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.close(() => resolve(true));
      });
      server.on('error', () => resolve(false));
    });

    checks.push({
      name: `Port ${port} Availability`,
      status: available ? 'pass' : 'fail',
      message: available ? 'Port is available' : 'Port is in use',
    });
  }
}

// Check 3: Critical directories exist
function checkDirectories() {
  const required = [
    'apps/web',
    'apps/admin',
    'packages/ui',
    'packages/lib',
    'packages/config',
    'scripts',
    'docs',
  ];

  for (const dir of required) {
    const exists = fs.existsSync(path.join(process.cwd(), dir));
    checks.push({
      name: `Directory: ${dir}`,
      status: exists ? 'pass' : 'fail',
      message: exists ? 'Exists' : 'Missing',
    });
  }
}

// Check 4: Critical files exist
function checkFiles() {
  const required = [
    'apps/web/app/sitemap.ts',
    'apps/web/app/robots.ts',
    'apps/web/app/layout.tsx',
    'apps/web/app/[locale]/layout.tsx',
    'package.json',
    'turbo.json',
    'pnpm-workspace.yaml',
  ];

  for (const file of required) {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    checks.push({
      name: `File: ${file}`,
      status: exists ? 'pass' : 'fail',
      message: exists ? 'Exists' : 'Missing',
    });
  }
}

// Check 5: Node modules
function checkNodeModules() {
  const apps = ['apps/web', 'apps/admin'];
  for (const app of apps) {
    const nodeModulesPath = path.join(process.cwd(), app, 'node_modules');
    const exists = fs.existsSync(nodeModulesPath);
    checks.push({
      name: `Node Modules: ${app}`,
      status: exists ? 'pass' : 'warn',
      message: exists ? 'Installed' : 'Not installed (run pnpm install)',
    });
  }
}

// Main function
async function runHealthCheck() {
  console.log('🔍 Running Local Environment Health Check...\n');

  checkEnvVars();
  await checkPorts();
  checkDirectories();
  checkFiles();
  checkNodeModules();

  // Print results
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('LOCAL ENVIRONMENT HEALTH CHECK RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const passed = checks.filter(c => c.status === 'pass').length;
  const failed = checks.filter(c => c.status === 'fail').length;
  const warned = checks.filter(c => c.status === 'warn').length;

  checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${check.name}: ${check.message}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Summary: ${passed} passed, ${warned} warnings, ${failed} failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runHealthCheck().catch(console.error);
}

export { runHealthCheck };
