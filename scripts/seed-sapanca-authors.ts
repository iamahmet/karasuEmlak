#!/usr/bin/env tsx
/**
 * Seed Sapanca Authors
 * 
 * Creates 5-6 realistic author profiles for Sapanca content
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AuthorData {
  slug: string;
  full_name: string;
  title: string;
  bio: string;
  location: string;
  specialties: string[];
  languages: string[];
  social_json: {
    email?: string;
    linkedin?: string;
  };
}

const AUTHORS: AuthorData[] = [
  {
    slug: "mehmet-yilmaz",
    full_name: "Mehmet Yılmaz",
    title: "Emlak Danışmanı & Yatırım Uzmanı",
    bio: "15 yıllık deneyimiyle Sapanca ve çevresinde emlak danışmanlığı yapıyor. Özellikle yazlık ev ve villa yatırımları konusunda uzman.",
    location: "Sapanca, Sakarya",
    specialties: ["Yazlık Ev", "Villa", "Yatırım Analizi"],
    languages: ["tr"],
    social_json: {},
  },
  {
    slug: "ayse-demir",
    full_name: "Ayşe Demir",
    title: "Bölge Uzmanı & Rehber",
    bio: "Sapanca Gölü çevresi ve bungalov konaklama seçenekleri hakkında detaylı bilgi sahibi. Yerel yaşam ve turizm konularında uzman.",
    location: "Sapanca, Sakarya",
    specialties: ["Bungalov", "Göl Çevresi", "Turizm"],
    languages: ["tr"],
    social_json: {},
  },
  {
    slug: "ali-kaya",
    full_name: "Ali Kaya",
    title: "Emlak Analisti",
    bio: "Sapanca emlak piyasası trendlerini analiz ediyor. Fiyat hareketleri ve yatırım fırsatları konusunda deneyimli.",
    location: "Sapanca, Sakarya",
    specialties: ["Piyasa Analizi", "Fiyat Trendleri", "Yatırım"],
    languages: ["tr"],
    social_json: {},
  },
  {
    slug: "fatma-ozturk",
    full_name: "Fatma Öztürk",
    title: "Emlak Hukuku Uzmanı",
    bio: "Sapanca'da emlak alım-satım süreçlerinde yasal danışmanlık yapıyor. Tapu, noter işlemleri ve yasal süreçler konusunda uzman.",
    location: "Sapanca, Sakarya",
    specialties: ["Yasal Süreçler", "Tapu İşlemleri", "Noter"],
    languages: ["tr"],
    social_json: {},
  },
  {
    slug: "mustafa-sahin",
    full_name: "Mustafa Şahin",
    title: "Kiralama Uzmanı",
    bio: "Sapanca'da günlük ve aylık kiralama seçenekleri konusunda uzman. Tatil konaklama ve yazlık kiralama danışmanlığı yapıyor.",
    location: "Sapanca, Sakarya",
    specialties: ["Günlük Kiralık", "Tatil Konaklama", "Yazlık Kiralama"],
    languages: ["tr"],
    social_json: {},
  },
  {
    slug: "zeynep-arslan",
    full_name: "Zeynep Arslan",
    title: "Bölge Rehberi",
    bio: "Sapanca'da yaşam, sosyal hayat ve bölge özellikleri hakkında kapsamlı bilgi sahibi. Emlak alırken bölgeyi tanıma konusunda uzman.",
    location: "Sapanca, Sakarya",
    specialties: ["Yaşam Rehberi", "Bölge Tanıtımı", "Sosyal Hayat"],
    languages: ["tr"],
    social_json: {},
  },
];

async function seedAuthors() {
  console.log("🌱 Sapanca Yazarları Oluşturuluyor...\n");

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const author of AUTHORS) {
    try {
      // Check if exists
      const { data: existing } = await supabase
        .from("authors")
        .select("id")
        .eq("slug", author.slug)
        .maybeSingle();

      if (existing) {
        // Update
        const { error } = await supabase
          .from("authors")
          .update({
            ...author,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
        updated++;
        console.log(`   ✅ Güncellendi: ${author.full_name}`);
      } else {
        // Create
        const { error } = await supabase
          .from("authors")
          .insert({
            ...author,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        created++;
        console.log(`   ✅ Oluşturuldu: ${author.full_name}`);
      }
    } catch (error: any) {
      errors++;
      console.error(`   ❌ Hata (${author.full_name}):`, error.message);
    }
  }

  console.log(`\n📊 Özet: ${created} oluşturuldu, ${updated} güncellendi, ${errors} hata\n`);
}

seedAuthors()
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
