import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { generateSlug } from "@/lib/utils";

/**
 * Add Neighborhoods API
 * Adds more neighborhoods to the database
 * Only works in development mode
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  const supabase = createServiceClient();

  // Karasu'nun gerçek mahalleleri
  const neighborhoods = [
    {
      name: "Akçakoca",
      slug: "akcakoca",
      district: "Karasu",
      city: "Sakarya",
      description: "Karasu'nun güzel mahallelerinden biri olan Akçakoca, denize yakın konumuyla dikkat çekiyor.",
      coordinates_lat: 41.1020,
      coordinates_lng: 30.7880,
      published: true,
    },
    {
      name: "Beyköy",
      slug: "beykoy",
      district: "Karasu",
      city: "Sakarya",
      description: "Beyköy mahallesi, Karasu'nun merkeze yakın konumdaki mahallelerinden biridir.",
      coordinates_lat: 41.0880,
      coordinates_lng: 30.7720,
      published: true,
    },
    {
      name: "Cumhuriyet",
      slug: "cumhuriyet",
      district: "Karasu",
      city: "Sakarya",
      description: "Cumhuriyet mahallesi, Karasu'nun merkezi mahallelerinden biridir.",
      coordinates_lat: 41.0940,
      coordinates_lng: 30.7840,
      published: true,
    },
    {
      name: "Denizköy",
      slug: "denizkoy",
      district: "Karasu",
      city: "Sakarya",
      description: "Denizköy mahallesi, denize sıfır konumuyla yazlık evler için ideal bir mahalledir.",
      coordinates_lat: 41.1050,
      coordinates_lng: 30.7920,
      published: true,
    },
    {
      name: "Erenler",
      slug: "erenler",
      district: "Karasu",
      city: "Sakarya",
      description: "Erenler mahallesi, Karasu'nun gelişmekte olan mahallelerinden biridir.",
      coordinates_lat: 41.0820,
      coordinates_lng: 30.7680,
      published: true,
    },
    {
      name: "Fatih",
      slug: "fatih",
      district: "Karasu",
      city: "Sakarya",
      description: "Fatih mahallesi, Karasu merkeze yakın konumda yer alan mahallelerden biridir.",
      coordinates_lat: 41.0920,
      coordinates_lng: 30.7820,
      published: true,
    },
    {
      name: "Güneşli",
      slug: "gunesli",
      district: "Karasu",
      city: "Sakarya",
      description: "Güneşli mahallesi, güneşli havası ve denize yakın konumuyla dikkat çekiyor.",
      coordinates_lat: 41.0980,
      coordinates_lng: 30.7860,
      published: true,
    },
    {
      name: "Hürriyet",
      slug: "hurriyet",
      district: "Karasu",
      city: "Sakarya",
      description: "Hürriyet mahallesi, Karasu'nun merkezi mahallelerinden biridir.",
      coordinates_lat: 41.0900,
      coordinates_lng: 30.7800,
      published: true,
    },
    {
      name: "İnönü",
      slug: "inonu",
      district: "Karasu",
      city: "Sakarya",
      description: "İnönü mahallesi, Karasu'nun tarihi mahallelerinden biridir.",
      coordinates_lat: 41.0960,
      coordinates_lng: 30.7830,
      published: true,
    },
    {
      name: "Kıyı",
      slug: "kiyi",
      district: "Karasu",
      city: "Sakarya",
      description: "Kıyı mahallesi, deniz kıyısında yer alan ve yazlık evler için ideal bir mahalledir.",
      coordinates_lat: 41.1030,
      coordinates_lng: 30.7900,
      published: true,
    },
    {
      name: "Kurtuluş",
      slug: "kurtulus",
      district: "Karasu",
      city: "Sakarya",
      description: "Kurtuluş mahallesi, Karasu'nun merkeze yakın mahallelerinden biridir.",
      coordinates_lat: 41.0910,
      coordinates_lng: 30.7810,
      published: true,
    },
    {
      name: "Mareşal Fevzi Çakmak",
      slug: "maresal-fevzi-cakmak",
      district: "Karasu",
      city: "Sakarya",
      description: "Mareşal Fevzi Çakmak mahallesi, Karasu'nun gelişmekte olan mahallelerinden biridir.",
      coordinates_lat: 41.0870,
      coordinates_lng: 30.7710,
      published: true,
    },
    {
      name: "Orta",
      slug: "orta",
      district: "Karasu",
      city: "Sakarya",
      description: "Orta mahallesi, Karasu'nun merkezi konumdaki mahallelerinden biridir.",
      coordinates_lat: 41.0930,
      coordinates_lng: 30.7830,
      published: true,
    },
    {
      name: "Özgürlük",
      slug: "ozgurluk",
      district: "Karasu",
      city: "Sakarya",
      description: "Özgürlük mahallesi, Karasu'nun modern mahallelerinden biridir.",
      coordinates_lat: 41.0890,
      coordinates_lng: 30.7790,
      published: true,
    },
    {
      name: "Şehitler",
      slug: "sehitler",
      district: "Karasu",
      city: "Sakarya",
      description: "Şehitler mahallesi, Karasu'nun anlamlı mahallelerinden biridir.",
      coordinates_lat: 41.0970,
      coordinates_lng: 30.7845,
      published: true,
    },
    {
      name: "Tepe",
      slug: "tepe",
      district: "Karasu",
      city: "Sakarya",
      description: "Tepe mahallesi, yüksek konumuyla deniz manzarası sunan bir mahalledir.",
      coordinates_lat: 41.1010,
      coordinates_lng: 30.7870,
      published: true,
    },
    {
      name: "Yalı",
      slug: "yali",
      district: "Karasu",
      city: "Sakarya",
      description: "Yalı mahallesi, deniz kıyısında yer alan ve lüks yazlık evler için ideal bir mahalledir.",
      coordinates_lat: 41.1040,
      coordinates_lng: 30.7910,
      published: true,
    },
    {
      name: "Zafer",
      slug: "zafer",
      district: "Karasu",
      city: "Sakarya",
      description: "Zafer mahallesi, Karasu'nun merkezi mahallelerinden biridir.",
      coordinates_lat: 41.0950,
      coordinates_lng: 30.7825,
      published: true,
    },
  ];

  const results = [];

  for (const neighborhood of neighborhoods) {
    // Check if already exists
    const { data: existing } = await supabase
      .from("neighborhoods")
      .select("id")
      .eq("slug", neighborhood.slug)
      .single();

    if (existing) {
      results.push({ success: false, name: neighborhood.name, error: "Already exists" });
      continue;
    }

    const { data, error } = await supabase
      .from("neighborhoods")
      .insert({
        ...neighborhood,
        seo_content: {
          intro: neighborhood.description,
          transportation: "Karasu merkeze yakın konumda, ulaşım kolaylığı sunmaktadır.",
          seaDistance: "Denize yakın konumda yer almaktadır.",
          socialLife: "Mahalle içinde temel ihtiyaçlarınızı karşılayabileceğiniz dükkanlar ve tesisler bulunmaktadır.",
          investmentPotential: "Gelişmekte olan bir mahalle olarak yatırım potansiyeli yüksektir.",
        },
        faqs: [
          {
            question: `${neighborhood.name} mahallesi nerede?`,
            answer: `${neighborhood.name} mahallesi, Karasu ilçesinde, ${neighborhood.description}`,
          },
          {
            question: `${neighborhood.name} mahallesinde emlak fiyatları nasıl?`,
            answer: `${neighborhood.name} mahallesinde emlak fiyatları konum ve özelliklere göre değişiklik göstermektedir. Detaylı bilgi için bizimle iletişime geçebilirsiniz.`,
          },
        ],
        stats: {
          totalProperties: 0,
          averagePrice: 0,
          priceRange: { min: 0, max: 0 },
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      results.push({ success: false, name: neighborhood.name, error: error.message });
    } else {
      results.push({ success: true, name: neighborhood.name, slug: data.slug });
    }
  }

  return NextResponse.json({
    success: true,
    message: `Added ${results.filter((r) => r.success).length} neighborhoods`,
    results,
  });
}

