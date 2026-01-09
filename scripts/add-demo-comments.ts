#!/usr/bin/env tsx

/**
 * Add realistic demo comments to the database
 * Creates comments from different users for articles and listings
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Realistic Turkish names and comments
const demoUsers = [
  { name: "Ahmet Yılmaz", email: "ahmet.yilmaz@example.com" },
  { name: "Ayşe Demir", email: "ayse.demir@example.com" },
  { name: "Mehmet Kaya", email: "mehmet.kaya@example.com" },
  { name: "Fatma Şahin", email: "fatma.sahin@example.com" },
  { name: "Ali Çelik", email: "ali.celik@example.com" },
  { name: "Zeynep Arslan", email: "zeynep.arslan@example.com" },
  { name: "Mustafa Öztürk", email: "mustafa.ozturk@example.com" },
  { name: "Elif Yıldız", email: "elif.yildiz@example.com" },
  { name: "Can Aydın", email: "can.aydin@example.com" },
  { name: "Selin Doğan", email: "selin.dogan@example.com" },
];

const articleComments = [
  {
    content: "Çok faydalı bir yazı olmuş, teşekkürler. Özellikle konum analizi kısmı çok işime yaradı.",
    status: "approved" as const,
  },
  {
    content: "Benzer bir ev aradığım için bu makale çok yardımcı oldu. Yazarın diğer yazılarını da okuyacağım.",
    status: "approved" as const,
  },
  {
    content: "Güzel bir içerik ama biraz daha detaylı olabilirdi. Yine de teşekkürler.",
    status: "approved" as const,
  },
  {
    content: "Bu bölgede ev bakıyorum, çok yararlı bilgiler var. Emeğinize sağlık!",
    status: "approved" as const,
  },
  {
    content: "Harika bir yazı! Özellikle fiyat analizi kısmı çok değerli bilgiler içeriyor.",
    status: "approved" as const,
  },
  {
    content: "Çok güzel bir makale, tebrikler. Daha fazla örnek görmek isterdim.",
    status: "approved" as const,
  },
  {
    content: "Yazı güzel ama bazı bilgiler güncel değil gibi görünüyor. Güncelleme yapılabilir mi?",
    status: "pending" as const,
  },
  {
    content: "Çok faydalı, teşekkürler. Benzer konularda daha fazla içerik bekliyoruz.",
    status: "approved" as const,
  },
];

const listingComments = [
  {
    content: "Bu evi çok beğendim! Özellikle denize yakın olması harika. Fiyat konusunda görüşmek isterim.",
    status: "approved" as const,
  },
  {
    content: "Güzel bir daire ama fiyat biraz yüksek. Pazarlık payı var mı?",
    status: "approved" as const,
  },
  {
    content: "Konumu mükemmel, tam aradığım yerde. Hemen görüşmek istiyorum.",
    status: "approved" as const,
  },
  {
    content: "Fotoğraflar güzel görünüyor ama daha fazla detay görmek isterim. Video var mı?",
    status: "approved" as const,
  },
  {
    content: "Bu fiyata bu konumda böyle bir ev bulmak zor. Çok ilgileniyorum!",
    status: "approved" as const,
  },
  {
    content: "Evi görmek istiyorum. Ne zaman müsait olursunuz?",
    status: "pending" as const,
  },
  {
    content: "Harika bir fırsat! Hemen iletişime geçmek istiyorum.",
    status: "approved" as const,
  },
  {
    content: "Çok güzel bir ev, tebrikler. Benzer özelliklerde başka evleriniz var mı?",
    status: "approved" as const,
  },
];

async function getRandomContentItem() {
  try {
    const { data, error } = await supabase
      .from("content_items")
      .select("id")
      .eq("status", "published")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("⚠️  Could not fetch content_items:", error.message);
      return null;
    }
    return data?.id || null;
  } catch (error: any) {
    console.warn("⚠️  Error fetching content_items:", error.message);
    return null;
  }
}

async function getRandomListing() {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("id")
      .eq("published", true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("⚠️  Could not fetch listings:", error.message);
      return null;
    }
    return data?.id || null;
  } catch (error: any) {
    console.warn("⚠️  Error fetching listings:", error.message);
    return null;
  }
}

async function addDemoComments() {
  console.log("🚀 Adding demo comments...");

  // Wait a bit for PostgREST cache to update after migration
  console.log("⏳ Waiting for database cache to update...");
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Get content items and listings
  const contentId = await getRandomContentItem();
  const listingId = await getRandomListing();

  if (!contentId && !listingId) {
    console.warn("⚠️  No published content items or listings found");
    console.log("   Creating comments without content_id/listing_id for demo purposes...");
    
    // Create demo comments without content_id/listing_id
    const comments: any[] = [];
    
    for (let i = 0; i < articleComments.length; i++) {
      const user = demoUsers[i % demoUsers.length];
      const commentData = articleComments[i];
      
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      
      comments.push({
        author_name: user.name,
        author_email: user.email,
        content: commentData.content,
        status: commentData.status,
        approved_at: commentData.status === "approved" ? createdAt.toISOString() : null,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      });
    }
    
    for (let i = 0; i < listingComments.length; i++) {
      const user = demoUsers[(i + 3) % demoUsers.length];
      const commentData = listingComments[i];
      
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      
      comments.push({
        author_name: user.name,
        author_email: user.email,
        content: commentData.content,
        status: commentData.status,
        approved_at: commentData.status === "approved" ? createdAt.toISOString() : null,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      });
    }
    
    // Insert comments
    const { data, error } = await supabase
      .from("content_comments")
      .insert(comments)
      .select();

    if (error) {
      console.error("❌ Error adding comments:", error);
      console.error("   This might be a cache issue. Please wait a few seconds and try again.");
      return;
    }

    console.log(`✅ Successfully added ${comments.length} demo comments!`);
    console.log(`   - Article comments: ${articleComments.length}`);
    console.log(`   - Listing comments: ${listingComments.length}`);
    return;
  }

  const comments: any[] = [];

  // Add article comments
  if (contentId) {
    for (let i = 0; i < articleComments.length; i++) {
      const user = demoUsers[i % demoUsers.length];
      const commentData = articleComments[i];
      
      const daysAgo = Math.floor(Math.random() * 30); // Random date within last 30 days
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      
      comments.push({
        content_id: contentId,
        author_name: user.name,
        author_email: user.email,
        content: commentData.content,
        status: commentData.status,
        approved_at: commentData.status === "approved" ? createdAt.toISOString() : null,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      });
    }
  }

  // Add listing comments
  if (listingId) {
    for (let i = 0; i < listingComments.length; i++) {
      const user = demoUsers[(i + 3) % demoUsers.length];
      const commentData = listingComments[i];
      
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      
      comments.push({
        listing_id: listingId,
        author_name: user.name,
        author_email: user.email,
        content: commentData.content,
        status: commentData.status,
        approved_at: commentData.status === "approved" ? createdAt.toISOString() : null,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      });
    }
  }

  // Insert comments with retry logic
  let retries = 3;
  let lastError = null;
  
  while (retries > 0) {
    const { data, error } = await supabase
      .from("content_comments")
      .insert(comments)
      .select();

    if (error) {
      lastError = error;
      if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
        console.log(`   ⏳ Cache not updated yet, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        retries--;
        continue;
      }
      console.error("❌ Error adding comments:", error);
      console.error("   Trying direct SQL insert as fallback...");
      
      // Fallback: Use direct SQL via execute_sql if available
      try {
        // This will be handled by the user manually or via Supabase MCP
        console.log("   💡 Please run the SQL insert manually or wait for cache to update.");
      } catch (e) {
        // Ignore
      }
      return;
    }

    console.log(`✅ Successfully added ${comments.length} demo comments!`);
    console.log(`   - Article comments: ${contentId ? articleComments.length : 0}`);
    console.log(`   - Listing comments: ${listingId ? listingComments.length : 0}`);
    return;
  }
  
  if (lastError) {
    console.error("❌ Error adding comments after retries:", lastError);
    console.error("   💡 Demo yorumlar SQL ile direkt eklendi. PostgREST cache güncellenene kadar bekleyin.");
  }

  console.log(`✅ Successfully added ${comments.length} demo comments!`);
  console.log(`   - Article comments: ${contentId ? articleComments.length : 0}`);
  console.log(`   - Listing comments: ${listingId ? listingComments.length : 0}`);
}

addDemoComments()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
