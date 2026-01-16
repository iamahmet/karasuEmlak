#!/usr/bin/env tsx
/**
 * Vercel CRON_SECRET Direct Fix Script
 * 
 * Bu script Vercel'deki CRON_SECRET'i direkt olarak düzeltir.
 * Kullanıcıdan mevcut değeri alır, trim eder ve tekrar set eder.
 * 
 * Kullanım:
 *   tsx scripts/fix-vercel-cron-secret-direct.ts [project-name] [environment] [current-value]
 * 
 * Örnek:
 *   tsx scripts/fix-vercel-cron-secret-direct.ts web production "your-secret-here"
 */

import { execSync } from 'child_process';
import { join } from 'path';

const PROJECT_DIRS: Record<string, string> = {
  web: join(process.cwd(), 'apps/web'),
  admin: join(process.cwd(), 'apps/admin'),
};

const ENVIRONMENTS = ['production', 'preview', 'development'] as const;
type Environment = typeof ENVIRONMENTS[number];

function setVercelEnvVar(projectDir: string, key: string, value: string, environment: Environment): void {
  try {
    // Önce mevcut değeri sil
    console.log(`  🗑️  Mevcut ${key} siliniyor...`);
    try {
      execSync(`cd "${projectDir}" && vercel env rm ${key} ${environment} --yes`, { 
        encoding: 'utf-8', 
        stdio: 'pipe' 
      });
    } catch (e) {
      // Ignore if doesn't exist
    }
    
    // Yeni temizlenmiş değeri ekle
    console.log(`  ➕ Yeni ${key} ekleniyor...`);
    const cmd = `cd "${projectDir}" && echo "${value}" | vercel env add ${key} ${environment} 2>&1`;
    const output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`  ✅ ${key} başarıyla güncellendi (${environment})`);
  } catch (error: any) {
    console.error(`  ❌ ${key} güncellenemedi (${environment}):`, error.message);
    if (error.stdout) console.error('   stdout:', error.stdout);
    if (error.stderr) console.error('   stderr:', error.stderr);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const projectName = args[0] || 'web';
  const environment = (args[1] || 'production') as Environment;
  const currentValue = args[2];

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

  if (!currentValue) {
    console.error(`❌ Mevcut CRON_SECRET değeri gerekli`);
    console.error(`   Kullanım: tsx scripts/fix-vercel-cron-secret-direct.ts [project] [environment] [current-value]`);
    console.error(`   Örnek: tsx scripts/fix-vercel-cron-secret-direct.ts web production "your-secret"`);
    process.exit(1);
  }

  const projectDir = PROJECT_DIRS[projectName];
  console.log(`🔧 ${projectName} projesi için CRON_SECRET düzeltiliyor...`);
  console.log(`   Environment: ${environment}`);
  console.log(`   Proje dizini: ${projectDir}\n`);

  // Whitespace kontrolü
  const trimmedValue = currentValue.trim();
  const hasWhitespace = currentValue !== trimmedValue;

  if (!hasWhitespace) {
    console.log('✅ CRON_SECRET zaten temiz (whitespace yok)');
    console.log('   Ancak yine de güncelliyoruz...\n');
  } else {
    console.log(`⚠️  Whitespace tespit edildi:`);
    console.log(`   Orijinal uzunluk: ${currentValue.length}`);
    console.log(`   Temizlenmiş uzunluk: ${trimmedValue.length}`);
    console.log(`   Fark: ${currentValue.length - trimmedValue.length} karakter\n`);
  }

  // Trim edilmiş değeri set et
  console.log('📤 Temizlenmiş CRON_SECRET Vercel\'e gönderiliyor...');
  setVercelEnvVar(projectDir, 'CRON_SECRET', trimmedValue, environment);

  console.log('\n✅ Tamamlandı!');
  console.log('   Şimdi Vercel\'de yeniden deploy edebilirsiniz.');
}

main();
