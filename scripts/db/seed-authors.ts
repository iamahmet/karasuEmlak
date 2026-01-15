#!/usr/bin/env tsx

/**
 * Seed Authors
 * 
 * Adds 6 sample authors to the authors table
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), 'apps/web/.env.local') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const AUTHORS = [
  {
    slug: 'mehmet-yilmaz',
    full_name: 'Mehmet Yılmaz',
    title: 'Emlak Danışmanı',
    bio: 'Karasu\'da 12 yıldır emlak danışmanlığı yapıyorum. Denize yakın konutlar, yazlık yatırımları ve kira getirisi konularında tecrübeliyim.',
    location: 'Karasu / Sakarya',
    specialties: ['Karasu satılık daire', 'Karasu yazlık', 'Denize yakın konutlar', 'Kira getirisi'],
    is_active: true,
  },
  {
    slug: 'ayse-demir',
    full_name: 'Ayşe Demir',
    title: 'Emlak Danışmanı',
    bio: 'Kocaali bölgesinde 8 yıldır emlak sektöründeyim. Özellikle aileler için oturumluk konutlar ve yatırım amaçlı daireler konusunda uzmanım.',
    location: 'Kocaali / Sakarya',
    specialties: ['Kocaali satılık ev', 'Aile konutları', 'Yatırım daireleri', 'Bölge rehberi'],
    is_active: true,
  },
  {
    slug: 'can-ozkan',
    full_name: 'Can Özkan',
    title: 'Yatırım & Kira Getirisi Analisti',
    bio: 'Emlak yatırımları ve kira getirisi analizi konusunda 10 yıllık deneyimim var. Sakarya bölgesindeki fiyat trendlerini detaylı şekilde inceliyorum.',
    location: 'Sakarya',
    specialties: ['Yatırım analizi', 'Kira getirisi', 'Fiyat trendleri', 'Yatırım stratejileri'],
    is_active: true,
  },
  {
    slug: 'zeynep-kaya',
    full_name: 'Zeynep Kaya',
    title: 'İçerik Editörü / Yerel Rehber',
    bio: 'Sakarya bölgesinin yerel rehberi ve içerik editörüyüm. Karasu, Kocaali ve Sapanca\'nın gezilecek yerlerini, yaşam kalitesini detaylı şekilde araştırıp yazıyorum.',
    location: 'Sakarya',
    specialties: ['Yerel rehber', 'Bölge analizi', 'Yaşam kalitesi', 'Mahalle rehberleri'],
    is_active: true,
  },
  {
    slug: 'burak-sahin',
    full_name: 'Burak Şahin',
    title: 'Sapanca Konut & Bungalov Uzmanı',
    bio: 'Sapanca Gölü çevresinde bungalov ve konut konusunda 7 yıldır uzmanım. Göl kenarı bungalovlar, günlük kiralık seçenekleri ve yatırım potansiyeli konularında bilgi sahibiyim.',
    location: 'Sapanca / Sakarya',
    specialties: ['Sapanca bungalov', 'Günlük kiralık', 'Göl kenarı konutlar', 'Sapanca yatırım'],
    is_active: true,
  },
  {
    slug: 'elif-arslan',
    full_name: 'Elif Arslan',
    title: 'Hukuk / Tapu / İmar Notları',
    bio: 'Emlak hukuku, tapu işlemleri ve imar durumu konularında genel bilgilendirme içerikleri hazırlıyorum. Yasal süreçler, dikkat edilmesi gerekenler ve pratik öneriler sunuyorum.',
    location: 'Sakarya',
    specialties: ['Tapu işlemleri', 'İmar durumu', 'Yasal süreçler', 'Emlak hukuku'],
    is_active: true,
  },
];

async function seedAuthors() {
  console.log('🌱 Seeding authors...\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const author of AUTHORS) {
    try {
      // Check if exists
      const { data: existing } = await supabase
        .from('authors')
        .select('id')
        .eq('slug', author.slug)
        .single();

      if (existing) {
        console.log(`⏭️  Skipped: ${author.slug} (already exists)`);
        skipped++;
        continue;
      }

      // Insert
      const { error } = await supabase
        .from('authors')
        .insert(author);

      if (error) {
        console.error(`❌ Error inserting ${author.slug}:`, error.message);
        errors++;
      } else {
        console.log(`✅ Created: ${author.slug} - ${author.full_name}`);
        created++;
      }
    } catch (error: any) {
      console.error(`❌ Fatal error for ${author.slug}:`, error?.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Created: ${created}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('='.repeat(50) + '\n');

  // Verify count
  const { count } = await supabase
    .from('authors')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  console.log(`📊 Total active authors: ${count || 0}\n`);

  return { created, skipped, errors };
}

seedAuthors()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
