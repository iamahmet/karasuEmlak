/**
 * Create Listings from Images API
 * 
 * Bu API medya kütüphanesindeki görselleri klasör yapısına göre tarar
 * ve her klasör için otomatik olarak SEO uyumlu ilanlar oluşturur.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";
import OpenAI from "openai";

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.error("OPENAI_API_KEY is not configured");
}

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

interface ImageInfo {
  path: string;
  name: string;
  url: string;
  folder: string;
}

interface ListingData {
  title: string;
  slug: string;
  description_short: string;
  description_long: string;
  status: "satilik" | "kiralik";
  property_type: string;
  location_neighborhood: string;
  location_city: string;
  location_district: string;
  price_amount: number;
  price_currency: string;
  features?: {
    room_count?: number;
    area_sqm?: number;
    floor?: number;
    building_age?: number;
    [key: string]: any;
  };
  images: string[];
}

/**
 * Recursively list all files in storage
 */
async function listAllFiles(
  supabase: any,
  path: string = "",
  allFiles: ImageInfo[] = [],
  bucket: string = "media"
): Promise<ImageInfo[]> {
  try {
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: 1000,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.warn(`⚠️  Error listing ${path}:`, error.message);
      return allFiles;
    }

    if (!files || files.length === 0) {
      return allFiles;
    }

    for (const file of files) {
      if (file.id === null && file.name) {
        // It's a folder, recurse into it
        const folderPath = path ? `${path}/${file.name}` : file.name;
        await listAllFiles(supabase, folderPath, allFiles, bucket);
      } else if (file.id) {
        // It's a file
        const fullPath = path ? `${path}/${file.name}` : file.name;
        
        // Only process image files
        if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)) {
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fullPath);
          
          const folderPath = path || "";
          
          allFiles.push({
            path: fullPath,
            name: file.name,
            url: urlData.publicUrl,
            folder: folderPath,
          });
        }
      }
    }
  } catch (error: any) {
    console.warn(`⚠️  Error in listAllFiles for ${path}:`, error.message);
  }

  return allFiles;
}

/**
 * Generate slug from title
 */
function generateSlug(title: string, maxLength: number = 100): string {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/Ş/g, "s")
    .replace(/İ/g, "i")
    .replace(/Ö/g, "o")
    .replace(/Ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length > maxLength) {
    const truncated = slug.substring(0, maxLength);
    const lastHyphen = truncated.lastIndexOf("-");
    if (lastHyphen > maxLength * 0.5) {
      slug = truncated.substring(0, lastHyphen);
    } else {
      slug = truncated.replace(/-+$/, "");
    }
  }

  return slug.replace(/^-+|-+$/g, "");
}

/**
 * Extract basic info from folder name
 */
function extractBasicInfoFromFolder(folderName: string): {
  price?: number;
  roomCount?: number;
  areaSqm?: number;
  neighborhood?: string;
  isKiralik: boolean;
} {
  const folderLower = folderName.toLowerCase();
  const isKiralik = folderLower.includes("kiralik") || folderLower.includes("kiralık");
  
  const priceMatches = folderName.match(/\d{6,}/g);
  const price = priceMatches && priceMatches.length > 0 
    ? parseInt(priceMatches[priceMatches.length - 1])
    : undefined;
  
  const roomMatch = folderName.match(/(\d)\+(\d)/) || folderName.match(/(\d)(\d)/);
  const roomCount = roomMatch ? parseInt(roomMatch[1]) : undefined;
  
  const areaMatch = folderName.match(/(\d+)\s*m2/i) || folderName.match(/(\d+)\s*metrekare/i);
  const areaSqm = areaMatch ? parseInt(areaMatch[1]) : undefined;
  
  const parts = folderName.split("/");
  const firstPart = parts[0] || folderName.split("-")[0];
  const neighborhood = firstPart.replace(/-mahallesi/gi, "").replace(/-mahalle/gi, "");
  
  return {
    price,
    roomCount,
    areaSqm,
    neighborhood: neighborhood || undefined,
    isKiralik,
  };
}

/**
 * Extract listing information using AI
 */
async function extractListingInfo(
  folderName: string,
  imageNames: string[],
  imageUrls: string[]
): Promise<Partial<ListingData>> {
  const basicInfo = extractBasicInfoFromFolder(folderName);
  
  if (!openai) {
    // Fallback without AI
    const price = basicInfo.price || (basicInfo.isKiralik ? 5000 : 1000000);
    const neighborhood = basicInfo.neighborhood || folderName.split("/")[0]?.split("-")[0] || "Merkez";
    
    return {
      title: folderName,
      description_short: `${neighborhood} Mahallesi'nde ${basicInfo.isKiralik ? "kiralık" : "satılık"} emlak fırsatı - ${price.toLocaleString("tr-TR")} TL`,
      description_long: `<p>${neighborhood} Mahallesi'nde ${basicInfo.isKiralik ? "kiralık" : "satılık"} emlak fırsatı. Fiyat: ${price.toLocaleString("tr-TR")} TL. Detaylı bilgi için iletişime geçin.</p>`,
      status: basicInfo.isKiralik ? "kiralik" : "satilik",
      property_type: "daire",
      location_neighborhood: neighborhood,
      location_city: "Karasu",
      location_district: "Karasu",
      price_amount: price,
      price_currency: "TRY",
      features: (basicInfo.roomCount || basicInfo.areaSqm) ? { 
        ...(basicInfo.roomCount && { room_count: basicInfo.roomCount }),
        ...(basicInfo.areaSqm && { area_sqm: basicInfo.areaSqm })
      } : undefined,
      images: imageUrls,
    };
  }

  try {
    const context = `
Klasör İsmi: ${folderName}
Görsel İsimleri: ${imageNames.join(", ")}
Çıkarılan Bilgiler:
${basicInfo.price ? `- Fiyat: ${basicInfo.price} TL` : ''}
${basicInfo.roomCount ? `- Oda Sayısı: ${basicInfo.roomCount}+1` : ''}
${basicInfo.areaSqm ? `- Metrekare: ${basicInfo.areaSqm} m²` : ''}
${basicInfo.neighborhood ? `- Mahalle: ${basicInfo.neighborhood}` : ''}
${basicInfo.isKiralik ? '- Tip: Kiralık' : '- Tip: Satılık'}

Bu bilgilerden yola çıkarak bir emlak ilanı için şu bilgileri çıkar:
- İlan başlığı (SEO uyumlu, 60-70 karakter, Türkçe karakterler kullan, mahalle + özellikler + fiyat)
- Kısa açıklama (150-200 karakter, SEO odaklı, anahtar kelimeler içermeli)
- Uzun açıklama (500-800 kelime, HTML formatında, <p> tagları ile, detaylı özellikler)
- İlan tipi (${basicInfo.isKiralik ? 'kiralik' : 'satilik'})
- Emlak tipi (daire, villa, yazlık, müstakil ev, arsa, işyeri, dükkan)
- Mahalle (${basicInfo.neighborhood || 'Karasu mahallelerinden biri: Merkez, Yalı, Aziziye, Çataltepe, Bota, Sahil, Camlık, Kurtuluş, İnköy'})
- Fiyat (${basicInfo.price ? `mutlaka ${basicInfo.price} kullan` : 'makul bir fiyat, sadece sayı'})
- Oda sayısı (${basicInfo.roomCount ? `mutlaka ${basicInfo.roomCount} kullan` : 'klasör isminden çıkar, sadece sayı, villa/yazlık/arsa/işyeri için null'})
- Metrekare (${basicInfo.areaSqm ? `mutlaka ${basicInfo.areaSqm} kullan` : 'klasör isminden çıkar, makul bir değer, sadece sayı'})
- Kat (varsa, sadece sayı, yoksa null)
- Bina yaşı (varsa, sadece sayı, yoksa null)

ÖNEMLİ:
- room_count sadece sayı olmalı (örn: 2, 3, 4), "2+1" formatı değil
- Çıkarılan bilgileri mutlaka kullan (fiyat, oda sayısı, metrekare)
- Mahalle ismini doğru kullan (baş harf büyük: Aziziye, Yalı, vb.)
- Başlık SEO uyumlu olmalı: "Mahalle + Özellikler + Fiyat" formatında

JSON formatında döndür:
{
  "title": "...",
  "description_short": "...",
  "description_long": "...",
  "status": "${basicInfo.isKiralik ? 'kiralik' : 'satilik'}",
  "property_type": "...",
  "location_neighborhood": "${basicInfo.neighborhood || '...'}",
  "price": ${basicInfo.price || 'sayı'},
  "room_count": ${basicInfo.roomCount !== undefined ? basicInfo.roomCount : 'sayı veya null'},
  "area_sqm": ${basicInfo.areaSqm !== undefined ? basicInfo.areaSqm : 'sayı veya null'},
  "floor": sayı veya null,
  "building_age": sayı veya null
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Sen bir emlak ilanı uzmanısın. Verilen bilgilerden SEO uyumlu, profesyonel emlak ilanları oluşturursun. Türkçe yanıt verirsin.",
        },
        {
          role: "user",
          content: context,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI response is empty");
    }

    const parsed = JSON.parse(content);
    
    const features: any = {};
    
    const roomCount = parsed.room_count !== null && parsed.room_count !== undefined
      ? (typeof parsed.room_count === 'string' ? parseInt(parsed.room_count.match(/\d+/)?.[0] || '0') : parsed.room_count)
      : basicInfo.roomCount;
    if (roomCount !== null && roomCount !== undefined) {
      features.room_count = roomCount;
    }
    
    const areaSqm = parsed.area_sqm !== null && parsed.area_sqm !== undefined
      ? parsed.area_sqm
      : basicInfo.areaSqm;
    if (areaSqm !== null && areaSqm !== undefined) {
      features.area_sqm = areaSqm;
    }
    
    if (parsed.floor !== null && parsed.floor !== undefined) {
      features.floor = parsed.floor;
    }
    if (parsed.building_age !== null && parsed.building_age !== undefined) {
      features.building_age = parsed.building_age;
    }
    
    const price = basicInfo.price || parsed.price || (basicInfo.isKiralik ? 5000 : 1000000);
    const neighborhood = basicInfo.neighborhood || parsed.location_neighborhood || "Merkez";
    
    return {
      title: parsed.title || folderName,
      description_short: parsed.description_short || "",
      description_long: parsed.description_long || "",
      status: basicInfo.isKiralik ? "kiralik" : (parsed.status === "kiralik" ? "kiralik" : "satilik"),
      property_type: parsed.property_type || "daire",
      location_neighborhood: neighborhood,
      location_city: "Karasu",
      location_district: "Karasu",
      price_amount: price,
      price_currency: "TRY",
      features: Object.keys(features).length > 0 ? features : undefined,
      images: imageUrls,
    };
  } catch (error: any) {
    console.error(`❌ AI extraction failed for ${folderName}:`, error.message);
    
    const price = basicInfo.price || (basicInfo.isKiralik ? 5000 : 1000000);
    const neighborhood = basicInfo.neighborhood || folderName.split("/")[0]?.split("-")[0] || "Merkez";
    
    return {
      title: folderName,
      description_short: `${neighborhood} Mahallesi'nde ${basicInfo.isKiralik ? "kiralık" : "satılık"} emlak fırsatı - ${price.toLocaleString("tr-TR")} TL`,
      description_long: `<p>${neighborhood} Mahallesi'nde ${basicInfo.isKiralik ? "kiralık" : "satılık"} emlak fırsatı. Fiyat: ${price.toLocaleString("tr-TR")} TL. Detaylı bilgi için iletişime geçin.</p>`,
      status: basicInfo.isKiralik ? "kiralik" : "satilik",
      property_type: "daire",
      location_neighborhood: neighborhood,
      location_city: "Karasu",
      location_district: "Karasu",
      price_amount: price,
      price_currency: "TRY",
      features: (basicInfo.roomCount || basicInfo.areaSqm) ? { 
        ...(basicInfo.roomCount && { room_count: basicInfo.roomCount }),
        ...(basicInfo.areaSqm && { area_sqm: basicInfo.areaSqm })
      } : undefined,
      images: imageUrls,
    };
  }
}

/**
 * Group images by folder
 */
function groupImagesByFolder(images: ImageInfo[]): Map<string, ImageInfo[]> {
  const grouped = new Map<string, ImageInfo[]>();

  for (const image of images) {
    let folder = image.folder;
    
    const prefixes = ["listings/", "gorseller/", "görseller/", "media/"];
    for (const prefix of prefixes) {
      if (folder.startsWith(prefix)) {
        folder = folder.substring(prefix.length);
      }
    }

    if (!folder || folder === "" || folder === "/") {
      continue;
    }

    if (!grouped.has(folder)) {
      grouped.set(folder, []);
    }
    grouped.get(folder)!.push(image);
  }

  return grouped;
}

/**
 * Create listing from folder and images
 */
async function createListingFromFolder(
  supabase: any,
  folderName: string,
  images: ImageInfo[]
): Promise<string | null> {
  try {
    const imageNames = images.map((img) => img.name);
    const imageUrls = images.map((img) => img.url);

    const listingData = await extractListingInfo(folderName, imageNames, imageUrls);

    const slug = generateSlug(listingData.title || folderName);

    // Check if listing with same slug exists
    const { data: existing } = await supabase
      .from("listings")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    let finalSlug = slug;
    if (existing) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    const listingPayload: any = {
      title: listingData.title || folderName,
      slug: finalSlug,
      description_short: listingData.description_short || "",
      description_long: listingData.description_long || "",
      status: listingData.status || "satilik",
      property_type: listingData.property_type || "daire",
      location_neighborhood: listingData.location_neighborhood || "Merkez",
      location_city: listingData.location_city || "Karasu",
      location_district: listingData.location_district || "Karasu",
      price_amount: listingData.price_amount || 1000000,
      price_currency: listingData.price_currency || "TRY",
      published: true,
      featured: false,
      available: true,
      images: Array.isArray(listingData.images) 
        ? listingData.images.map((url: string, index: number) => ({
            url: url,
            public_id: url.split('/').pop()?.split('.')[0] || `listing-${Date.now()}-${index}`,
            alt: listingData.title || folderName,
            order: index,
          }))
        : [],
      features: listingData.features || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: listing, error } = await supabase
      .from("listings")
      .insert(listingPayload)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return listing.id;
  } catch (error: any) {
    console.error(`   ❌ İlan oluşturulamadı: ${error.message}`);
    return null;
  }
}

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  const supabase = createServiceClient();

  try {
    // List all images from storage
    let allImages = await listAllFiles(supabase, "", [], "media");
    
    const gorsellerImages = await listAllFiles(supabase, "gorseller", [], "media");
    const gorsellerImages2 = await listAllFiles(supabase, "görseller", [], "media");
    
    allImages = [...allImages, ...gorsellerImages, ...gorsellerImages2];

    if (allImages.length === 0) {
      return createSuccessResponse(requestId, {
        message: "Hiç görsel bulunamadı",
        created: 0,
        skipped: 0,
        errors: 0,
      });
    }

    // Group images by folder
    const groupedImages = groupImagesByFolder(allImages);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    // Process each folder
    for (const [folderName, images] of groupedImages.entries()) {
      if (images.length === 0) {
        skipped++;
        continue;
      }

      if (!folderName || folderName === "" || folderName === "/" || 
          folderName === "listings" || folderName === "gorseller" || folderName === "görseller") {
        skipped++;
        continue;
      }
      
      if (images.length < 2) {
        skipped++;
        continue;
      }

      const listingId = await createListingFromFolder(supabase, folderName, images);

      if (listingId) {
        created++;
      } else {
        errors++;
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return createSuccessResponse(requestId, {
      message: `${created} ilan oluşturuldu`,
      created,
      skipped,
      errors,
      total: groupedImages.size,
    });
  } catch (error: any) {
    console.error("Create listings from images error:", error);
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "İlanlar oluşturulamadı",
      error,
      500
    );
  }
}

export const POST = withErrorHandling(handlePost);
