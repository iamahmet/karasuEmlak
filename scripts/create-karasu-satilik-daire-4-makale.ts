/**
 * 4 Yeni Makale: Karasu Satılık Daire + Semantik Anahtar Kelimeler
 * - Her makale 500+ kelime
 * - 3 makalede "Karasu Satılık Daire" → /karasu-satilik-daire internal link (içerikte inline)
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: resolve(process.cwd(), 'apps/admin/.env.local') });
dotenv.config({ path: resolve(process.cwd(), 'apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY in .env.local');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const INTERNAL_LINK_TARGET = '/karasu-satilik-daire';
const INTERNAL_LINK_ANCHOR = 'Karasu Satılık Daire';

const ARTICLES = [
  {
    title: 'Karasu\'da Satılık Daire Seçerken Dikkat Edilmesi Gereken 10 Nokta',
    topic: 'Karasu satılık daire seçerken dikkat edilecekler',
    targetKeywords: ['karasu satılık daire', 'karasu daire seçimi', 'karasu emlak alım ipuçları'],
    hasInternalLink: true,
  },
  {
    title: 'Karasu Sahil Bölgesinde Satılık Daire Fiyatları 2025',
    topic: 'Karasu sahil satılık daire fiyatları 2025',
    targetKeywords: ['karasu satılık daire fiyatları', 'karasu sahil daire', 'karasu denize sıfır daire'],
    hasInternalLink: true,
  },
  {
    title: 'Karasu\'da İlk Ev Alacaklar İçin Satılık Daire Rehberi',
    topic: 'Karasu ilk ev alım satılık daire rehberi',
    targetKeywords: ['karasu satılık daire', 'ilk ev alım karasu', 'karasu daire rehberi'],
    hasInternalLink: true,
  },
  {
    title: 'Karasu Emlak Piyasası: Daire ve Villa Talepleri Artıyor',
    topic: 'Karasu emlak piyasası daire villa talep trendleri',
    targetKeywords: ['karasu emlak piyasası', 'karasu daire talepleri', 'karasu villa fiyatları'],
    hasInternalLink: false, // 4. makalede link YOK (3 makalede var)
  },
];

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9ğüşıöç]+/g, '-')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/(^-+|-+$)/g, '');
}

function injectInternalLink(content: string, anchor: string, href: string): string {
  const linkHtml = `<a href="${href}" class="text-primary font-medium hover:underline">${anchor}</a>`;
  const variants = [anchor, anchor.replace(/ı/g, 'i'), anchor.replace(/i/g, 'ı')];
  for (const v of variants) {
    const idx = content.indexOf(v);
    if (idx !== -1) {
      return content.slice(0, idx) + linkHtml + content.slice(idx + v.length);
    }
  }
  return content;
}

async function generateArticle(article: typeof ARTICLES[0]): Promise<void> {
  console.log(`\n📝 Oluşturuluyor: "${article.title}" (internal link: ${article.hasInternalLink})`);

  const { data: existing } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', createSlug(article.title))
    .maybeSingle();

  if (existing) {
    console.log(`   ⏭️ Zaten mevcut, atlanıyor.`);
    return;
  }

  const prompt = `Aşağıdaki konuda minimum 500 kelimelik SEO uyumlu bir makale yaz. Türkçe, profesyonel ve bilgilendirici ol.

Başlık: ${article.title}
Konu: ${article.topic}
Hedef Anahtar Kelimeler: ${article.targetKeywords.join(', ')}

Gereksinimler:
1. Minimum 500 kelime (tercihen 600-800)
2. H2, H3 başlıkları kullan
3. Karasu'ya özel yerel bilgiler
4. "Karasu Satılık Daire" ifadesini doğal şekilde en az 1-2 kez kullan
5. HTML formatında döndür: <p>, <h2>, <h3>, <ul>, <li> etiketleri

JSON formatında döndür:
{
  "title": "makale başlığı",
  "excerpt": "150-200 karakter özet",
  "content": "HTML içerik (p, h2, h3, ul, li)",
  "meta_description": "150-160 karakter SEO açıklaması",
  "keywords": ["anahtar", "kelime", "listesi"]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Sen Karasu\'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. Türkçe, SEO uyumlu içerik üretiyorsun.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  const data = JSON.parse(raw);

  if (!data.title || !data.content) {
    throw new Error('Geçersiz OpenAI yanıtı');
  }

  let content = data.content;
  if (article.hasInternalLink) {
    content = injectInternalLink(content, INTERNAL_LINK_ANCHOR, INTERNAL_LINK_TARGET);
  }

  const slug = createSlug(data.title);
  const keywords = Array.isArray(data.keywords) ? data.keywords : article.targetKeywords;

  const { error } = await supabase.from('articles').insert({
    title: data.title,
    slug,
    content,
    excerpt: data.excerpt || data.meta_description?.substring(0, 200) || '',
    meta_description: data.meta_description,
    keywords: keywords.length > 0 ? keywords : null,
    author: 'Karasu Emlak',
    status: 'published',
    published_at: new Date().toISOString(),
    category: 'Blog',
    views: 0,
    internal_links: [
      { text: INTERNAL_LINK_ANCHOR, url: INTERNAL_LINK_TARGET },
    ],
  });

  if (error) throw error;
  console.log(`   ✅ Oluşturuldu: ${slug}`);
}

async function main() {
  console.log('🚀 Karasu Satılık Daire - 4 Yeni Makale Oluşturuluyor');
  console.log('   - 3 makalede "Karasu Satılık Daire" → /karasu-satilik-daire internal link');
  console.log('='.repeat(60));

  for (const article of ARTICLES) {
    await generateArticle(article);
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log('\n✅ Tamamlandı!');
}

main().catch(console.error);
