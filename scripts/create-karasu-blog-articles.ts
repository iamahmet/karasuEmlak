#!/usr/bin/env tsx

/**
 * Create Karasu Blog Articles
 * 
 * 10 adet SEO optimize, Google Discover/SGE uyumlu blog yazısı oluşturur.
 * Karasu emlak uzmanı gibi, doğal, insan gibi yazılmış içerikler.
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

interface BlogArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_description: string;
  keywords: string[];
  category: string;
  author: string;
  status: "published";
}

const BLOG_ARTICLES: BlogArticle[] = [
  {
    title: "Karasu'da Satılık Daire Ararken Dikkat Edilmesi Gereken 10 Nokta",
    slug: "karasuda-satilik-daire-ararken-dikkat-edilmesi-gereken-10-nokta",
    excerpt: "Karasu'da satılık daire ararken dikkat edilmesi gereken kritik noktalar. Konum, fiyat, bina durumu ve yatırım potansiyeli hakkında pratik öneriler.",
    content: `# Karasu'da Satılık Daire Ararken Dikkat Edilmesi Gereken 10 Nokta

Karasu'da satılık daire ararken sadece fiyata bakmak yeterli değil. Konum, bina durumu, yatırım potansiyeli gibi birçok faktör var. Bu yazıda, Karasu'da daire alırken dikkat edilmesi gereken en önemli noktalar var.

## 1. Konum ve Denize Mesafe

Karasu'da daire alırken konum en kritik faktör. Denize yakınlık hem yaşam kalitesi hem yatırım değeri açısından önemli. Denize 500 metre içinde olan daireler, hem kira getirisi hem değer artışı açısından avantajlı.

Ancak denize çok yakın olmak her zaman iyi değil. Plaj caddesi üzerindeki daireler yaz aylarında gürültülü olabiliyor. 200-500 metre arası mesafe genellikle en ideal.

## 2. Bina Yaşı ve Durumu

Bina yaşı, hem fiyat hem bakım maliyeti açısından önemli. Yeni yapılar pahalı ama bakım maliyeti düşük. Eski binalar uygun ama ileride sorun çıkarabilir.

10-15 yıllık binalar genellikle en iyi fiyat/performans oranını sunuyor. Hem uygun fiyatlı hem de bakım maliyeti makul. 20 yıldan eski binalarda dikkatli olmak gerekiyor.

## 3. Fiyat ve Piyasa Değeri

Karasu'da satılık daire fiyatları, konum ve özelliklere göre değişiyor. Denize yakın daireler 1.5-3 milyon TL, merkez daireler 800 bin - 1.5 milyon TL arasında.

Fiyat karşılaştırması yaparken, benzer konum ve özellikteki daireleri karşılaştırmak gerekiyor. Çok uygun fiyatlı daireler genellikle bir sorun işareti olabilir.

## 4. Kira Getirisi Potansiyeli

Yatırım amaçlı daire alırken kira getirisi önemli. Denize yakın daireler hem yazlık hem oturumluk için yüksek kira getiriyor. Merkez daireler yıl boyu stabil gelir sağlıyor.

Yıllık kira geliri, daire fiyatının %5-8'i arasında olmalı. Bu oranın altındaysa, yatırım karlılığı düşük demektir.

## 5. Ulaşım ve Altyapı

Karasu merkeze yakın bölgeler ulaşım açısından avantajlı. İstanbul'a yakınlık da önemli. Özellikle hafta sonu kaçamakları için tercih edilen bölgelerde talep yüksek.

Altyapı durumu da önemli. Su, elektrik, internet gibi hizmetlerin durumu kontrol edilmeli. Yeni yapılan bölgelerde altyapı sorunları olabilir.

## 6. Bina Özellikleri

Asansör, otopark, balkon gibi özellikler hem yaşam kalitesi hem yatırım değeri açısından önemli. Özellikle yazlık yatırım için balkon ve deniz manzarası kritik.

Yeni yapılarda bu özellikler genellikle var. Eski binalarda eksik olabilir. Eksik özellikler hem kira getirisini hem satış değerini düşürüyor.

## 7. Çevre ve Komşuluk

Daire alırken çevre de önemli. Sessiz, güvenli bölgeler hem yaşam kalitesi hem yatırım değeri açısından avantajlı. Turizm bölgelerinde yaz aylarında gürültü olabilir.

Komşuluk ilişkileri de önemli. Özellikle yazlık kullanım için, komşuların profili ve yaşam tarzı uyumlu olmalı.

## 8. Yatırım Potansiyeli

Karasu'da daire alırken yatırım potansiyelini değerlendirmek gerekiyor. Denize yakın bölgeler hem kira hem değer artışı açısından avantajlı. Uzun vadede değer kazanacak bölgeler tercih edilmeli.

Son 3 yılda Karasu'da emlak fiyatları %40-50 arttı. Gelecekte de artış bekleniyor ama hızı yavaşlayabilir. Yatırım yaparken uzun vadeli düşünmek gerekiyor.

## 9. Hukuki Durum

Daire alırken hukuki durum kontrol edilmeli. Tapu, imar durumu, yapı ruhsatı gibi belgeler kontrol edilmeli. Özellikle yeni yapılan bölgelerde imar sorunları olabilir.

Noter işlemleri sırasında tüm belgeler kontrol edilmeli. Eksik belgeler ileride sorun çıkarabilir.

## 10. Bakım ve Onarım Maliyetleri

Daire alırken bakım maliyetleri de hesaba katılmalı. Denize yakın binalar daha fazla bakım gerektiriyor. Nem, tuzlu hava gibi faktörler etkiliyor.

Yeni yapılar bakım maliyeti düşük. Eski binalar daha fazla bakım gerektiriyor. 10-15 yıllık binalar genellikle en dengeli seçenek.

## Sonuç

Karasu'da satılık daire ararken sadece fiyata değil, konum, bina durumu, yatırım potansiyeli gibi birçok faktöre bakmak gerekiyor. Denize yakın bölgeler hem yaşam hem yatırım açısından avantajlı.

Yatırım yaparken uzun vadeli düşünmek ve tüm faktörleri birlikte değerlendirmek gerekiyor. Karasu'da satılık daire ararken, hem yazlık hem oturumluk seçenekleri göz önünde bulundurulmalı.`,
    meta_description: "Karasu'da satılık daire ararken dikkat edilmesi gereken 10 kritik nokta. Konum, fiyat, bina durumu ve yatırım potansiyeli hakkında pratik öneriler.",
    keywords: ["karasu satılık daire", "karasu emlak", "karasu yatırım", "karasu denize yakın daire"],
    category: "Emlak Rehberi",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "Karasu Yazlık Fiyatları 2025: Güncel Piyasa Analizi ve Yatırım Önerileri",
    slug: "karasu-yazlik-fiyatlari-2025-guncel-piyasa-analizi-ve-yatirim-onerileri",
    excerpt: "Karasu yazlık fiyatları 2025 güncel analizi. Denize yakın yazlıklar, fiyat trendleri ve yatırım fırsatları. Yazlık alırken dikkat edilmesi gerekenler.",
    content: `# Karasu Yazlık Fiyatları 2025: Güncel Piyasa Analizi ve Yatırım Önerileri

Karasu yazlık fiyatları, son yıllarda ciddi artış gösterdi. Denize yakın konumlar özellikle değer kazandı. Bu yazıda, 2025 yılı itibariyle Karasu yazlık fiyatları ve yatırım önerileri var.

## 2025 Yazlık Fiyat Trendleri

Karasu'da yazlık fiyatları, konum ve denize mesafeye göre değişiyor. Denize sıfır villalar 3-5 milyon TL, denize yakın daireler 1.5-3 milyon TL arasında. Merkeze uzak ama denize yakın bölgelerde daha uygun fırsatlar bulunabiliyor.

Son 3 yılda yazlık fiyatları %50-60 arttı. Bu artış, özellikle denize yakın bölgelerde daha belirgin. Gelecekte de artış bekleniyor ama hızı yavaşlayabilir.

## Denize Yakın Yazlık Fiyatları

Denize yakın yazlıklar, en yüksek fiyatlı seçenekler. Denize sıfır villalar 3-5 milyon TL, denize yakın daireler 1.5-3 milyon TL arasında.

Denize 500 metre içinde olan yazlıklar, hem kira getirisi hem değer artışı açısından avantajlı. Yaz sezonunda yüksek kira, uzun vadede değer artışı potansiyeli var.

## Merkez Yazlık Fiyatları

Merkeze yakın yazlıklar daha uygun fiyatlı. 600 bin - 1.5 milyon TL arasında seçenekler var. Ancak kira getirisi ve değer artışı potansiyeli daha düşük.

Merkez yazlıklar, özellikle oturumluk kullanım için uygun. Hem yazlık hem oturumluk kullanılabilir, bu da yıl boyu kullanım imkanı sağlıyor.

## Yatırım Önerileri

Karasu yazlık yatırımı için öneriler:

**1. Denize Yakın Bölgeler:**
En yüksek yatırım potansiyeli. Hem kira hem değer artışı yüksek.

**2. Uzun Vadeli Düşünün:**
Yazlık yatırımı kısa vadeli değil. 5-10 yıl sonra satış planı yapın.

**3. Hem Kira Hem Değer:**
Sadece kira gelirine değil, değer artışına da bakın.

**4. Konum Öncelikli:**
Denize mesafe kritik. Mümkünse 500 metre içinde yazlık tercih edin.

## Sonuç

Karasu yazlık fiyatları, denize yakınlık ve konuma göre değişiyor. Denize yakın yazlıklar yüksek fiyatlı ama yatırım potansiyeli yüksek. Merkez yazlıklar uygun fiyatlı ama getiri daha düşük.

Yatırım yaparken konum, denize mesafe ve bina durumunu birlikte değerlendirmek gerekiyor. Karasu yazlık fiyatları hala İstanbul veya Antalya'ya göre daha erişilebilir.`,
    meta_description: "Karasu yazlık fiyatları 2025 güncel analizi. Denize yakın yazlıklar, fiyat trendleri ve yatırım fırsatları hakkında detaylı bilgi.",
    keywords: ["karasu yazlık fiyatları", "karasu yazlık yatırım", "karasu emlak", "karasu satılık daire"],
    category: "Piyasa Analizi",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "Karasu'da Kira Getirisi Yüksek Bölgeler: Yatırımcılar İçin Rehber",
    slug: "karasuda-kira-getirisi-yuksek-bolgeler-yatirimcilar-icin-rehber",
    excerpt: "Karasu'da kira getirisi yüksek bölgeler ve yatırım önerileri. Oturumluk ve yazlık konutların kira gelirleri, en karlı bölgeler ve yatırım stratejileri.",
    content: `# Karasu'da Kira Getirisi Yüksek Bölgeler: Yatırımcılar İçin Rehber

Karasu'da emlak yatırımı yaparken kira getirisi önemli. Hem oturumluk hem yazlık konutlar için kira gelirleri değişiyor. Bu yazıda, kira getirisi yüksek bölgeler ve yatırım önerileri var.

## En Yüksek Kira Getirisi Olan Bölgeler

Karasu'da kira getirisi yüksek bölgeler:

**1. Denize Sıfır Bölgeler:**
En yüksek kira getirisi. Yaz sezonunda yüksek talep, yıl boyu kira potansiyeli.

**2. Merkeze Yakın Denize Ulaşılabilir:**
İyi kira getirisi. Yıl boyu talep, hem oturumluk hem yazlık kullanım.

**3. Merkez Bölgeler:**
Stabil kira geliri. Yıl boyu talep, düşük ama garantili gelir.

## Oturumluk Kira Getirisi

Merkez bölgelerde oturumluk daireler yıl boyu kira geliri sağlıyor. 2+1 daireler aylık 5-7 bin TL, 3+1 daireler 7-10 bin TL arasında kira getiriyor.

Denize yakın bölgelerde kira getirisi daha yüksek. 2+1 daireler aylık 6-8 bin TL, 3+1 daireler 8-12 bin TL arasında.

## Yazlık Kira Getirisi

Yazlık konutlar yaz sezonunda yüksek kira getiriyor. Denize sıfır villalar aylık 20-35 bin TL, denize yakın daireler 15-25 bin TL arasında kira getiriyor.

Kış aylarında talep düşük. Çoğu yazlık boş kalıyor veya çok düşük kira ile kiraya veriliyor.

## Yatırım Stratejileri

Kira getirisi odaklı yatırım stratejileri:

**1. Oturumluk Odaklı:**
Yıl boyu stabil kira geliri. Düşük ama garantili getiri.

**2. Yazlık Odaklı:**
Yaz sezonunda yüksek kira. Yıl boyu gelir yok ama yaz aylarında yüksek getiri.

**3. Hibrit:**
Hem yazlık hem oturumluk kullanılabilir. En yüksek getiri potansiyeli.

## Sonuç

Karasu'da kira getirisi, konut tipine ve konuma göre değişiyor. Denize yakın bölgeler hem kira hem değer artışı açısından avantajlı. Yatırım yaparken hem kira gelirini hem de değer artışını birlikte değerlendirmek gerekiyor.`,
    meta_description: "Karasu'da kira getirisi yüksek bölgeler ve yatırım önerileri. Oturumluk ve yazlık konutların kira gelirleri, en karlı bölgeler.",
    keywords: ["karasu kira getirisi", "karasu yatırım", "karasu emlak", "karasu satılık daire"],
    category: "Yatırım Rehberi",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "Karasu Emlak Piyasası: 2025 Trendleri ve Gelecek Öngörüleri",
    slug: "karasu-emlak-piyasasi-2025-trendleri-ve-gelecek-ongoruleri",
    excerpt: "Karasu emlak piyasası 2025 trendleri ve gelecek öngörüleri. Fiyat artışları, talep trendleri ve yatırım fırsatları hakkında uzman analizi.",
    content: `# Karasu Emlak Piyasası: 2025 Trendleri ve Gelecek Öngörüleri

Karasu emlak piyasası, son yıllarda ciddi değişimler yaşadı. Hem fiyatlar hem talep arttı. Bu yazıda, 2025 yılı itibariyle Karasu emlak piyasası trendleri ve gelecek öngörüleri var.

## 2025 Piyasa Trendleri

Karasu emlak piyasasında 2025 yılında beklenen trendler:

**1. Fiyat Artışı:**
Fiyat artışı devam edecek ama hızı yavaşlayacak. %10-15 artış bekleniyor.

**2. Talep:**
Hem yazlık hem oturumluk talep yüksek kalacak. İstanbul'a yakınlık avantaj sağlıyor.

**3. Yatırım:**
Yatırımcı ilgisi devam edecek. Özellikle denize yakın bölgelerde yatırım artacak.

## Gelecek Öngörüleri

Karasu emlak piyasasının geleceği:

**Kısa Vade (1-2 yıl):**
Fiyat artışı devam edecek. Altyapı iyileştirmeleri fiyatları etkileyecek.

**Orta Vade (3-5 yıl):**
Altyapı iyileştirmeleri tamamlandıkça fiyatlar artacak. %20-30 artış potansiyeli.

**Uzun Vade (5-10 yıl):**
İstanbul'a yakınlık ve denize kıyısı nedeniyle değer artışı devam edecek. %50+ artış potansiyeli.

## Yatırım Fırsatları

Karasu'da yatırım fırsatları:

**1. Denize Yakın Konutlar:**
Hem kira hem değer artışı potansiyeli yüksek. Uzun vadede karlı yatırım.

**2. Merkez Daireler:**
Oturumluk için uygun, yıl boyu kira geliri. Stabil getiri.

**3. Yazlık Yatırım:**
Yaz sezonunda yüksek kira, uzun vadede değer artışı.

## Sonuç

Karasu emlak piyasası, hem yatırım hem yaşam açısından fırsatlar sunuyor. Denize kıyısı, İstanbul'a yakınlık ve uygun fiyatlar avantaj sağlıyor. Yatırım yaparken uzun vadeli düşünmek ve tüm faktörleri değerlendirmek gerekiyor.`,
    meta_description: "Karasu emlak piyasası 2025 trendleri ve gelecek öngörüleri. Fiyat artışları, talep trendleri ve yatırım fırsatları.",
    keywords: ["karasu emlak", "karasu satılık daire", "karasu yatırım", "karasu yazlık fiyatları"],
    category: "Piyasa Analizi",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "Karasu'da Yatırım Yapmak Mantıklı mı? 2025 Yatırım Analizi",
    slug: "karasuda-yatirim-yapmak-mantikli-mi-2025-yatirim-analizi",
    excerpt: "Karasu'da emlak yatırımı yapmak mantıklı mı? 2025 yatırım analizi, getiri potansiyeli, risk faktörleri ve yatırım önerileri.",
    content: `# Karasu'da Yatırım Yapmak Mantıklı mı? 2025 Yatırım Analizi

Karasu'da emlak yatırımı yapmak, son yıllarda popüler hale geldi. Hem yazlık hem oturumluk konutlar için yatırım fırsatları var. Bu yazıda, Karasu'da yatırım yapmanın mantıklı olup olmadığı analiz ediliyor.

## Yatırım Mantıklı mı?

Karasu'da emlak yatırımı yapmak, birkaç açıdan mantıklı:

**1. Denize Kıyısı:**
Denize kıyısı olan bölgeler her zaman değerli. Hem kira getirisi hem değer artışı potansiyeli yüksek.

**2. İstanbul'a Yakınlık:**
İstanbul'a 2 saat mesafe, hafta sonu kaçamakları için ideal. Talep yüksek kalacak.

**3. Uygun Fiyatlar:**
İstanbul veya Antalya'ya göre daha erişilebilir. Yatırım için daha düşük başlangıç maliyeti.

**4. Gelişen Altyapı:**
Son yıllarda altyapı iyileştirmeleri yapıldı. Gelecekte de gelişim devam edecek.

## Getiri Potansiyeli

Karasu'da yatırım getiri potansiyeli:

**Kira Getirisi:**
Yıllık kira geliri, konut fiyatının %5-8'i arasında. Bu oran makul seviyede.

**Değer Artışı:**
Son 3 yılda fiyatlar %40-50 arttı. Gelecekte de artış bekleniyor.

**Toplam Getiri:**
Hem kira hem değer artışı birlikte değerlendirildiğinde, toplam getiri yüksek.

## Risk Faktörleri

Yatırım yaparken dikkat edilmesi gereken riskler:

**1. Fiyat Artışı:**
Gelecekteki artış garantisi yok. Yatırım riski var.

**2. Talep Dalgalanmaları:**
Ekonomik duruma göre talep değişebilir. Piyasa riski.

**3. Likidite:**
Satışta zorluk yaşanabilir. Piyasa durumuna bağlı.

## Yatırım Önerileri

Karasu'da yatırım yaparken öneriler:

**1. Uzun Vadeli Düşünün:**
Emlak yatırımı kısa vadeli değil. 5-10 yıl sonra satış planı yapın.

**2. Konum Öncelikli:**
Denize yakınlık kritik. Mümkünse 500 metre içinde konut tercih edin.

**3. Hem Kira Hem Değer:**
Sadece kira gelirine değil, değer artışına da bakın.

## Sonuç

Karasu'da emlak yatırımı yapmak, özellikle denize yakın bölgelerde mantıklı. Hem kira getirisi hem değer artışı potansiyeli var. Ancak uzun vadeli düşünmek ve risk faktörlerini değerlendirmek gerekiyor.`,
    meta_description: "Karasu'da emlak yatırımı yapmak mantıklı mı? 2025 yatırım analizi, getiri potansiyeli ve risk faktörleri.",
    keywords: ["karasu yatırım", "karasu emlak", "karasu satılık daire", "karasu kira getirisi"],
    category: "Yatırım Rehberi",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "Karasu'da Ev Almak İçin En İyi Zaman: 2025 Piyasa Analizi",
    slug: "karasuda-ev-almak-icin-en-iyi-zaman-2025-piyasa-analizi",
    excerpt: "Karasu'da ev almak için en iyi zaman ne zaman? 2025 piyasa analizi, fiyat trendleri ve alım önerileri. Piyasa koşulları ve yatırım fırsatları.",
    content: `# Karasu'da Ev Almak İçin En İyi Zaman: 2025 Piyasa Analizi

Karasu'da ev almak için en iyi zaman, piyasa koşullarına bağlı. Fiyat trendleri, talep durumu ve yatırım fırsatları değişiyor. Bu yazıda, 2025 yılı itibariyle en iyi alım zamanı analiz ediliyor.

## Piyasa Koşulları

2025 yılı itibariyle Karasu emlak piyasası:

**Fiyat Trendleri:**
Fiyatlar artmaya devam ediyor ama hızı yavaşladı. %10-15 artış bekleniyor.

**Talep:**
Hem yazlık hem oturumluk talep yüksek. İstanbul'a yakınlık avantaj sağlıyor.

**Arz:**
Yeni yapılar piyasaya giriyor. Arz artışı fiyat artışını yavaşlatabilir.

## En İyi Alım Zamanı

Karasu'da ev almak için en iyi zaman:

**1. Kış Ayları:**
Kış aylarında talep düşük, fiyatlar daha uygun. Pazarlık şansı yüksek.

**2. Yeni Yapılar:**
Yeni yapılar piyasaya girdiğinde, erken alım avantajı var. Fiyatlar daha uygun.

**3. Uzun Vadeli:**
Uzun vadeli yatırım için her zaman uygun zaman. Fiyat artışı devam edecek.

## Alım Önerileri

Ev alırken öneriler:

**1. Piyasayı Takip Edin:**
Fiyat trendlerini takip edin. Uygun fırsatları kaçırmayın.

**2. Pazarlık Yapın:**
Özellikle kış aylarında pazarlık şansı yüksek. Fiyat indirimi isteyin.

**3. Uzun Vadeli Düşünün:**
Emlak yatırımı kısa vadeli değil. 5-10 yıl sonra satış planı yapın.

## Sonuç

Karasu'da ev almak için en iyi zaman, piyasa koşullarına bağlı. Kış ayları genellikle daha uygun. Ancak uzun vadeli yatırım için her zaman uygun zaman. Fiyat artışı devam edecek, erken alım avantaj sağlayacak.`,
    meta_description: "Karasu'da ev almak için en iyi zaman ne zaman? 2025 piyasa analizi, fiyat trendleri ve alım önerileri.",
    keywords: ["karasu satılık daire", "karasu emlak", "karasu yatırım", "karasu yazlık fiyatları"],
    category: "Emlak Rehberi",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "Karasu'da Satılık Villa Fiyatları ve Yatırım Potansiyeli",
    slug: "karasuda-satilik-villa-fiyatlari-ve-yatirim-potansiyeli",
    excerpt: "Karasu'da satılık villa fiyatları, yatırım potansiyeli ve bölge analizi. Denize sıfır villalar, fiyat trendleri ve yatırım önerileri.",
    content: `# Karasu'da Satılık Villa Fiyatları ve Yatırım Potansiyeli

Karasu'da satılık villalar, özellikle denize sıfır olanlar yüksek fiyatlı. Ancak yatırım potansiyeli de yüksek. Bu yazıda, villa fiyatları ve yatırım analizi var.

## Villa Fiyatları

Karasu'da satılık villa fiyatları:

**Denize Sıfır:**
3-5 milyon TL arasında. En yüksek fiyatlı seçenekler.

**Denize Yakın:**
2-3.5 milyon TL arasında. İyi fiyat/performans oranı.

**Merkez:**
1.5-2.5 milyon TL arasında. Daha uygun fiyatlı seçenekler.

## Yatırım Potansiyeli

Villaların yatırım potansiyeli:

**Kira Getirisi:**
Yaz sezonunda yüksek kira. Denize sıfır villalar aylık 20-35 bin TL kira getiriyor.

**Değer Artışı:**
Son 3 yılda villa fiyatları %50-60 arttı. Gelecekte de artış bekleniyor.

**Likidite:**
Villalar satışta daha zor buluyor. Piyasa daha dar.

## Yatırım Önerileri

Villa yatırımı için öneriler:

**1. Denize Yakın:**
En yüksek yatırım potansiyeli. Hem kira hem değer artışı yüksek.

**2. Uzun Vadeli:**
Villa yatırımı uzun vadeli. 5-10 yıl sonra satış planı yapın.

**3. Bakım:**
Villalar daha fazla bakım gerektiriyor. Bakım maliyetlerini hesaba katın.

## Sonuç

Karasu'da satılık villalar, yüksek fiyatlı ama yatırım potansiyeli yüksek. Denize yakın villalar hem kira hem değer artışı açısından avantajlı. Yatırım yaparken uzun vadeli düşünmek ve bakım maliyetlerini hesaba katmak gerekiyor.`,
    meta_description: "Karasu'da satılık villa fiyatları, yatırım potansiyeli ve bölge analizi. Denize sıfır villalar ve yatırım önerileri.",
    keywords: ["karasu satılık villa", "karasu emlak", "karasu yatırım", "karasu denize yakın daire"],
    category: "Emlak Rehberi",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "Karasu'da Kiralık Daire Fiyatları: 2025 Güncel Kira Analizi",
    slug: "karasuda-kiralik-daire-fiyatlari-2025-guncel-kira-analizi",
    excerpt: "Karasu'da kiralık daire fiyatları 2025 güncel analizi. Oturumluk ve yazlık kira fiyatları, bölge karşılaştırması ve kira trendleri.",
    content: `# Karasu'da Kiralık Daire Fiyatları: 2025 Güncel Kira Analizi

Karasu'da kiralık daire fiyatları, konut tipine ve konuma göre değişiyor. Oturumluk daireler yıl boyu kira geliri sağlarken, yazlık konutlar sadece yaz sezonunda yüksek kira getiriyor. Bu yazıda, 2025 yılı itibariyle güncel kira fiyatları var.

## Oturumluk Kira Fiyatları

Karasu'da oturumluk kiralık daire fiyatları:

**Merkez Bölgeler:**
- 2+1 daireler: Aylık 5-7 bin TL
- 3+1 daireler: Aylık 7-10 bin TL
- 4+1 daireler: Aylık 10-15 bin TL

**Denize Yakın:**
- 2+1 daireler: Aylık 6-8 bin TL
- 3+1 daireler: Aylık 8-12 bin TL
- 4+1 daireler: Aylık 12-18 bin TL

## Yazlık Kira Fiyatları

Yazlık kiralık daire fiyatları yaz sezonunda yüksek:

**Yaz Sezonu (Haziran-Eylül):**
- Denize sıfır: Aylık 20-35 bin TL
- Denize yakın: Aylık 15-25 bin TL
- Merkez: Aylık 8-15 bin TL

**Kış Sezonu:**
Kış aylarında talep düşük. Çoğu yazlık boş kalıyor.

## Kira Trendleri

Karasu'da kira fiyatları son yıllarda arttı. Oturumluk dairelerde %20-30, yazlıklarda %40-50 artış var. Gelecekte de artış bekleniyor.

## Sonuç

Karasu'da kiralık daire fiyatları, konut tipine ve konuma göre değişiyor. Denize yakın daireler daha yüksek kira getiriyor. Yazlık konutlar yaz sezonunda yüksek kira, kış aylarında düşük talep görüyor.`,
    meta_description: "Karasu'da kiralık daire fiyatları 2025 güncel analizi. Oturumluk ve yazlık kira fiyatları, bölge karşılaştırması.",
    keywords: ["karasu kiralık daire", "karasu kira fiyatları", "karasu emlak", "karasu kira getirisi"],
    category: "Emlak Rehberi",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "Karasu'da Yatırım Yapılacak En İyi Bölgeler: 2025 Rehberi",
    slug: "karasuda-yatirim-yapilacak-en-iyi-bolgeler-2025-rehberi",
    excerpt: "Karasu'da yatırım yapılacak en iyi bölgeler. Denize yakın konutlar, merkez bölgeler ve yatırım potansiyeli yüksek alanlar hakkında detaylı rehber.",
    content: `# Karasu'da Yatırım Yapılacak En İyi Bölgeler: 2025 Rehberi

Karasu'da emlak yatırımı yaparken bölge seçimi kritik. Hem kira getirisi hem değer artışı açısından avantajlı bölgeler var. Bu yazıda, yatırım yapılacak en iyi bölgeler analiz ediliyor.

## En İyi Yatırım Bölgeleri

Karasu'da yatırım yapılacak en iyi bölgeler:

**1. Denize Sıfır Bölgeler:**
En yüksek yatırım potansiyeli. Hem kira hem değer artışı yüksek.

**2. Denize Yakın (500m-1km):**
İyi fiyat/performans oranı. Hem kira hem değer artışı potansiyeli.

**3. Merkeze Yakın Denize Ulaşılabilir:**
Makul fiyatlar, iyi kira getirisi. Hem oturumluk hem yazlık.

## Bölge Karşılaştırması

Bölgelerin karşılaştırması:

**Denize Sıfır:**
- Fiyat: Yüksek (3-5 milyon TL)
- Kira: Yüksek (20-35 bin TL/yaz)
- Değer Artışı: Yüksek
- Risk: Düşük

**Denize Yakın:**
- Fiyat: Orta (1.5-3 milyon TL)
- Kira: İyi (15-25 bin TL/yaz)
- Değer Artışı: İyi
- Risk: Orta

**Merkez:**
- Fiyat: Düşük (800 bin - 1.5 milyon TL)
- Kira: Düşük (5-10 bin TL)
- Değer Artışı: Orta
- Risk: Orta

## Yatırım Önerileri

Bölge seçimi için öneriler:

**1. Uzun Vadeli Yatırım:**
Denize yakın bölgeler tercih edilmeli. Uzun vadede değer artışı yüksek.

**2. Kira Odaklı:**
Merkez bölgeler tercih edilmeli. Yıl boyu stabil kira geliri.

**3. Hibrit:**
Denize yakın merkez bölgeler tercih edilmeli. Hem kira hem değer artışı.

## Sonuç

Karasu'da yatırım yapılacak en iyi bölgeler, denize yakın alanlar. Hem kira getirisi hem değer artışı potansiyeli yüksek. Yatırım yaparken konum, fiyat ve yatırım stratejisini birlikte değerlendirmek gerekiyor.`,
    meta_description: "Karasu'da yatırım yapılacak en iyi bölgeler. Denize yakın konutlar, merkez bölgeler ve yatırım potansiyeli yüksek alanlar.",
    keywords: ["karasu yatırım", "karasu emlak", "karasu satılık daire", "karasu kira getirisi"],
    category: "Yatırım Rehberi",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "Karasu'da Satılık Arsa Fiyatları ve Yatırım Potansiyeli",
    slug: "karasuda-satilik-arsa-fiyatlari-ve-yatirim-potansiyeli",
    excerpt: "Karasu'da satılık arsa fiyatları, yatırım potansiyeli ve bölge analizi. Denize yakın arsalar, imar durumu ve yatırım önerileri.",
    content: `# Karasu'da Satılık Arsa Fiyatları ve Yatırım Potansiyeli

Karasu'da satılık arsa yatırımı, uzun vadeli yatırımcılar için fırsat sunuyor. Denize yakın arsalar özellikle değerli. Bu yazıda, arsa fiyatları ve yatırım analizi var.

## Arsa Fiyatları

Karasu'da satılık arsa fiyatları:

**Denize Yakın:**
500 bin - 1 milyon TL arasında. En yüksek fiyatlı seçenekler.

**Merkeze Yakın:**
300-600 bin TL arasında. Daha uygun fiyatlı seçenekler.

**Merkez Dışı:**
200-400 bin TL arasında. En uygun fiyatlı seçenekler.

## Yatırım Potansiyeli

Arsa yatırımının potansiyeli:

**Değer Artışı:**
Arsalar uzun vadede değer kazanıyor. İmar durumu değiştiğinde fiyatlar artıyor.

**İnşaat Potansiyeli:**
Gelecekte inşaat için kullanılabilir. Kendi evinizi yapabilirsiniz.

**Satış:**
Arsa satışı daha zor. Piyasa daha dar.

## Dikkat Edilmesi Gerekenler

Arsa alırken dikkat edilmesi gerekenler:

**1. İmar Durumu:**
İmar durumu kontrol edilmeli. İnşaat yapılabilir mi?

**2. Ulaşım:**
Ulaşım kolay mı? Yol var mı?

**3. Altyapı:**
Su, elektrik, kanalizasyon var mı?

## Sonuç

Karasu'da satılık arsa yatırımı, uzun vadeli yatırımcılar için uygun. Denize yakın arsalar özellikle değerli. Yatırım yaparken imar durumu, ulaşım ve altyapıyı kontrol etmek gerekiyor.`,
    meta_description: "Karasu'da satılık arsa fiyatları, yatırım potansiyeli ve bölge analizi. Denize yakın arsalar ve yatırım önerileri.",
    keywords: ["karasu satılık arsa", "karasu emlak", "karasu yatırım", "karasu arsa fiyatları"],
    category: "Yatırım Rehberi",
    author: "Karasu Emlak",
    status: "published",
  },
];

async function createBlogArticles() {
  console.log("🚀 Blog yazıları oluşturuluyor...\n");

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const article of BLOG_ARTICLES) {
    try {
      // Check if article already exists
      const { data: existing } = await supabase
        .from("articles")
        .select("id, title")
        .eq("slug", article.slug)
        .maybeSingle();

      if (existing) {
        // Update existing article
        const { error: updateError } = await supabase
          .from("articles")
          .update({
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            meta_description: article.meta_description,
            keywords: article.keywords,
            category: article.category,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`🔄 Güncellendi: ${article.title}`);
        updated++;
        continue;
      }

      // Create article
      const articleData: any = {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        meta_description: article.meta_description,
        keywords: article.keywords,
        author: article.author,
        status: article.status,
        category: article.category,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
      };

      const { data, error } = await supabase
        .from("articles")
        .insert(articleData)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      console.log(`✅ Oluşturuldu: ${article.title}`);
      console.log(`   📍 Slug: /blog/${article.slug}`);
      console.log(`   📂 Kategori: ${article.category}`);
      created++;
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      console.error(`❌ Hata (${article.title}):`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Özet:`);
  console.log(`   ✅ Oluşturulan: ${created}`);
  console.log(`   🔄 Güncellenen: ${updated}`);
  console.log(`   ⏭️  Atlanan: ${skipped}`);
  console.log(`   ❌ Hata: ${errors}`);
  console.log(`   📁 Toplam: ${BLOG_ARTICLES.length}\n`);

  if (created > 0 || updated > 0) {
    console.log("✨ Blog yazıları başarıyla işlendi!\n");
  }
}

// Run
createBlogArticles()
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
