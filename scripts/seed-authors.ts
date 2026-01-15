#!/usr/bin/env tsx

/**
 * Seed Authors System
 * 
 * 5-6 gerçekçi yazar profili oluşturur.
 * Avatar ve cover görselleri üretir (OpenAI) ve Cloudinary'ye yükler.
 * 
 * Yazar personası:
 * - 2 Emlak Danışmanı (Karasu, Kocaali)
 * - 1 Yatırım & Kira Getirisi Analisti
 * - 1 İçerik Editörü / Yerel Rehber
 * - 1 Sapanca Konut & Bungalov Uzmanı
 * - 1 Hukuk / Tapu / İmar Notları
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { v2 as cloudinary } from "cloudinary";
import OpenAI from "openai";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

if (!openaiApiKey) {
  console.error("❌ OPENAI_API_KEY gerekli!");
  process.exit(1);
}

if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
  console.error("❌ CLOUDINARY credentials gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
});

interface AuthorData {
  slug: string;
  full_name: string;
  title: string;
  bio: string;
  location: string;
  specialties: string[];
  social_json: {
    email?: string;
    linkedin?: string;
    instagram?: string;
    x?: string;
  };
  avatarPrompt: string;
  coverPrompt: string;
}

const AUTHORS: AuthorData[] = [
  {
    slug: "mehmet-yilmaz",
    full_name: "Mehmet Yılmaz",
    title: "Emlak Danışmanı",
    bio: "Karasu'da 12 yıldır emlak danışmanlığı yapıyorum. Denize yakın konutlar, yazlık yatırımları ve kira getirisi konularında tecrübeliyim. Karasu'nun farklı mahallelerindeki piyasa dinamiklerini yakından takip ediyorum. Alıcı ve satıcıları doğru eşleştirmek, hem yatırım hem oturumluk konut seçeneklerinde danışmanlık vermek işimin temelini oluşturuyor.",
    location: "Karasu / Sakarya",
    specialties: ["Karasu satılık daire", "Karasu yazlık", "Denize yakın konutlar", "Kira getirisi"],
    social_json: {
      email: "mehmet.yilmaz@karasuemlak.net",
      linkedin: "mehmet-yilmaz-karasu-emlak",
    },
    avatarPrompt: "Professional real estate consultant portrait, Turkish man in business casual, friendly smile, office background, natural lighting, photo-realistic, high quality, professional headshot",
    coverPrompt: "Karasu beach and coastal real estate, modern buildings near the sea, professional real estate office view, natural lighting, wide angle, photo-realistic",
  },
  {
    slug: "ayse-demir",
    full_name: "Ayşe Demir",
    title: "Emlak Danışmanı",
    bio: "Kocaali bölgesinde 8 yıldır emlak sektöründeyim. Özellikle aileler için oturumluk konutlar ve yatırım amaçlı daireler konusunda uzmanım. Bölgenin gelişen altyapısını ve piyasa trendlerini yakından takip ediyorum. Müşterilerime hem finansal hem de yaşam kalitesi açısından en uygun seçenekleri sunmaya çalışıyorum.",
    location: "Kocaali / Sakarya",
    specialties: ["Kocaali satılık ev", "Aile konutları", "Yatırım daireleri", "Bölge rehberi"],
    social_json: {
      email: "ayse.demir@karasuemlak.net",
      instagram: "ayse_demir_emlak",
    },
    avatarPrompt: "Professional female real estate consultant portrait, Turkish woman in business attire, confident expression, modern office background, natural lighting, photo-realistic, high quality, professional headshot",
    coverPrompt: "Kocaali residential area, modern apartment buildings, family-friendly neighborhood, professional real estate view, natural lighting, wide angle, photo-realistic",
  },
  {
    slug: "can-ozkan",
    full_name: "Can Özkan",
    title: "Yatırım & Kira Getirisi Analisti",
    bio: "Emlak yatırımları ve kira getirisi analizi konusunda 10 yıllık deneyimim var. Sakarya bölgesindeki fiyat trendlerini, yatırım potansiyelini ve kira piyasasını detaylı şekilde inceliyorum. Yatırımcılara hem kısa hem uzun vadeli getiri analizleri sunuyorum. Piyasa verilerini takip ederek, hangi bölgelerin ne zaman yatırım için uygun olduğunu değerlendiriyorum.",
    location: "Sakarya",
    specialties: ["Yatırım analizi", "Kira getirisi", "Fiyat trendleri", "Yatırım stratejileri"],
    social_json: {
      email: "can.ozkan@karasuemlak.net",
      linkedin: "can-ozkan-investment-analyst",
      x: "can_ozkan_analyst",
    },
    avatarPrompt: "Professional investment analyst portrait, Turkish man in business suit, analytical expression, modern office with charts in background, natural lighting, photo-realistic, high quality, professional headshot",
    coverPrompt: "Investment analysis workspace, charts and graphs on screen, real estate market data visualization, professional office environment, natural lighting, wide angle, photo-realistic",
  },
  {
    slug: "zeynep-kaya",
    full_name: "Zeynep Kaya",
    title: "İçerik Editörü / Yerel Rehber",
    bio: "Sakarya bölgesinin yerel rehberi ve içerik editörüyüm. Karasu, Kocaali ve Sapanca'nın gezilecek yerlerini, yaşam kalitesini, mahalleleri ve bölge özelliklerini detaylı şekilde araştırıp yazıyorum. Okuyuculara hem emlak hem de yaşam rehberi niteliğinde içerikler sunuyorum. Bölgenin sosyal, kültürel ve ekonomik dinamiklerini yakından takip ediyorum.",
    location: "Sakarya",
    specialties: ["Yerel rehber", "Bölge analizi", "Yaşam kalitesi", "Mahalle rehberleri"],
    social_json: {
      email: "zeynep.kaya@karasuemlak.net",
      instagram: "zeynep_kaya_rehber",
    },
    avatarPrompt: "Professional content editor portrait, Turkish woman in casual business attire, friendly expression, modern workspace with books and laptop, natural lighting, photo-realistic, high quality, professional headshot",
    coverPrompt: "Sakarya region landscape, Karasu and Kocaali coastal areas, local landmarks and neighborhoods, editorial workspace, natural lighting, wide angle, photo-realistic",
  },
  {
    slug: "burak-sahin",
    full_name: "Burak Şahin",
    title: "Sapanca Konut & Bungalov Uzmanı",
    bio: "Sapanca Gölü çevresinde bungalov ve konut konusunda 7 yıldır uzmanım. Göl kenarı bungalovlar, günlük kiralık seçenekleri ve yatırım potansiyeli konularında detaylı bilgi sahibiyim. Sapanca'nın doğal güzelliklerini ve emlak fırsatlarını yakından takip ediyorum. Hem tatil hem yatırım amaçlı bungalov seçeneklerinde danışmanlık veriyorum.",
    location: "Sapanca / Sakarya",
    specialties: ["Sapanca bungalov", "Günlük kiralık", "Göl kenarı konutlar", "Sapanca yatırım"],
    social_json: {
      email: "burak.sahin@karasuemlak.net",
      instagram: "burak_sahin_sapanca",
    },
    avatarPrompt: "Professional real estate specialist portrait, Turkish man in casual business attire, friendly smile, lake and nature background, natural lighting, photo-realistic, high quality, professional headshot",
    coverPrompt: "Sapanca Lake and bungalows, wooden cabins near the lake, natural landscape, real estate properties, natural lighting, wide angle, photo-realistic",
  },
  {
    slug: "elif-arslan",
    full_name: "Elif Arslan",
    title: "Hukuk / Tapu / İmar Notları",
    bio: "Emlak hukuku, tapu işlemleri ve imar durumu konularında genel bilgilendirme içerikleri hazırlıyorum. Yasal süreçler, dikkat edilmesi gerekenler ve pratik öneriler sunuyorum. Önemli not: Bu içerikler yatırım tavsiyesi değildir ve profesyonel hukuki danışmanlık yerine geçmez. Okuyuculara emlak alım-satım süreçlerinde bilinçli hareket etmeleri için rehberlik ediyorum.",
    location: "Sakarya",
    specialties: ["Tapu işlemleri", "İmar durumu", "Yasal süreçler", "Emlak hukuku"],
    social_json: {
      email: "elif.arslan@karasuemlak.net",
      linkedin: "elif-arslan-legal-notes",
    },
    avatarPrompt: "Professional legal advisor portrait, Turkish woman in business attire, serious but approachable expression, law books in background, natural lighting, photo-realistic, high quality, professional headshot",
    coverPrompt: "Legal documents and real estate papers on desk, professional legal office environment, books and certificates on wall, natural lighting, wide angle, photo-realistic",
  },
];

async function generateImage(prompt: string, folder: string, filename: string): Promise<string | null> {
  try {
    console.log(`   🎨 Görsel üretiliyor: ${filename}...`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("Görsel URL alınamadı");
    }

    // Download image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `karasuemlak/authors/${folder}`,
          public_id: filename,
          transformation: [
            { width: 800, height: 800, crop: "fill", quality: "auto", format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(Buffer.from(imageBuffer));
    });

    // Save to media_assets (use existing columns - backward compatible)
    const mediaPayload: any = {
      cloudinary_public_id: uploadResult.public_id,
      cloudinary_url: uploadResult.secure_url,
      cloudinary_secure_url: uploadResult.secure_url,
      asset_type: "image",
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      alt_text: `${filename} - ${folder}`,
    };

    const { data: mediaData, error: mediaError } = await supabase
      .from("media_assets")
      .insert(mediaPayload)
      .select("id")
      .single();

    if (mediaError) {
      throw mediaError;
    }

    return mediaData.id;
  } catch (error: any) {
    console.error(`   ❌ Görsel üretim hatası: ${error.message}`);
    return null;
  }
}

async function seedAuthors() {
  console.log("🚀 Yazar profilleri oluşturuluyor...\n");

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const authorData of AUTHORS) {
    try {
      // Check if author exists
      const { data: existing } = await supabase
        .from("authors")
        .select("id, avatar_media_id, cover_media_id")
        .eq("slug", authorData.slug)
        .maybeSingle();

      let avatarMediaId = existing?.avatar_media_id;
      let coverMediaId = existing?.cover_media_id;

      // Generate images if not exists
      if (!avatarMediaId) {
        avatarMediaId = await generateImage(
          authorData.avatarPrompt,
          authorData.slug,
          "avatar"
        );
        // Small delay between image generations
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (!coverMediaId) {
        coverMediaId = await generateImage(
          authorData.coverPrompt,
          authorData.slug,
          "cover"
        );
        // Small delay between image generations
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const authorPayload: any = {
        slug: authorData.slug,
        full_name: authorData.full_name,
        title: authorData.title,
        bio: authorData.bio,
        location: authorData.location,
        specialties: authorData.specialties,
        social_json: authorData.social_json,
        is_active: true,
        languages: ["tr"],
      };

      if (avatarMediaId) {
        authorPayload.avatar_media_id = avatarMediaId;
      }
      if (coverMediaId) {
        authorPayload.cover_media_id = coverMediaId;
      }

      if (existing) {
        // Update existing author
        const { error: updateError } = await supabase
          .from("authors")
          .update(authorPayload)
          .eq("id", existing.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`🔄 Güncellendi: ${authorData.full_name} (${authorData.title})`);
        updated++;
      } else {
        // Create new author
        const { data, error } = await supabase
          .from("authors")
          .insert(authorPayload)
          .select("id")
          .single();

        if (error) {
          throw error;
        }

        console.log(`✅ Oluşturuldu: ${authorData.full_name} (${authorData.title})`);
        console.log(`   📍 Slug: /yazarlar/${authorData.slug}`);
        created++;
      }

      // Small delay between authors
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error(`❌ Hata (${authorData.full_name}):`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Özet:`);
  console.log(`   ✅ Oluşturulan: ${created}`);
  console.log(`   🔄 Güncellenen: ${updated}`);
  console.log(`   ❌ Hata: ${errors}`);
  console.log(`   📁 Toplam: ${AUTHORS.length}\n`);

  if (created > 0 || updated > 0) {
    console.log("✨ Yazar profilleri başarıyla işlendi!\n");
  }
}

// Run
seedAuthors()
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
