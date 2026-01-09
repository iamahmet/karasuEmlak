#!/usr/bin/env tsx
/**
 * Vercel Environment Variables Ekleme Scripti
 * Tüm environment variables'ları Vercel projelerine otomatik ekler
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const WEB_PROJECT_ID = 'prj_fUdRiZPneoh69aairgMNfRe02tK1';
const TEAM_SLUG = 'poi369';

interface EnvVar {
  key: string;
  value: string;
  environments: ('production' | 'preview' | 'development')[];
}

// Web App Environment Variables
const webEnvVars: EnvVar[] = [
  // Site Configuration
  {
    key: 'NEXT_PUBLIC_SITE_URL',
    value: 'https://www.karasuemlak.net',
    environments: ['production', 'preview', 'development'],
  },
  {
    key: 'NODE_ENV',
    value: 'production',
    environments: ['production'],
  },
  
  // Supabase Configuration
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    value: 'https://lbfimbcvvvbczllhqqlf.supabase.co',
    environments: ['production', 'preview', 'development'],
  },
  {
    key: 'SUPABASE_URL',
    value: 'https://lbfimbcvvvbczllhqqlf.supabase.co',
    environments: ['production', 'preview', 'development'],
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws',
    environments: ['production', 'preview', 'development'],
  },
  {
    key: 'SUPABASE_ANON_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws',
    environments: ['production', 'preview', 'development'],
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMDQ5OSwiZXhwIjoyMDgxMzk2NDk5fQ.gzQQlg-0iKGeMJe41s-89U1MGvlgSwBIWPGe61Zc2zo',
    environments: ['production', 'preview', 'development'],
  },
  {
    key: 'SUPABASE_JWT_SECRET',
    value: 'IGuVzv1NGhamrNH9/mWPbidTKq7dwd8Jj6LedwgtlxNByHwafu32x6mKezMcPWLguJ5iCAY3N6DQrbvYTQfJXw==',
    environments: ['production', 'preview', 'development'],
  },
  
  // Supabase Database
  {
    key: 'SUPABASE_DB_HOST',
    value: 'db.lbfimbcvvvbczllhqqlf.supabase.co',
    environments: ['production', 'preview'],
  },
  {
    key: 'SUPABASE_DB_PORT',
    value: '5432',
    environments: ['production', 'preview'],
  },
  {
    key: 'SUPABASE_DB_NAME',
    value: 'karasuEmlak',
    environments: ['production', 'preview'],
  },
  {
    key: 'SUPABASE_DB_USER',
    value: 'postgres',
    environments: ['production', 'preview'],
  },
  {
    key: 'SUPABASE_DB_PASSWORD',
    value: 'A1683myPX87czfXR',
    environments: ['production', 'preview'],
  },
  
  // Cloudinary Configuration
  {
    key: 'CLOUDINARY_CLOUD_NAME',
    value: 'dqucm2ffl',
    environments: ['production', 'preview', 'development'],
  },
  {
    key: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    value: 'dqucm2ffl',
    environments: ['production', 'preview', 'development'],
  },
  {
    key: 'CLOUDINARY_API_KEY',
    value: '475897588713275',
    environments: ['production', 'preview', 'development'],
  },
  {
    key: 'CLOUDINARY_API_SECRET',
    value: 'ExkLcxp3v7kOQxzNdn_i0lWr5Jk',
    environments: ['production', 'preview', 'development'],
  },
  {
    key: 'CLOUDINARY_URL',
    value: 'cloudinary://475897588713275:ExkLcxp3v7kOQxzNdn_i0lWr5Jk@dqucm2ffl',
    environments: ['production', 'preview', 'development'],
  },
  
  // AI Services
  // NOTE: Replace with your actual OpenAI API key
  {
    key: 'OPENAI_API_KEY',
    value: 'your-openai-api-key-here',
    environments: ['production', 'preview'],
  },
  
  // GitHub
  {
    key: 'GITHUB_PERSONAL_ACCESS_TOKEN',
    value: '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ak',
    environments: ['production'],
  },
];

function addEnvVar(projectId: string, key: string, value: string, environment: string, teamSlug?: string): void {
  try {
    const teamFlag = teamSlug ? `--scope=${teamSlug}` : '';
    const cmd = `cd ${join(process.cwd(), 'apps/web')} && echo "${value}" | vercel env add ${key} ${environment} ${teamFlag} --yes 2>&1`;
    
    console.log(`  Adding ${key} to ${environment}...`);
    const output = execSync(cmd, { 
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 30000,
    });
    
    if (output.includes('Already exists') || output.includes('already exists')) {
      console.log(`  ⚠️  ${key} already exists in ${environment}, skipping...`);
    } else if (output.includes('Added') || output.includes('added')) {
      console.log(`  ✅ ${key} added to ${environment}`);
    } else {
      console.log(`  ℹ️  ${key} in ${environment}: ${output.trim()}`);
    }
  } catch (error: any) {
    const errorMsg = error.stdout?.toString() || error.stderr?.toString() || error.message;
    if (errorMsg.includes('Already exists') || errorMsg.includes('already exists')) {
      console.log(`  ⚠️  ${key} already exists in ${environment}, skipping...`);
    } else {
      console.log(`  ❌ Error adding ${key} to ${environment}: ${errorMsg}`);
    }
  }
}

function main() {
  console.log('🚀 Vercel Environment Variables Setup\n');
  console.log(`📦 Project: karasu-emlak (${WEB_PROJECT_ID})\n`);
  
  // Vercel CLI kontrolü
  try {
    execSync('vercel --version', { stdio: 'ignore' });
  } catch {
    console.error('❌ Vercel CLI yüklü değil. Lütfen yükleyin: npm install -g vercel');
    process.exit(1);
  }
  
  // Vercel login kontrolü
  try {
    execSync('vercel whoami', { stdio: 'ignore' });
  } catch {
    console.error('❌ Vercel\'e login olmanız gerekiyor. Lütfen çalıştırın: vercel login');
    process.exit(1);
  }
  
  console.log('📝 Environment variables ekleniyor...\n');
  
  // Web app environment variables ekle
  for (const envVar of webEnvVars) {
    for (const env of envVar.environments) {
      addEnvVar(WEB_PROJECT_ID, envVar.key, envVar.value, env, TEAM_SLUG);
    }
  }
  
  console.log('\n✅ Environment variables setup tamamlandı!');
  console.log('\n📋 Sonraki adımlar:');
  console.log('1. Vercel Dashboard\'da environment variables\'ları kontrol edin');
  console.log('2. Admin panel için ayrı bir Vercel projesi oluşturun');
  console.log('3. Deploy edin: git push origin main');
}

main();
