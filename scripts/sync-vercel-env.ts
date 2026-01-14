#!/usr/bin/env tsx
/**
 * Vercel Environment Variables Otomatik Senkronizasyon Scripti
 * 
 * Bu script:
 * 1. Local .env dosyalarını okur
 * 2. Vercel projelerini otomatik algılar
 * 3. Environment variables'ları otomatik ekler/günceller
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

interface EnvVar {
  key: string;
  value: string;
  environments: ('production' | 'preview' | 'development')[];
}

// Proje dizinleri
const ROOT_DIR = process.cwd();
const WEB_DIR = join(ROOT_DIR, 'apps/web');
const ADMIN_DIR = join(ROOT_DIR, 'apps/admin');

// Environment dosyaları (öncelik sırasına göre)
const ENV_FILES = [
  '.env.local',
  '.env.production.local',
  '.env',
  '.env.production',
];

/**
 * .env dosyasını oku ve parse et
 */
function readEnvFile(dir: string): Record<string, string> {
  for (const envFile of ENV_FILES) {
    const envPath = join(dir, envFile);
    if (existsSync(envPath)) {
      try {
        const content = readFileSync(envPath, 'utf-8');
        const parsed: Record<string, string> = {};
        
        // Satır satır parse et
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          // Boş satırları ve yorumları atla
          if (!trimmed || trimmed.startsWith('#')) continue;
          
          // KEY=VALUE formatını parse et
          const match = trimmed.match(/^([^=:#]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            
            // Tırnak işaretlerini kaldır
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            
            parsed[key] = value;
          }
        }
        
        console.log(`✅ ${envFile} bulundu: ${dir}`);
        return parsed;
      } catch (error) {
        console.warn(`⚠️  ${envFile} okunamadı: ${error}`);
      }
    }
  }
  return {};
}

/**
 * Vercel projesini otomatik link et
 */
function linkVercelProject(dir: string, projectName?: string, teamSlug?: string): string | null {
  try {
    // Önce mevcut link'i kontrol et
    const linkPath = join(dir, '.vercel', 'project.json');
    if (existsSync(linkPath)) {
      try {
        const linkData = JSON.parse(readFileSync(linkPath, 'utf-8'));
        if (linkData.projectId) {
          // Mevcut link'i test et
          try {
            const testCmd = `cd ${dir} && vercel project ls --json 2>&1`;
            execSync(testCmd, { encoding: 'utf-8', stdio: 'pipe', timeout: 5000 });
            console.log(`  ✅ Proje zaten link edilmiş: ${linkData.projectId}`);
            return linkData.projectId;
          } catch {
            // Link geçersiz, yeniden link et
            console.log(`  ⚠️  Mevcut link geçersiz, yeniden link ediliyor...`);
            // .vercel dizinini temizle
            execSync(`rm -rf "${join(dir, '.vercel')}"`, { stdio: 'pipe' });
          }
        }
      } catch {
        // Link dosyası bozuksa devam et
        console.log(`  ⚠️  Link dosyası bozuk, yeniden link ediliyor...`);
        execSync(`rm -rf "${join(dir, '.vercel')}"`, { stdio: 'pipe' });
      }
    }

    console.log(`  🔗 Proje link ediliyor...`);
    
    // Vercel projelerini listele
    const teamFlag = teamSlug ? `--scope=${teamSlug}` : '';
    const listCmd = `vercel project ls ${teamFlag} --json 2>/dev/null || echo "[]"`;
    const listOutput = execSync(listCmd, { encoding: 'utf-8', stdio: 'pipe' });
    const projects = JSON.parse(listOutput);
    
    let selectedProject: any = null;
    
    if (Array.isArray(projects) && projects.length > 0) {
      // Eğer projectName belirtilmişse, onu bul
      if (projectName) {
        selectedProject = projects.find((p: any) => 
          p.name?.toLowerCase().includes(projectName.toLowerCase())
        );
      }
      
      // Bulunamazsa ilk projeyi kullan
      if (!selectedProject) {
        selectedProject = projects[0];
      }
    }
    
    // Proje bulunduysa link et
    if (selectedProject) {
      console.log(`  📦 Proje bulundu: ${selectedProject.name} (${selectedProject.id})`);
      
      // .vercel dizinini oluştur
      const vercelDir = join(dir, '.vercel');
      if (!existsSync(vercelDir)) {
        execSync(`mkdir -p "${vercelDir}"`, { stdio: 'pipe' });
      }
      
      // project.json dosyasını oluştur
      const projectJson = {
        projectId: selectedProject.id,
        orgId: selectedProject.accountId || '',
      };
      
      writeFileSync(join(vercelDir, 'project.json'), JSON.stringify(projectJson, null, 2));
      console.log(`  ✅ Proje link edildi: ${selectedProject.id}`);
      return selectedProject.id;
    } else {
      console.log(`  ⚠️  Proje bulunamadı, manuel link gerekebilir`);
      console.log(`  💡 Çalıştırın: cd ${dir} && vercel link`);
      return null;
    }
  } catch (error: any) {
    console.warn(`  ⚠️  Otomatik link başarısız: ${error.message}`);
    console.log(`  💡 Manuel link için: cd ${dir} && vercel link`);
    return null;
  }
}

/**
 * Vercel proje ID'sini bul
 */
function getVercelProjectId(dir: string, projectName?: string): string | null {
  try {
    // Önce .vercel/project.json'dan oku
    const linkPath = join(dir, '.vercel', 'project.json');
    if (existsSync(linkPath)) {
      try {
        const linkData = JSON.parse(readFileSync(linkPath, 'utf-8'));
        if (linkData.projectId) return linkData.projectId;
      } catch {
        // Link dosyası bozuksa devam et
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Vercel'e environment variable ekle
 */
function addEnvVar(
  projectId: string | null,
  key: string,
  value: string,
  environment: 'production' | 'preview' | 'development',
  dir: string,
  teamSlug?: string
): boolean {
  if (!projectId) {
    console.log(`  ⚠️  Proje ID yok, atlanıyor: ${key}`);
    return false;
  }

  try {
    const teamFlag = teamSlug ? `--scope=${teamSlug}` : '';
    
    // Vercel CLI non-interactive format: vercel env add KEY VALUE ENVIRONMENT
    // Value'yu tırnak içine al ve özel karakterleri escape et
    const escapedValue = value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\$/g, '\\$')
      .replace(/`/g, '\\`');
    
    // Direkt value ile ekle (non-interactive)
    const cmd = `cd ${dir} && vercel env add ${key} "${escapedValue}" ${environment} ${teamFlag} 2>&1`;
    
    const output = execSync(cmd, {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 30000,
    });
    
    if (output.includes('Already exists') || output.includes('already exists')) {
      console.log(`  ⚠️  ${key} zaten var (${environment}), mevcut değer korunuyor`);
      return true;
    } else if (output.includes('Added') || output.includes('added') || output.includes('Created') || output.includes('Environment Variable')) {
      console.log(`  ✅ ${key} eklendi (${environment})`);
      return true;
    } else {
      // Başarılı olabilir ama mesaj farklı olabilir
      if (!output.includes('Error') && !output.includes('error') && !output.includes('Failed')) {
        console.log(`  ✅ ${key} eklendi (${environment})`);
        return true;
      }
      console.log(`  ℹ️  ${key} (${environment}): ${output.trim().substring(0, 80)}`);
      return false;
    }
  } catch (error: any) {
    const errorMsg = error.stdout?.toString() || error.stderr?.toString() || error.message;
    if (errorMsg.includes('Already exists') || errorMsg.includes('already exists')) {
      console.log(`  ⚠️  ${key} zaten var (${environment})`);
      return true;
    } else if (errorMsg.includes('Added') || errorMsg.includes('added') || errorMsg.includes('Created')) {
      console.log(`  ✅ ${key} eklendi (${environment})`);
      return true;
    } else {
      console.log(`  ❌ ${key} eklenemedi (${environment}): ${errorMsg.substring(0, 100)}`);
      return false;
    }
  }
}

/**
 * Environment variables'ları filtrele (sadece gerekli olanları)
 */
function filterEnvVars(envVars: Record<string, string>): EnvVar[] {
  const requiredKeys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_ADMIN_URL',
    'OPENAI_API_KEY',
    'CLOUDINARY_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const result: EnvVar[] = [];

  for (const [key, value] of Object.entries(envVars)) {
    // Boş değerleri atla
    if (!value || value.trim() === '') continue;

    // Sadece gerekli key'leri veya NEXT_PUBLIC_ ile başlayanları al
    if (requiredKeys.includes(key) || key.startsWith('NEXT_PUBLIC_')) {
      result.push({
        key,
        value: value.trim(),
        environments: ['production', 'preview', 'development'] as const,
      });
    }
  }

  return result;
}

/**
 * Ana fonksiyon
 */
function main() {
  console.log('🚀 Vercel Environment Variables Otomatik Senkronizasyon\n');

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

  // Team slug'ı bul (opsiyonel)
  let teamSlug: string | undefined;
  try {
    const teamOutput = execSync('vercel teams ls --json 2>/dev/null || echo "[]"', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    const teams = JSON.parse(teamOutput);
    if (Array.isArray(teams) && teams.length > 0) {
      // İlk team'i al veya "poi369" gibi bilinen bir team varsa onu kullan
      const knownTeam = teams.find((t: any) => t.slug === 'poi369');
      teamSlug = knownTeam?.slug || teams[0]?.slug;
    }
  } catch {
    // Team yoksa devam et
  }

  // WEB APP
  console.log('\n📦 Web App Environment Variables\n');
  const webEnvVars = readEnvFile(WEB_DIR);
  const webFiltered = filterEnvVars(webEnvVars);
  
  if (webFiltered.length === 0) {
    console.log('⚠️  Web app için environment variables bulunamadı.');
    console.log('   Lütfen apps/web/.env.local dosyası oluşturun.\n');
  } else {
    // Önce proje ID'sini bul veya link et
    let webProjectId = getVercelProjectId(WEB_DIR, 'web');
    if (!webProjectId) {
      console.log('🔗 Web app projesi link ediliyor...\n');
      webProjectId = linkVercelProject(WEB_DIR, 'web', teamSlug);
    }
    
    if (!webProjectId) {
      console.log('⚠️  Web app Vercel projesi bulunamadı.');
      console.log('   Lütfen apps/web dizininde "vercel link" komutunu çalıştırın.\n');
    } else {
      console.log(`✅ Web app proje ID: ${webProjectId}\n`);
      for (const envVar of webFiltered) {
        for (const env of envVar.environments) {
          addEnvVar(webProjectId, envVar.key, envVar.value, env, WEB_DIR, teamSlug);
        }
      }
    }
  }

  // ADMIN APP
  console.log('\n📦 Admin App Environment Variables\n');
  const adminEnvVars = readEnvFile(ADMIN_DIR);
  
  // Admin için web'den env vars kopyala (eğer admin'de yoksa)
  const mergedAdminEnvVars = { ...webEnvVars, ...adminEnvVars };
  
  // Admin için özel değerler
  if (!mergedAdminEnvVars.NEXT_PUBLIC_ADMIN_URL) {
    mergedAdminEnvVars.NEXT_PUBLIC_ADMIN_URL = 'https://admin.karasuemlak.net';
  }
  
  // Eğer hiç env vars yoksa, mevcut script'teki değerleri kullan
  if (Object.keys(mergedAdminEnvVars).length === 0) {
    console.log('⚠️  Local .env dosyaları bulunamadı, varsayılan değerler kullanılıyor...\n');
    // Varsayılan değerler (add-vercel-env.ts'den)
    mergedAdminEnvVars.NEXT_PUBLIC_SUPABASE_URL = 'https://lbfimbcvvvbczllhqqlf.supabase.co';
    mergedAdminEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws';
    mergedAdminEnvVars.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMDQ5OSwiZXhwIjoyMDgxMzk2NDk5fQ.gzQQlg-0iKGeMJe41s-89U1MGvlgSwBIWPGe61Zc2zo';
    mergedAdminEnvVars.NEXT_PUBLIC_SITE_URL = 'https://www.karasuemlak.net';
    mergedAdminEnvVars.NEXT_PUBLIC_ADMIN_URL = 'https://admin.karasuemlak.net';
  }
  
  const adminFiltered = filterEnvVars(mergedAdminEnvVars);
  
  if (adminFiltered.length === 0) {
    console.log('⚠️  Admin app için environment variables bulunamadı.');
    console.log('   Web app\'ten kopyalanıyor...\n');
  }
  
  // Önce proje ID'sini bul veya link et
  let adminProjectId = getVercelProjectId(ADMIN_DIR, 'admin');
  if (!adminProjectId) {
    console.log('🔗 Admin app projesi link ediliyor...\n');
    adminProjectId = linkVercelProject(ADMIN_DIR, 'admin', teamSlug);
  }
  
  if (!adminProjectId) {
    console.log('⚠️  Admin app Vercel projesi bulunamadı.');
    console.log('   Lütfen Vercel Dashboard\'dan admin projesini oluşturun veya');
    console.log('   apps/admin dizininde "vercel link" komutunu çalıştırın.\n');
  } else {
    console.log(`✅ Admin app proje ID: ${adminProjectId}\n`);
    for (const envVar of adminFiltered) {
      for (const env of envVar.environments) {
        addEnvVar(adminProjectId, envVar.key, envVar.value, env, ADMIN_DIR, teamSlug);
      }
    }
  }

  console.log('\n✅ Environment variables senkronizasyonu tamamlandı!');
  console.log('\n📋 Sonraki adımlar:');
  console.log('1. Vercel Dashboard\'da environment variables\'ları kontrol edin');
  console.log('2. Gerekirse redeploy yapın');
  console.log('3. Admin panel login sayfasını test edin\n');
}

main();
