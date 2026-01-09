/**
 * Add Test Listings Script
 * Adds sample property listings for testing purposes
 */

import { createServiceClient } from "@karasu/lib/supabase/service";
import { slugify } from "@karasu/lib/utils";

const testListings = [
  {
    title: "Karasu Merkez'de Satılık 3+1 Daire",
    status: "satilik" as const,
    property_type: "daire" as const,
    location_neighborhood: "Merkez",
    location_full_address: "Karasu Merkez, Sakarya",
    coordinates_lat: 41.0969,
    coordinates_lng: 30.7856,
    price_amount: 2500000,
    price_currency: "TRY",
    features: {
      rooms: 3,
      bathrooms: 1,
      sizeM2: 120,
      floor: 3,
      buildingAge: 5,
      heating: "Kombi",
      furnished: true,
      balcony: true,
      parking: true,
      elevator: true,
      seaView: false,
    },
    description_short: "Karasu Merkez'de satılık modern 3+1 daire. Denize yakın, merkezi konumda.",
    description_long: "Karasu Merkez'de satılık modern 3+1 daire. Denize yakın, merkezi konumda. Kombi ile ısıtma, balkonlu, otoparklı ve asansörlü. Yeni yapı, temiz ve bakımlı.",
    images: [
      {
        public_id: "test/listing-1-1",
        url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
        alt: "3+1 Daire - Oturma Odası",
        order: 0,
      },
      {
        public_id: "test/listing-1-2",
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
        alt: "3+1 Daire - Mutfak",
        order: 1,
      },
    ],
    agent_name: "Karasu Emlak",
    agent_phone: "+905466395461",
    agent_whatsapp: "905466395461",
    agent_email: "info@karasuemlak.net",
    published: true,
    available: true,
  },
  {
    title: "Sahil Mahallesi'nde Kiralık Yazlık Villa",
    status: "kiralik" as const,
    property_type: "villa" as const,
    location_neighborhood: "Sahil",
    location_full_address: "Karasu Sahil Mahallesi, Sakarya",
    coordinates_lat: 41.1000,
    coordinates_lng: 30.7900,
    price_amount: 15000,
    price_currency: "TRY",
    features: {
      rooms: 4,
      bathrooms: 2,
      sizeM2: 200,
      floor: 2,
      buildingAge: 10,
      heating: "Klima",
      furnished: true,
      balcony: true,
      parking: true,
      elevator: false,
      seaView: true,
    },
    description_short: "Sahil Mahallesi'nde deniz manzaralı kiralık yazlık villa. Yaz sezonu için ideal.",
    description_long: "Sahil Mahallesi'nde deniz manzaralı kiralık yazlık villa. Yaz sezonu için ideal. 4+2, geniş bahçeli, denize sıfır konumda. Tam eşyalı, klima ile soğutma.",
    images: [
      {
        public_id: "test/listing-2-1",
        url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
        alt: "Yazlık Villa - Dış Görünüm",
        order: 0,
      },
      {
        public_id: "test/listing-2-2",
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        alt: "Yazlık Villa - Deniz Manzarası",
        order: 1,
      },
    ],
    agent_name: "Karasu Emlak",
    agent_phone: "+905466395461",
    agent_whatsapp: "905466395461",
    agent_email: "info@karasuemlak.net",
    published: true,
    available: true,
  },
  {
    title: "Liman Mahallesi'nde Satılık Arsa",
    status: "satilik" as const,
    property_type: "arsa" as const,
    location_neighborhood: "Liman",
    location_full_address: "Karasu Liman Mahallesi, Sakarya",
    coordinates_lat: 41.0950,
    coordinates_lng: 30.7800,
    price_amount: 800000,
    price_currency: "TRY",
    features: {
      sizeM2: 500,
      seaView: true,
    },
    description_short: "Liman Mahallesi'nde satılık deniz manzaralı arsa. İmar durumu uygun.",
    description_long: "Liman Mahallesi'nde satılık deniz manzaralı arsa. İmar durumu uygun, villa yapımına müsait. 500 m², denize yakın konumda.",
    images: [
      {
        public_id: "test/listing-3-1",
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
        alt: "Arsa - Genel Görünüm",
        order: 0,
      },
    ],
    agent_name: "Karasu Emlak",
    agent_phone: "+905466395461",
    agent_whatsapp: "905466395461",
    agent_email: "info@karasuemlak.net",
    published: true,
    available: true,
  },
  {
    title: "Çamlık Mahallesi'nde Satılık 2+1 Daire",
    status: "satilik" as const,
    property_type: "daire" as const,
    location_neighborhood: "Çamlık",
    location_full_address: "Karasu Çamlık Mahallesi, Sakarya",
    coordinates_lat: 41.0900,
    coordinates_lng: 30.7750,
    price_amount: 1800000,
    price_currency: "TRY",
    features: {
      rooms: 2,
      bathrooms: 1,
      sizeM2: 90,
      floor: 2,
      buildingAge: 8,
      heating: "Kombi",
      furnished: false,
      balcony: true,
      parking: true,
      elevator: true,
      seaView: false,
    },
    description_short: "Çamlık Mahallesi'nde satılık 2+1 daire. Uygun fiyatlı, merkezi konumda.",
    description_long: "Çamlık Mahallesi'nde satılık 2+1 daire. Uygun fiyatlı, merkezi konumda. Kombi ile ısıtma, balkonlu, otoparklı ve asansörlü.",
    images: [
      {
        public_id: "test/listing-4-1",
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        alt: "2+1 Daire - Oturma Odası",
        order: 0,
      },
    ],
    agent_name: "Karasu Emlak",
    agent_phone: "+905466395461",
    agent_whatsapp: "905466395461",
    agent_email: "info@karasuemlak.net",
    published: true,
    available: true,
  },
  {
    title: "Yeni Mahalle'de Kiralık 1+1 Daire",
    status: "kiralik" as const,
    property_type: "daire" as const,
    location_neighborhood: "Yeni Mahalle",
    location_full_address: "Karasu Yeni Mahalle, Sakarya",
    coordinates_lat: 41.0850,
    coordinates_lng: 30.7700,
    price_amount: 5000,
    price_currency: "TRY",
    features: {
      rooms: 1,
      bathrooms: 1,
      sizeM2: 60,
      floor: 1,
      buildingAge: 12,
      heating: "Soba",
      furnished: true,
      balcony: false,
      parking: false,
      elevator: false,
      seaView: false,
    },
    description_short: "Yeni Mahalle'de kiralık 1+1 daire. Uygun fiyatlı, ekonomik.",
    description_long: "Yeni Mahalle'de kiralık 1+1 daire. Uygun fiyatlı, ekonomik. Tam eşyalı, soba ile ısıtma.",
    images: [
      {
        public_id: "test/listing-5-1",
        url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
        alt: "1+1 Daire - Genel Görünüm",
        order: 0,
      },
    ],
    agent_name: "Karasu Emlak",
    agent_phone: "+905466395461",
    agent_whatsapp: "905466395461",
    agent_email: "info@karasuemlak.net",
    published: true,
    available: true,
  },
];

async function addTestListings() {
  const supabase = createServiceClient();

  console.log("🚀 Adding test listings...\n");

  for (const listing of testListings) {
    const slug = slugify(`${listing.title}-${listing.location_neighborhood}`);

    const { data, error } = await supabase
      .from("listings")
      .insert({
        ...listing,
        slug,
        location_city: "Sakarya",
        location_district: "Karasu",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error adding listing "${listing.title}":`, error.message);
    } else {
      console.log(`✅ Added: ${listing.title} (${slug})`);
    }
  }

  console.log("\n✨ Done!");
}

// Run if executed directly
if (require.main === module) {
  addTestListings().catch(console.error);
}

export { addTestListings };

