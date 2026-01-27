#!/usr/bin/env npx tsx
/**
 * Önemli sayfaların HTTP 200 dönüp dönmediğini kontrol eder.
 * Kullanım: npx tsx scripts/check-404-routes.ts [BASE_URL]
 * Örnek:   npx tsx scripts/check-404-routes.ts
 *          npx tsx scripts/check-404-routes.ts https://www.karasuemlak.net
 */

const BASE = process.argv[2] || 'http://localhost:3000';

const ROUTES: string[] = [
  '/',
  '/satilik',
  '/kiralik',
  '/sapanca',
  '/karasu',
  '/kocaali',
  '/blog',
  '/haberler',
  '/iletisim',
  '/ilan-ekle',
  '/rehberler',
  '/sss',
  '/hakkimizda',
  '/gizlilik-politikasi',
  '/rehber',
  '/hizmetler',
  '/arama',
  '/favorilerim',
  '/yazarlar',
  '/mahalle/merkez',
  '/karasu/merkez',
  '/sapanca/bungalov',
  '/sapanca/gezilecek-yerler',
  '/satilik/daire',
  '/kiralik/daire',
  '/tip/daire',
  '/tip/villa',
  '/karasu-2-1-satilik-daire',
  '/karasu-1-1-satilik-daire',
  '/istatistikler/fiyat-trendleri',
  '/yatirim/roi-hesaplayici',
  '/en/satilik',  // artık /satilik'e yönlenmeli (307)
];

async function main() {
  console.log(`\n🔍 404 Kontrolü: ${BASE}\n`);
  const ok: string[] = [];
  const fail: { path: string; status: number }[] = [];
  const redirects: { path: string; status: number; location?: string }[] = [];

  for (const path of ROUTES) {
    try {
      const res = await fetch(BASE + path, { redirect: 'manual' });
      const status = res.status;
      if (status === 200) ok.push(path);
      else if (status >= 300 && status < 400) redirects.push({ path, status, location: res.headers.get('location') || undefined });
      else fail.push({ path, status });
    } catch (e: any) {
      fail.push({ path, status: 0 });
    }
  }

  console.log(`✅ 200: ${ok.length}`);
  ok.forEach((p) => console.log(`   ${p}`));

  if (redirects.length) {
    console.log(`\n↪️ Yönlendirme: ${redirects.length}`);
    redirects.forEach(({ path, status, location }) => console.log(`   ${status} ${path} → ${location || '?'}`));
  }

  if (fail.length) {
    console.log(`\n❌ Hata/404: ${fail.length}`);
    fail.forEach(({ path, status }) => console.log(`   ${status || 'ERR'} ${path}`));
    process.exit(1);
  }

  console.log(`\n✅ Tüm sayfalar erişilebilir.\n`);
}

main();
