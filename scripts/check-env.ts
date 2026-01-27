#!/usr/bin/env tsx
/**
 * ENV Doctor - Environment Variables Validator
 * 
 * Checks all required env vars, trims whitespace, validates format
 * 
 * Usage:
 *   pnpm tsx scripts/check-env.ts
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import * as dotenv from 'dotenv';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

interface EnvVar {
  key: string;
  value: string | undefined;
  required: boolean;
  serverOnly: boolean;
  hasWhitespace: boolean;
  isEmpty: boolean;
  isValid: boolean;
  issues: string[];
}

// Required env vars (from codebase analysis)
const REQUIRED_ENV_VARS: Array<{
  key: string;
  serverOnly?: boolean;
  description?: string;
}> = [
  // Supabase (Required)
  { key: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Supabase project URL' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', description: 'Supabase anon key (public)' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', serverOnly: true, description: 'Supabase service role key (server-only)' },
  { key: 'SUPABASE_JWT_SECRET', serverOnly: true, description: 'Supabase JWT secret' },
  
  // Optional but commonly used
  { key: 'NEXT_PUBLIC_SITE_URL', description: 'Site URL for canonical links' },
  { key: 'CLOUDINARY_CLOUD_NAME', description: 'Cloudinary cloud name' },
  { key: 'CLOUDINARY_API_KEY', description: 'Cloudinary API key' },
  { key: 'CLOUDINARY_API_SECRET', serverOnly: true, description: 'Cloudinary API secret' },
  
  // AI Services (Optional)
  { key: 'OPENAI_API_KEY', serverOnly: true, description: 'OpenAI API key' },
  { key: 'GEMINI_API_KEY', serverOnly: true, description: 'Google Gemini API key' },
  
  // Analytics (Optional)
  { key: 'NEXT_PUBLIC_GA4_MEASUREMENT_ID', description: 'Google Analytics 4 ID' },
  
  // Cron (Optional)
  { key: 'CRON_SECRET', serverOnly: true, description: 'Cron job secret (must not have whitespace)' },
];

function checkEnvVar(key: string, required: boolean, serverOnly: boolean): EnvVar {
  const rawValue = process.env[key];
  const value = rawValue?.trim();
  
  const hasWhitespace = rawValue !== value;
  const isEmpty = !value || value.length === 0;
  const isValid = !isEmpty && !hasWhitespace;
  
  const issues: string[] = [];
  if (required && isEmpty) {
    issues.push('Missing required variable');
  }
  if (hasWhitespace) {
    issues.push('Has leading/trailing whitespace');
  }
  if (key === 'CRON_SECRET' && hasWhitespace) {
    issues.push('CRITICAL: CRON_SECRET whitespace will cause build failures');
  }
  
  return {
    key,
    value: rawValue,
    required,
    serverOnly,
    hasWhitespace,
    isEmpty,
    isValid: required ? isValid : true,
    issues,
  };
}

function generateEnvExample(): string {
  let example = '# ============================================\n';
  example += '# KARASU EMLAK - ENVIRONMENT VARIABLES\n';
  example += '# ============================================\n';
  example += '# Copy this file to .env.local and fill in your values\n';
  example += '# cp .env.example .env.local\n\n';
  
  example += '# ============================================\n';
  example += '# SUPABASE (Required)\n';
  example += '# ============================================\n';
  example += 'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n';
  example += 'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n';
  example += 'SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n';
  example += 'SUPABASE_JWT_SECRET=your-jwt-secret\n\n';
  
  example += '# ============================================\n';
  example += '# SITE CONFIGURATION (Optional)\n';
  example += '# ============================================\n';
  example += 'NEXT_PUBLIC_SITE_URL=https://www.karasuemlak.net\n\n';
  
  example += '# ============================================\n';
  example += '# CLOUDINARY (Optional)\n';
  example += '# ============================================\n';
  example += 'CLOUDINARY_CLOUD_NAME=your-cloud-name\n';
  example += 'CLOUDINARY_API_KEY=your-api-key\n';
  example += 'CLOUDINARY_API_SECRET=your-api-secret\n\n';
  
  example += '# ============================================\n';
  example += '# AI SERVICES (Optional)\n';
  example += '# ============================================\n';
  example += 'OPENAI_API_KEY=sk-your-openai-key\n';
  example += 'GEMINI_API_KEY=your-gemini-key\n\n';
  
  example += '# ============================================\n';
  example += '# ANALYTICS (Optional)\n';
  example += '# ============================================\n';
  example += 'NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX\n\n';
  
  example += '# ============================================\n';
  example += '# CRON (Optional)\n';
  example += '# ============================================\n';
  example += '# IMPORTANT: Use printf, NOT echo (no whitespace!)\n';
  example += '# printf "secret" | vercel env add CRON_SECRET production\n';
  example += 'CRON_SECRET=your-cron-secret\n';
  
  return example;
}

async function main() {
  console.log('🏥 ENV Doctor - Environment Variables Validator\n');
  
  const results: EnvVar[] = [];
  let criticalIssues = 0;
  let warnings = 0;
  
  // Check all required vars
  for (const env of REQUIRED_ENV_VARS) {
    const result = checkEnvVar(env.key, env.required !== false, env.serverOnly || false);
    results.push(result);
    
    if (result.issues.length > 0) {
      if (result.required) {
        criticalIssues++;
        console.error(`❌ ${result.key}: ${result.issues.join(', ')}`);
      } else {
        warnings++;
        console.warn(`⚠️  ${result.key}: ${result.issues.join(', ')}`);
      }
    } else if (result.required) {
      console.log(`✅ ${result.key}: OK`);
    }
  }
  
  // Check for CRON_SECRET whitespace (critical)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && cronSecret !== cronSecret.trim()) {
    criticalIssues++;
    console.error(`❌ CRON_SECRET: Has whitespace (will cause build failures)`);
  }
  
  // Generate .env.example if missing
  const examplePath = resolve(process.cwd(), 'apps/web/.env.example');
  if (!existsSync(examplePath)) {
    console.log('\n📝 Generating .env.example...');
    const example = generateEnvExample();
    require('fs').writeFileSync(examplePath, example, 'utf-8');
    console.log(`✅ Created: ${examplePath}`);
  }
  
  // Summary
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Valid: ${results.filter(r => r.isValid && r.required).length}`);
  console.log(`   ❌ Critical Issues: ${criticalIssues}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  
  if (criticalIssues > 0) {
    console.error(`\n❌ CRITICAL: Fix ${criticalIssues} issue(s) before continuing!`);
    process.exit(1);
  }
  
  if (warnings > 0) {
    console.warn(`\n⚠️  WARNING: ${warnings} optional variable(s) have issues`);
  } else {
    console.log(`\n✅ All environment variables are valid!`);
  }
  
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
