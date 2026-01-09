#!/usr/bin/env tsx
/**
 * CSP Doctor Script
 * 
 * Checks Content-Security-Policy header configuration
 * Usage: pnpm security:csp:check
 */

import { execSync } from 'child_process';
import { setTimeout } from 'timers/promises';

const DEV_URL = 'http://localhost:3000';
const TEST_PATH = '/sss';

async function checkCSP() {
  console.log('🔍 CSP Doctor - Checking Content Security Policy\n');

  // Check if dev server is running
  try {
    execSync(`curl -s ${DEV_URL} > /dev/null 2>&1`, { stdio: 'ignore' });
  } catch {
    console.log('⚠️  Dev server is not running. Starting...\n');
    // Note: In a real scenario, you might want to start the server here
    console.log('Please start the dev server first: pnpm dev:web\n');
    process.exit(1);
  }

  // Wait a bit for server to be ready
  await setTimeout(2000);

  try {
    // Fetch headers
    const response = execSync(
      `curl -sI ${DEV_URL}${TEST_PATH}`,
      { encoding: 'utf-8' }
    );

    const lines = response.split('\n');
    const cspHeader = lines.find((line) =>
      line.toLowerCase().startsWith('content-security-policy:')
    );

    if (!cspHeader) {
      console.log('❌ Content-Security-Policy header not found!\n');
      return;
    }

    const cspValue = cspHeader.split(':')[1]?.trim() || '';
    console.log('✅ CSP Header Found:\n');
    console.log(`   ${cspValue}\n`);

    // Parse and validate CSP
    const directives = cspValue.split(';').map((d) => d.trim());
    console.log('📋 Directives:\n');

    const requiredDirectives = [
      'default-src',
      'script-src',
      'style-src',
      'img-src',
      'font-src',
      'connect-src',
      'object-src',
    ];

    const foundDirectives = new Set<string>();

    directives.forEach((directive) => {
      const [name] = directive.split(' ');
      foundDirectives.add(name);
      console.log(`   ✓ ${directive}`);
    });

    console.log('\n');

    // Check for required directives
    const missing = requiredDirectives.filter(
      (req) => !foundDirectives.has(req)
    );

    if (missing.length > 0) {
      console.log('⚠️  Missing directives:\n');
      missing.forEach((dir) => console.log(`   - ${dir}`));
      console.log('\n');
    } else {
      console.log('✅ All required directives present\n');
    }

    // Check for nonce in script-src
    if (cspValue.includes("'nonce-")) {
      console.log('✅ Nonce found in script-src\n');
    } else {
      console.log('⚠️  Nonce NOT found in script-src\n');
    }

    // Check for unsafe patterns
    const unsafePatterns = [
      { pattern: "'unsafe-inline'", severity: 'warning', context: 'script-src' },
      { pattern: "'unsafe-eval'", severity: 'warning', context: 'dev-only' },
      { pattern: 'https://*', severity: 'info', context: 'connect-src' },
    ];

    unsafePatterns.forEach(({ pattern, severity, context }) => {
      if (cspValue.includes(pattern)) {
        const icon = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';
        const note = context === 'dev-only' && process.env.NODE_ENV === 'development' 
          ? ' (OK in dev)' 
          : context === 'script-src' && process.env.NODE_ENV === 'production'
          ? ' (NOT OK in prod)'
          : '';
        console.log(
          `${icon} Found ${severity.toUpperCase()}: "${pattern}" in CSP${note}\n`
        );
      }
    });

    // Check connect-src domains
    const connectSrcMatch = cspValue.match(/connect-src\s+([^;]+)/);
    if (connectSrcMatch) {
      const connectSrc = connectSrcMatch[1];
      console.log('📡 Connect-src domains:\n');
      const domains = connectSrc.split(' ').filter(d => d.trim());
      domains.forEach(domain => {
        const isRequired = ['supabase', 'sentry', 'cloudinary', 'google-analytics'].some(
          req => domain.includes(req)
        );
        console.log(`   ${isRequired ? '✓' : '•'} ${domain}`);
      });
      console.log('\n');
    }

    // Check debug endpoint
    try {
      const debugResponse = execSync(
        `curl -s ${DEV_URL}/api/debug/headers`,
        { encoding: 'utf-8' }
      );
      const debugData = JSON.parse(debugResponse);
      console.log('🔧 Debug Endpoint Response:\n');
      console.log(JSON.stringify(debugData, null, 2));
      console.log('\n');
    } catch (error) {
      console.log('⚠️  Debug endpoint not accessible\n');
    }

    console.log('✅ CSP check complete\n');
  } catch (error: any) {
    console.error('❌ Error checking CSP:', error.message);
    process.exit(1);
  }
}

checkCSP().catch(console.error);
