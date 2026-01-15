#!/usr/bin/env tsx

/**
 * Seed Authors - Direct SQL (bypasses PostgREST cache issues)
 * 
 * Uses direct SQL INSERT instead of Supabase client
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const AUTHORS = [
  {
    slug: "mehmet-yilmaz",
    full_name: "Mehmet Yılmaz",
    title: "Emlak Danışmanı",
    bio: "Karasu'da 12 yıldır emlak danışmanlığı yapıyorum. Denize yakın konutlar, yazlık yatırımları ve kira getirisi konularında tecrübeliyim. Karasu'nun farklı mahallelerindeki piyasa dinamiklerini yakından takip ediyorum. Alıcı ve satıcıları doğru eşleştirmek, hem yatırım hem oturumluk konut seçeneklerinde danışmanlık vermek işimin temelini oluşturuyor.",
    location: "Karasu / Sakarya",
    specialties: ["Karasu satılık daire", "Karasu yazlık", "Denize yakın konutlar", "Kira getirisi"],
    social_json: { email: "mehmet.yilmaz@karasuemlak.net", linkedin: "mehmet-yilmaz-karasu-emlak" },
  },
  {
    slug: "ayse-demir",
    full_name: "Ayşe Demir",
    title: "Emlak Danışmanı",
    bio: "Kocaali bölgesinde 8 yıldır emlak sektöründeyim. Özellikle aileler için oturumluk konutlar ve yatırım amaçlı daireler konusunda uzmanım. Bölgenin gelişen altyapısını ve piyasa trendlerini yakından takip ediyorum. Müşterilerime hem finansal hem de yaşam kalitesi açısından en uygun seçenekleri sunmaya çalışıyorum.",
    location: "Kocaali / Sakarya",
    specialties: ["Kocaali satılık ev", "Aile konutları", "Yatırım daireleri", "Bölge rehberi"],
    social_json: { email: "ayse.demir@karasuemlak.net", instagram: "ayse_demir_emlak" },
  },
  {
    slug: "can-ozkan",
    full_name: "Can Özkan",
    title: "Yatırım & Kira Getirisi Analisti",
    bio: "Emlak yatırımları ve kira getirisi analizi konusunda 10 yıllık deneyimim var. Sakarya bölgesindeki fiyat trendlerini, yatırım potansiyelini ve kira piyasasını detaylı şekilde inceliyorum. Yatırımcılara hem kısa hem uzun vadeli getiri analizleri sunuyorum. Piyasa verilerini takip ederek, hangi bölgelerin ne zaman yatırım için uygun olduğunu değerlendiriyorum.",
    location: "Sakarya",
    specialties: ["Yatırım analizi", "Kira getirisi", "Fiyat trendleri", "Yatırım stratejileri"],
    social_json: { email: "can.ozkan@karasuemlak.net", linkedin: "can-ozkan-investment-analyst", x: "can_ozkan_analyst" },
  },
  {
    slug: "zeynep-kaya",
    full_name: "Zeynep Kaya",
    title: "İçerik Editörü / Yerel Rehber",
    bio: "Sakarya bölgesinin yerel rehberi ve içerik editörüyüm. Karasu, Kocaali ve Sapanca'nın gezilecek yerlerini, yaşam kalitesini, mahalleleri ve bölge özelliklerini detaylı şekilde araştırıp yazıyorum. Okuyuculara hem emlak hem de yaşam rehberi niteliğinde içerikler sunuyorum. Bölgenin sosyal, kültürel ve ekonomik dinamiklerini yakından takip ediyorum.",
    location: "Sakarya",
    specialties: ["Yerel rehber", "Bölge analizi", "Yaşam kalitesi", "Mahalle rehberleri"],
    social_json: { email: "zeynep.kaya@karasuemlak.net", instagram: "zeynep_kaya_rehber" },
  },
  {
    slug: "burak-sahin",
    full_name: "Burak Şahin",
    title: "Sapanca Konut & Bungalov Uzmanı",
    bio: "Sapanca Gölü çevresinde bungalov ve konut konusunda 7 yıldır uzmanım. Göl kenarı bungalovlar, günlük kiralık seçenekleri ve yatırım potansiyeli konularında detaylı bilgi sahibiyim. Sapanca'nın doğal güzelliklerini ve emlak fırsatlarını yakından takip ediyorum. Hem tatil hem yatırım amaçlı bungalov seçeneklerinde danışmanlık veriyorum.",
    location: "Sapanca / Sakarya",
    specialties: ["Sapanca bungalov", "Günlük kiralık", "Göl kenarı konutlar", "Sapanca yatırım"],
    social_json: { email: "burak.sahin@karasuemlak.net", instagram: "burak_sahin_sapanca" },
  },
  {
    slug: "elif-arslan",
    full_name: "Elif Arslan",
    title: "Hukuk / Tapu / İmar Notları",
    bio: "Emlak hukuku, tapu işlemleri ve imar durumu konularında genel bilgilendirme içerikleri hazırlıyorum. Yasal süreçler, dikkat edilmesi gerekenler ve pratik öneriler sunuyorum. Önemli not: Bu içerikler yatırım tavsiyesi değildir ve profesyonel hukuki danışmanlık yerine geçmez. Okuyuculara emlak alım-satım süreçlerinde bilinçli hareket etmeleri için rehberlik ediyorum.",
    location: "Sakarya",
    specialties: ["Tapu işlemleri", "İmar durumu", "Yasal süreçler", "Emlak hukuku"],
    social_json: { email: "elif.arslan@karasuemlak.net", linkedin: "elif-arslan-legal-notes" },
  },
];

async function seedAuthorsDirectSQL() {
  console.log("🚀 Yazar profilleri oluşturuluyor (Direct SQL)...\n");

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const authorData of AUTHORS) {
    try {
      // Check if exists using direct SQL
      const { data: existing, error: checkError } = await supabase.rpc('exec_sql', {
        query: `SELECT id FROM public.authors WHERE slug = '${authorData.slug}' LIMIT 1;`
      });

      // Use INSERT ... ON CONFLICT instead
      const insertSQL = `
        INSERT INTO public.authors (slug, full_name, title, bio, location, specialties, languages, social_json, is_active)
        VALUES (
          '${authorData.slug}',
          '${authorData.full_name.replace(/'/g, "''")}',
          '${authorData.title.replace(/'/g, "''")}',
          '${authorData.bio.replace(/'/g, "''")}',
          '${authorData.location.replace(/'/g, "''")}',
          ARRAY[${authorData.specialties.map(s => `'${s.replace(/'/g, "''")}'`).join(', ')}]::text[],
          ARRAY['tr']::text[],
          '${JSON.stringify(authorData.social_json).replace(/'/g, "''")}'::jsonb,
          true
        )
        ON CONFLICT (slug) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          title = EXCLUDED.title,
          bio = EXCLUDED.bio,
          location = EXCLUDED.location,
          specialties = EXCLUDED.specialties,
          social_json = EXCLUDED.social_json,
          updated_at = now()
        RETURNING id;
      `;

      const { data, error } = await supabase.rpc('exec_sql', { query: insertSQL });

      if (error) {
        // Fallback: use Supabase client with service role
        const { data: insertData, error: insertError } = await supabase
          .from("authors")
          .upsert({
            slug: authorData.slug,
            full_name: authorData.full_name,
            title: authorData.title,
            bio: authorData.bio,
            location: authorData.location,
            specialties: authorData.specialties,
            languages: ["tr"],
            social_json: authorData.social_json,
            is_active: true,
          }, { onConflict: 'slug' })
          .select("id")
          .single();

        if (insertError) {
          throw insertError;
        }

        if (insertData) {
          console.log(`✅ Oluşturuldu/Güncellendi: ${authorData.full_name} (${authorData.title})`);
          created++;
        }
      } else {
        console.log(`✅ Oluşturuldu/Güncellendi: ${authorData.full_name} (${authorData.title})`);
        created++;
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      console.error(`❌ Hata (${authorData.full_name}):`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Özet:`);
  console.log(`   ✅ Oluşturulan/Güncellenen: ${created}`);
  console.log(`   ❌ Hata: ${errors}`);
  console.log(`   📁 Toplam: ${AUTHORS.length}\n`);

  if (created > 0) {
    console.log("✨ Yazar profilleri başarıyla işlendi!\n");
  }
}

seedAuthorsDirectSQL()
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
