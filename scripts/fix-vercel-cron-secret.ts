#!/usr/bin/env tsx
/**
 * Vercel CRON_SECRET Whitespace Düzeltme Scripti
 * 
 * Bu script Vercel'deki CRON_SECRET environment variable'ındaki
 * leading/trailing whitespace'i temizler ve yeniden set eder.
 * 
 * Kullanım:
 *   tsx scripts/fix-vercel-cron-secret.ts [project-name] [environment]
 * 
 * Örnek:
 *   tsx scripts/fix-vercel-cron-secret.ts web production
 *   tsx scripts/fix-vercel-cron-secret.ts admin production
 */

import { execSync } from 'child_process';
import { join } from 'path';

const PROJECT_DIRS: Record<string, string> = {
  web: join(process.cwd(), 'apps/web'),
  admin: join(process.cwd(), 'apps/admin'),
};

const ENVIRONMENTS = ['production', 'preview', 'development'] as const;
type Environment = typeof ENVIRONMENTS[number];

function getVercelEnvVar(projectDir: string, key: string, environment: Environment): string | null {
  try {
    const cmd = `cd "${projectDir}" && vercel env pull .env.vercel --environment=${environment} --yes 2>&1 || echo ""`;
    execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    
    // .env.vercel dosyasını oku
    const fs = require('fs');
    const envPath = join(projectDir, '.env.vercel');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const match = line.match(new RegExp(`^${key}=(.+)$`));
        if (match) {
          return match[1].trim();
        }
      }
      // Temizle
      fs.unlinkSync(envPath);
    }
  } catch (error) {
    // Ignore errors
  }
  return null;
}

function setVercelEnvVar(projectDir: string, key: string, value: string, environment: Environment): void {
  try {
    // Vercel env add komutu ile set et
    const cmd = `cd "${projectDir}" && echo "${value}" | vercel env add ${key} ${environment} --force 2>&1`;
    const output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`  ✅ ${key} güncellendi (${environment})`);
  } catch (error: any) {
    console.error(`  ❌ ${key} güncellenemedi (${environment}):`, error.message);
  }
}

function main() {
  const args = process.argv.slice(2);
  const projectName = args[0] || 'web';
  const environment = (args[1] || 'production') as Environment;

  if (!PROJECT_DIRS[projectName]) {
    console.error(`❌ Geçersiz proje adı: ${projectName}`);
    console.error(`   Geçerli projeler: ${Object.keys(PROJECT_DIRS).join(', ')}`);
    process.exit(1);
  }

  if (!ENVIRONMENTS.includes(environment)) {
    console.error(`❌ Geçersiz environment: ${environment}`);
    console.error(`   Geçerli environments: ${ENVIRONMENTS.join(', ')}`);
    process.exit(1);
  }

  const projectDir = PROJECT_DIRS[projectName];
  console.log(`🔧 ${projectName} projesi için CRON_SECRET düzeltiliyor...`);
  console.log(`   Environment: ${environment}`);
  console.log(`   Proje dizini: ${projectDir}\n`);

  // Mevcut CRON_SECRET'i al
  console.log('📥 Mevcut CRON_SECRET alınıyor...');
  const currentValue = getVercelEnvVar(projectDir, 'CRON_SECRET', environment);

  if (!currentValue) {
    console.error('❌ CRON_SECRET bulunamadı veya okunamadı');
    console.error('   Vercel CLI ile manuel olarak kontrol edin:');
    console.error(`   cd ${projectDir} && vercel env ls`);
    process.exit(1);
  }

  // Whitespace kontrolü
  const trimmedValue = currentValue.trim();
  const hasWhitespace = currentValue !== trimmedValue;

  if (!hasWhitespace) {
    console.log('✅ CRON_SECRET zaten temiz (whitespace yok)');
    process.exit(0);
  }

  console.log(`⚠️  Whitespace tespit edildi:`);
  console.log(`   Orijinal uzunluk: ${currentValue.length}`);
  console.log(`   Temizlenmiş uzunluk: ${trimmedValue.length}`);
  console.log(`   Fark: ${currentValue.length - trimmedValue.length} karakter\n`);

  // Trim edilmiş değeri set et
  console.log('📤 Temizlenmiş CRON_SECRET Vercel\'e gönderiliyor...');
  setVercelEnvVar(projectDir, 'CRON_SECRET', trimmedValue, environment);

  console.log('\n✅ Tamamlandı!');
  console.log('   Şimdi Vercel\'de yeniden deploy edebilirsiniz.');
}

main();
