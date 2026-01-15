#!/usr/bin/env tsx

/**
 * Create Pharmacy Blog Articles Script
 * 
 * Bu script nöbetçi eczaneler sayfasındaki eksik blog yazılarını oluşturur:
 * - İlaç Kullanımında Dikkat Edilmesi Gerekenler
 * - Acil Durumlarda İlaç Temini ve Nöbetçi Eczaneler
 * - İlaç Saklama Koşulları ve Son Kullanma Tarihleri
 * - Reçeteli ve Reçetesiz İlaçlar Arasındaki Fark
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
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

const ARTICLES: BlogArticle[] = [
  {
    title: "İlaç Kullanımında Dikkat Edilmesi Gerekenler",
    slug: "ilac-kullaniminda-dikkat-edilmesi-gerekenler",
    excerpt: "İlaç kullanırken dikkat edilmesi gereken önemli noktalar, yan etkiler, ilaç etkileşimleri ve güvenli ilaç kullanımı hakkında kapsamlı rehber.",
    content: `# İlaç Kullanımında Dikkat Edilmesi Gerekenler

İlaç kullanımı, sağlığımızı korumak ve hastalıkları tedavi etmek için kritik bir öneme sahiptir. Ancak ilaçların doğru kullanılmaması durumunda ciddi sağlık sorunları ortaya çıkabilir. Bu rehber, Karasu'da yaşayan vatandaşlarımız için ilaç kullanımında dikkat edilmesi gereken tüm önemli noktaları kapsamaktadır.

## İlaç Kullanımında Temel Kurallar

### 1. Doktor ve Eczacı Tavsiyesine Uyun

İlaç kullanırken mutlaka doktor veya eczacı tavsiyesine uymalısınız. Reçeteli ilaçları sadece reçetede belirtilen dozda ve sürede kullanmalı, reçetesiz ilaçları da dikkatli kullanmalısınız. Her ilacın kendine özgü kullanım şekli ve dozajı vardır.

### 2. Doğru Dozaj ve Zamanlama

İlaçların doğru dozajda ve belirtilen zamanlarda alınması çok önemlidir. İlaçların etkisini kaybetmemesi için:
- İlaçları doktorunuzun belirttiği saatlerde alın
- Dozajı asla kendiniz belirlemeyin
- İlacı atladıysanız, bir sonraki dozu ikiye katlamayın
- İlaç kullanımını aniden kesmeyin

### 3. İlaç Etkileşimlerine Dikkat Edin

Farklı ilaçlar birbirleriyle etkileşime girebilir ve ciddi yan etkilere neden olabilir. Özellikle:
- Birden fazla ilaç kullanıyorsanız, doktorunuza ve eczacınıza mutlaka bildirin
- Reçetesiz ilaçlar da diğer ilaçlarla etkileşime girebilir
- Bitkisel takviyeler ve vitaminler de ilaç etkileşimine neden olabilir

## İlaç Yan Etkileri

### Yaygın Yan Etkiler

İlaçların bazı yan etkileri normal kabul edilirken, bazıları acil müdahale gerektirebilir:

**Normal Yan Etkiler:**
- Hafif baş dönmesi
- Uyku hali
- Mide bulantısı
- İshal veya kabızlık

**Acil Müdahale Gerektiren Yan Etkiler:**
- Şiddetli alerjik reaksiyonlar (nefes darlığı, döküntü, şişlik)
- Göğüs ağrısı
- Bilinç kaybı
- Şiddetli karın ağrısı
- Kanama

### Yan Etki Durumunda Ne Yapmalı?

Yan etki yaşadığınızda:
1. İlacı kullanmayı bırakın
2. Acil durumlarda 112'yi arayın
3. Doktorunuza veya eczacınıza danışın
4. Yan etkiyi mutlaka rapor edin

## Özel Durumlar

### Hamilelik ve Emzirme

Hamilelik ve emzirme döneminde ilaç kullanımı özel dikkat gerektirir:
- Hamilelikte ilaç kullanmadan önce mutlaka doktorunuza danışın
- Emzirme döneminde ilaçlar süte geçebilir
- Bazı ilaçlar bebek için zararlı olabilir

### Yaşlılık ve Kronik Hastalıklar

Yaşlı bireyler ve kronik hastalığı olanlar için:
- İlaç dozajları yaşa göre ayarlanmalıdır
- Böbrek ve karaciğer fonksiyonları ilaç metabolizmasını etkiler
- Birden fazla ilaç kullanımı daha dikkatli takip edilmelidir

### Çocuklarda İlaç Kullanımı

Çocuklarda ilaç kullanımı:
- Çocuklar için özel formülasyonlar kullanılmalıdır
- Dozaj çocuğun yaşına ve kilosuna göre hesaplanmalıdır
- Asla yetişkin ilacı çocuklara verilmemelidir

## İlaç Saklama ve Güvenlik

### Doğru Saklama Koşulları

İlaçların etkinliğini korumak için:
- Serin, kuru ve ışıktan uzak yerlerde saklayın
- Buzdolabında saklanması gereken ilaçları belirtilen sıcaklıkta tutun
- İlaçları orijinal ambalajlarında saklayın
- Son kullanma tarihlerini düzenli kontrol edin

### Güvenlik Önlemleri

- İlaçları çocukların ulaşamayacağı yerlerde saklayın
- İlaçları başkalarıyla paylaşmayın
- Son kullanma tarihi geçmiş ilaçları kullanmayın
- İlaçları tuvalete atmayın, eczaneye teslim edin

## Karasu'da İlaç Kullanımı İçin Öneriler

Karasu'da yaşayan vatandaşlarımız için:

1. **Güvenilir Eczanelerden Alışveriş Yapın**: Karasu'daki lisanslı eczanelerden ilaç alın
2. **Nöbetçi Eczaneleri Kullanın**: Acil durumlarda 444 0 332 numaralı hattı arayın
3. **Eczacı Danışmanlığı Alın**: İlaç kullanımı hakkında eczacınızdan bilgi alın
4. **Düzenli Kontroller**: Kronik hastalığınız varsa düzenli doktor kontrolüne gidin

## Sonuç

İlaç kullanımı ciddi bir konudur ve doğru bilgi ile yapılmalıdır. Karasu'da yaşayan vatandaşlarımız, ilaç kullanımında dikkatli olmalı ve her zaman sağlık profesyonellerinden destek almalıdır. Acil durumlarda nöbetçi eczanelerden yararlanabilir, günlük ilaç ihtiyaçlarınız için de güvenilir eczanelerimizi tercih edebilirsiniz.

Sağlıklı günler dileriz.`,
    meta_description: "İlaç kullanımında dikkat edilmesi gerekenler, yan etkiler, ilaç etkileşimleri ve güvenli ilaç kullanımı hakkında kapsamlı rehber. Karasu'da güvenli ilaç kullanımı için öneriler.",
    keywords: ["ilaç kullanımı", "ilaç yan etkileri", "ilaç etkileşimleri", "güvenli ilaç kullanımı", "karasu eczane", "ilaç dozajı"],
    category: "Sağlık",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "Acil Durumlarda İlaç Temini ve Nöbetçi Eczaneler",
    slug: "acil-durumlarda-ilac-temini-ve-nobetci-eczaneler",
    excerpt: "Acil ilaç ihtiyacı durumunda nöbetçi eczanelerden nasıl yararlanılacağı, Karasu nöbetçi eczane bilgileri ve dikkat edilmesi gerekenler.",
    content: `# Acil Durumlarda İlaç Temini ve Nöbetçi Eczaneler

Acil ilaç ihtiyacı, herkesin başına gelebilecek bir durumdur. Özellikle gece saatlerinde, hafta sonlarında veya resmi tatillerde normal eczaneler kapalı olduğunda, nöbetçi eczaneler hayati önem taşır. Bu rehber, Karasu'da acil ilaç ihtiyacı durumunda nöbetçi eczanelerden nasıl yararlanılacağını detaylı olarak açıklamaktadır.

## Nöbetçi Eczane Nedir?

Nöbetçi eczaneler, normal eczanelerin kapalı olduğu saatlerde ve günlerde 7/24 hizmet veren eczanelerdir. Türk Eczacıları Birliği ve Sakarya Eczacılar Odası tarafından organize edilen bu sistem, acil ilaç ihtiyacı olan vatandaşların her zaman bir eczaneye ulaşabilmesini sağlar.

## Karasu'da Nöbetçi Eczane Nasıl Öğrenilir?

### 1. Telefon ile Öğrenme

**Türk Eczacıları Birliği Acil Hat: 444 0 332**

Bu hat 7/24 hizmet vermektedir ve güncel nöbetçi eczane bilgilerini öğrenebilirsiniz. Ayrıca:
- Karasu Eczacılar Odası'nı arayabilirsiniz
- Eczanelerin kapılarında nöbetçi eczane listesi bulunur
- Eczaneler.gen.tr web sitesinden sorgulama yapabilirsiniz

### 2. Online Sorgulama

- **Eczaneler.gen.tr**: Türkiye genelinde nöbetçi eczane sorgulama
- **Mobil Uygulamalar**: Çeşitli sağlık uygulamalarından nöbetçi eczane bilgisi alabilirsiniz

### 3. Eczane Kapılarında

Karasu'daki eczanelerin kapılarında genellikle nöbetçi eczane listesi bulunmaktadır. Bu listeler günlük olarak güncellenir.

## Acil İlaç İhtiyacı Durumunda Ne Yapmalı?

### Adım Adım Rehber

1. **Önce Telefon ile Arayın**
   - Nöbetçi eczaneyi telefon ile arayarak ilacın mevcut olup olmadığını kontrol edin
   - Eczane adresini ve çalışma saatlerini öğrenin
   - İlacın fiyatını sorun (nöbetçi eczanelerde bazı ilaçlar normal fiyattan farklı olabilir)

2. **Reçetenizi Hazırlayın**
   - Reçeteli ilaçlar için mutlaka reçetenizi yanınızda bulundurun
   - Reçetenin geçerlilik süresini kontrol edin
   - Acil durumlarda doktorunuzdan telefon ile onay alabilirsiniz

3. **Eczaneye Gidin**
   - Eczane adresini not alın
   - Mümkünse bir yakınınızla gidin (özellikle gece saatlerinde)
   - Nakit para veya kredi kartı bulundurun

4. **İlaç Bulunamazsa**
   - En yakın hastane acil servisine başvurun
   - 112 acil servisi numarasını arayın
   - Doktorunuzla iletişime geçin

## Nöbetçi Eczane Saatleri

Nöbetçi eczaneler **7/24 hizmet** vermektedir:
- **Hafta içi**: Normal eczaneler kapandıktan sonra (genellikle 19:00'dan sonra)
- **Hafta sonu**: Cumartesi ve Pazar günleri
- **Resmi tatiller**: Tüm resmi tatillerde
- **Gece saatleri**: 24 saat boyunca

## Karasu'da Nöbetçi Eczane Sistemi

Karasu'da nöbetçi eczane sistemi şu şekilde çalışır:

1. **Dönüşümlü Sistem**: Her gün farklı eczaneler nöbetçi olarak görevlendirilir
2. **Organizasyon**: Türk Eczacıları Birliği ve Sakarya Eczacılar Odası tarafından organize edilir
3. **Günlük Güncelleme**: Nöbetçi eczane listesi her gün güncellenir
4. **Tüm Eczaneler Dahil**: Karasu'daki tüm eczaneler bu sisteme dahildir

## Önemli Notlar ve Uyarılar

### Dikkat Edilmesi Gerekenler

1. **Günlük Değişim**: Nöbetçi eczane bilgileri günlük olarak değişmektedir. Her gün kontrol edin.

2. **Telefon ile Kontrol**: Acil durumlarda önce telefon ile arayarak ilacın mevcut olup olmadığını kontrol edin.

3. **Reçete Gerekliliği**: Reçeteli ilaçlar için mutlaka reçetenizi yanınızda bulundurun.

4. **Fiyat Farkı**: Nöbetçi eczanelerde bazı ilaçlar normal fiyattan farklı olabilir. Fiyatı önceden sorun.

5. **Güvenlik**: Gece saatlerinde eczaneye giderken dikkatli olun, mümkünse bir yakınınızla gidin.

## Acil Durum Senaryoları

### Senaryo 1: Gece Saatlerinde İlaç İhtiyacı

- 444 0 332 numaralı hattı arayın
- Nöbetçi eczane bilgisini alın
- Eczaneyi telefon ile arayarak ilacın mevcut olup olmadığını kontrol edin
- Reçetenizi alarak eczaneye gidin

### Senaryo 2: Hafta Sonu İlaç İhtiyacı

- Nöbetçi eczane listesini kontrol edin
- Eczaneyi telefon ile arayın
- İlacın mevcut olup olmadığını öğrenin
- Eczaneye gidin

### Senaryo 3: Reçete Olmadan İlaç İhtiyacı

- Reçeteli ilaçlar için mutlaka reçete gerekir
- Acil durumlarda doktorunuzla iletişime geçin
- Bazı durumlarda eczacı geçici reçete yazabilir (sınırlı durumlar)

## Karasu'da Sağlık Hizmetleri

Karasu'da acil ilaç ihtiyacı durumunda:

- **Nöbetçi Eczaneler**: 7/24 hizmet
- **Hastaneler**: Acil servisler 7/24 açık
- **112 Acil Servis**: Acil durumlar için
- **Aile Hekimleri**: Acil durumlarda telefon ile ulaşılabilir

## Sonuç

Acil ilaç ihtiyacı durumunda nöbetçi eczaneler hayati önem taşır. Karasu'da yaşayan vatandaşlarımız, nöbetçi eczane bilgilerini öğrenmek için 444 0 332 numaralı hattı kullanabilir veya eczanelerin kapılarındaki listeleri kontrol edebilir. Acil durumlarda önce telefon ile arayarak ilacın mevcut olup olmadığını kontrol etmek, zaman ve emek tasarrufu sağlar.

Sağlıklı günler dileriz.`,
    meta_description: "Acil ilaç ihtiyacı durumunda nöbetçi eczanelerden nasıl yararlanılacağı, Karasu nöbetçi eczane bilgileri, 444 0 332 acil hat ve dikkat edilmesi gerekenler hakkında kapsamlı rehber.",
    keywords: ["nöbetçi eczane", "acil ilaç", "karasu nöbetçi eczane", "444 0 332", "acil eczane", "7/24 eczane"],
    category: "Sağlık",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "İlaç Saklama Koşulları ve Son Kullanma Tarihleri",
    slug: "ilac-saklama-kosullari-ve-son-kullanim-tarihleri",
    excerpt: "İlaçların doğru saklama yöntemleri, son kullanma tarihlerinin önemi, ilaç güvenliği ve çocuklar için önlemler hakkında detaylı bilgi.",
    content: `# İlaç Saklama Koşulları ve Son Kullanma Tarihleri

İlaçların doğru saklanması, etkinliklerini korumak ve güvenli kullanım için kritik öneme sahiptir. Yanlış saklama koşulları, ilaçların etkisini kaybetmesine, bozulmasına ve hatta zararlı hale gelmesine neden olabilir. Bu rehber, Karasu'da yaşayan vatandaşlarımız için ilaç saklama ve güvenlik konularında kapsamlı bilgi sunmaktadır.

## İlaç Saklama Koşulları

### Genel Saklama Kuralları

İlaçların çoğu için geçerli temel saklama kuralları:

1. **Serin ve Kuru Yerler**: İlaçları serin, kuru ve ışıktan uzak yerlerde saklayın
2. **Oda Sıcaklığı**: Çoğu ilaç 15-25°C arası sıcaklıkta saklanmalıdır
3. **Nemden Uzak**: Banyo ve mutfak gibi nemli yerlerden uzak tutun
4. **Orijinal Ambalaj**: İlaçları orijinal ambalajlarında saklayın
5. **Prospektüs**: İlaç prospektüsünü saklayın

### Özel Saklama Gereksinimleri

#### Buzdolabında Saklanması Gereken İlaçlar

Bazı ilaçlar buzdolabında (2-8°C) saklanmalıdır:
- **İnsülin**: Diyabet ilaçları
- **Bazı Antibiyotikler**: Sıvı formülasyonlar
- **Bazı Aşılar**: Özel saklama gerektiren aşılar
- **Bazı Göz Damlaları**: Açıldıktan sonra buzdolabında saklanmalı

**Dikkat**: Bu ilaçları asla dondurucuya koymayın!

#### Işıktan Korunması Gereken İlaçlar

Bazı ilaçlar ışığa karşı hassastır:
- Koyu renkli şişelerde saklanmalı
- Doğrudan güneş ışığından uzak tutulmalı
- Orijinal ambalajında saklanmalı

### Saklanmaması Gereken Yerler

İlaçları şu yerlerde saklamayın:
- ❌ Banyo dolapları (nemli)
- ❌ Mutfak dolapları (sıcak ve nemli)
- ❌ Araba içi (sıcaklık değişimleri)
- ❌ Dondurucu (buzdolabında saklanması gerekenler hariç)
- ❌ Doğrudan güneş ışığı alan yerler

## Son Kullanma Tarihleri

### Son Kullanma Tarihi Nedir?

Son kullanma tarihi, ilacın güvenli ve etkili kullanılabileceği son tarihtir. Bu tarihten sonra:
- İlacın etkinliği azalabilir
- İlaç bozulmuş olabilir
- Güvenlik riski oluşabilir

### Son Kullanma Tarihi Kontrolü

- İlaçları satın alırken son kullanma tarihini kontrol edin
- Düzenli olarak evdeki ilaçların tarihlerini kontrol edin
- Son kullanma tarihi geçmiş ilaçları kullanmayın
- Geçmiş ilaçları eczaneye teslim edin

### Son Kullanma Tarihi Geçmiş İlaçlar

Son kullanma tarihi geçmiş ilaçlar:
- **Kesinlikle kullanılmamalıdır**
- Eczaneye teslim edilmelidir
- Tuvalete atılmamalıdır (çevre kirliliği)
- Çöpe atılmamalıdır (güvenlik riski)

## İlaç Güvenliği

### Çocuklar İçin Güvenlik

İlaçlar çocuklar için ciddi risk oluşturabilir:

1. **Yüksek Yerlerde Saklayın**: İlaçları çocukların ulaşamayacağı yüksek dolaplarda saklayın
2. **Kilitli Dolaplar**: Mümkünse kilitli dolaplar kullanın
3. **Çocuk Kapağı**: Çocuk kapağı olan ilaçları tercih edin
4. **Eğitim**: Çocuklara ilaçların oyuncak olmadığını öğretin
5. **Acil Durum**: Çocuk ilaç yuttuysa hemen 112'yi arayın

### Yaşlılar İçin Güvenlik

Yaşlı bireyler için:
- İlaçları düzenli olarak kontrol edin
- Son kullanma tarihlerini takip edin
- İlaç kutusu kullanarak dozajı takip edin
- Doktor ve eczacı ile düzenli iletişim kurun

## İlaç Saklama İpuçları

### Organizasyon

1. **İlaç Kutusu Kullanın**: Haftalık ilaç kutuları kullanarak dozajı takip edin
2. **Liste Tutun**: Kullandığınız ilaçların listesini tutun
3. **Düzenli Temizlik**: İlaç dolabını düzenli olarak temizleyin
4. **Etiketleme**: İlaçları etiketleyerek karışıklığı önleyin

### Seyahat Sırasında

Seyahat ederken:
- İlaçları orijinal ambalajlarında taşıyın
- Reçetelerinizi yanınızda bulundurun
- Uçak yolculuğunda el bagajında taşıyın
- Sıcaklık değişimlerinden koruyun

## Karasu'da İlaç Güvenliği

Karasu'da yaşayan vatandaşlarımız için:

1. **Güvenilir Eczaneler**: Lisanslı eczanelerden ilaç alın
2. **Eczacı Danışmanlığı**: İlaç saklama hakkında eczacınızdan bilgi alın
3. **Düzenli Kontrol**: Evdeki ilaçları düzenli kontrol edin
4. **Geri Dönüşüm**: Geçmiş ilaçları eczaneye teslim edin

## İlaç Atık Yönetimi

### Geçmiş İlaçların Bertarafı

Geçmiş veya kullanılmayan ilaçlar:
- **Eczaneye Teslim Edin**: Eczaneler ilaç geri dönüşümü yapmaktadır
- **Tuvalete Atmayın**: Çevre kirliliğine neden olur
- **Çöpe Atmayın**: Güvenlik riski oluşturur
- **Özel Toplama Noktaları**: Belediyelerin ilaç toplama noktalarını kullanın

## Özel Durumlar

### Kronik Hastalıklar

Kronik hastalığı olanlar için:
- İlaç stoku tutun (1-2 aylık)
- Düzenli olarak son kullanma tarihlerini kontrol edin
- Acil durumlar için yedek ilaç bulundurun
- Doktor ile düzenli iletişim kurun

### Mevsimsel İlaçlar

Mevsimsel kullanılan ilaçlar (alerji, grip vb.):
- Mevsim sonunda kontrol edin
- Son kullanma tarihlerini not edin
- Bir sonraki mevsimde kullanılacaksa uygun koşullarda saklayın

## Sonuç

İlaç saklama ve güvenlik, sağlığımız için kritik öneme sahiptir. Karasu'da yaşayan vatandaşlarımız, ilaçlarını doğru koşullarda saklamalı, son kullanma tarihlerini düzenli kontrol etmeli ve güvenlik önlemlerini almalıdır. Geçmiş ilaçları eczaneye teslim ederek hem kendi güvenliğinizi hem de çevrenin korunmasını sağlayabilirsiniz.

Sağlıklı günler dileriz.`,
    meta_description: "İlaç saklama koşulları, son kullanma tarihleri, ilaç güvenliği, çocuklar için önlemler ve ilaç atık yönetimi hakkında kapsamlı rehber. Karasu'da güvenli ilaç saklama için öneriler.",
    keywords: ["ilaç saklama", "son kullanma tarihi", "ilaç güvenliği", "ilaç saklama koşulları", "ilaç atık yönetimi", "karasu eczane"],
    category: "Sağlık",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "Reçeteli ve Reçetesiz İlaçlar Arasındaki Fark",
    slug: "receteli-ve-recetesiz-ilaclar-arasindaki-fark",
    excerpt: "Reçeteli ve reçetesiz ilaçların farkları, kullanım alanları, güvenlik önlemleri ve doğru ilaç seçimi hakkında detaylı bilgi.",
    content: `# Reçeteli ve Reçetesiz İlaçlar Arasındaki Fark

İlaçlar, reçeteli ve reçetesiz olmak üzere iki ana kategoriye ayrılır. Bu ayrım, ilaçların güvenlik profili, kullanım alanları ve satış koşulları açısından önemlidir. Bu rehber, Karasu'da yaşayan vatandaşlarımız için reçeteli ve reçetesiz ilaçlar arasındaki farkları ve doğru kullanım yöntemlerini açıklamaktadır.

## Reçeteli İlaçlar

### Reçeteli İlaç Nedir?

Reçeteli ilaçlar, sadece doktor reçetesi ile eczanelerden alınabilen ilaçlardır. Bu ilaçlar:
- Güçlü etkili ilaçlardır
- Yan etki riski yüksektir
- Doktor kontrolü gerektirir
- Özel saklama koşulları gerekebilir

### Reçeteli İlaçların Özellikleri

1. **Güçlü Etki**: Hastalıkların tedavisinde etkili sonuçlar verir
2. **Yan Etki Riski**: Ciddi yan etkilere neden olabilir
3. **Doktor Kontrolü**: Mutlaka doktor kontrolünde kullanılmalıdır
4. **Doğru Dozaj**: Dozaj doktor tarafından belirlenir
5. **Takip Gerekliliği**: Düzenli doktor kontrolü gerekir

### Reçeteli İlaç Örnekleri

- **Antibiyotikler**: Bakteriyel enfeksiyonlar için
- **Tansiyon İlaçları**: Yüksek tansiyon tedavisi
- **Antidepresanlar**: Depresyon tedavisi
- **Ağrı Kesiciler**: Güçlü ağrı kesiciler
- **Hormon İlaçları**: Hormonal bozukluklar için

### Reçeteli İlaç Kullanımında Dikkat Edilmesi Gerekenler

1. **Reçeteye Uyun**: Reçetede belirtilen dozaj ve süreye uyun
2. **Doktor Kontrolü**: Düzenli doktor kontrolüne gidin
3. **Yan Etki Takibi**: Yan etkileri doktorunuza bildirin
4. **İlaç Etkileşimleri**: Diğer ilaçlarla etkileşime dikkat edin
5. **Aniden Kesmeyin**: İlacı doktor tavsiyesi olmadan kesmeyin

## Reçetesiz İlaçlar

### Reçetesiz İlaç Nedir?

Reçetesiz ilaçlar (OTC - Over The Counter), doktor reçetesi olmadan eczanelerden alınabilen ilaçlardır. Bu ilaçlar:
- Genellikle hafif-orta şiddetli semptomlar için kullanılır
- Güvenlik profili yüksektir
- Eczacı danışmanlığı alınabilir
- Kısa süreli kullanım için uygundur

### Reçetesiz İlaçların Özellikleri

1. **Güvenli Kullanım**: Genellikle güvenli kabul edilir
2. **Kolay Erişim**: Reçete olmadan alınabilir
3. **Eczacı Danışmanlığı**: Eczacıdan bilgi alınabilir
4. **Kısa Süreli**: Genellikle kısa süreli kullanım için
5. **Hafif Semptomlar**: Hafif-orta şiddetli semptomlar için

### Reçetesiz İlaç Örnekleri

- **Ağrı Kesiciler**: Parasetamol, ibuprofen
- **Soğuk Algınlığı İlaçları**: Burun tıkanıklığı, öksürük
- **Mide İlaçları**: Antiasitler, mide koruyucular
- **Vitaminler**: Vitamin ve mineral takviyeleri
- **Cilt Bakım İlaçları**: Kremler, merhemler

### Reçetesiz İlaç Kullanımında Dikkat Edilmesi Gerekenler

1. **Prospektüs Okuyun**: İlaç prospektüsünü mutlaka okuyun
2. **Eczacıya Danışın**: Kullanım hakkında eczacıdan bilgi alın
3. **Dozaj**: Önerilen dozajı aşmayın
4. **Süre**: Uzun süreli kullanmayın
5. **Yan Etkiler**: Yan etkileri takip edin

## Reçeteli vs Reçetesiz: Temel Farklar

### Güvenlik

| Özellik | Reçeteli İlaçlar | Reçetesiz İlaçlar |
|---------|-------------------|-------------------|
| Güvenlik Profili | Daha dikkatli kullanım gerekir | Genellikle daha güvenli |
| Yan Etki Riski | Yüksek | Düşük-Orta |
| Doktor Kontrolü | Zorunlu | Önerilir |
| Eczacı Danışmanlığı | Önemli | Önemli |

### Kullanım Alanları

| Durum | Reçeteli İlaç | Reçetesiz İlaç |
|-------|---------------|----------------|
| Ciddi Hastalıklar | ✅ | ❌ |
| Kronik Hastalıklar | ✅ | ❌ |
| Hafif Semptomlar | ❌ | ✅ |
| Kısa Süreli Kullanım | ✅ | ✅ |

### Satış Koşulları

| Özellik | Reçeteli İlaçlar | Reçetesiz İlaçlar |
|---------|-------------------|-------------------|
| Reçete Gerekliliği | Zorunlu | Gerekmez |
| Eczane | Sadece eczanelerden | Eczanelerden |
| Doktor Onayı | Zorunlu | Gerekmez |
| Eczacı Danışmanlığı | Önemli | Önerilir |

## Doğru İlaç Seçimi

### Ne Zaman Reçeteli İlaç?

Reçeteli ilaç gerektiren durumlar:
- Ciddi hastalıklar
- Kronik hastalıklar
- Bakteriyel enfeksiyonlar
- Yüksek riskli durumlar
- Doktor teşhisi gerektiren durumlar

### Ne Zaman Reçetesiz İlaç?

Reçetesiz ilaç kullanılabilecek durumlar:
- Hafif ağrılar
- Soğuk algınlığı semptomları
- Mide rahatsızlıkları
- Hafif alerji semptomları
- Kısa süreli kullanım gereken durumlar

## Karasu'da İlaç Kullanımı

Karasu'da yaşayan vatandaşlarımız için öneriler:

1. **Doktor Kontrolü**: Ciddi semptomlar için mutlaka doktora gidin
2. **Eczacı Danışmanlığı**: Reçetesiz ilaç kullanmadan önce eczacıya danışın
3. **Güvenilir Eczaneler**: Lisanslı eczanelerden ilaç alın
4. **Bilgilendirme**: İlaç kullanımı hakkında bilgi alın
5. **Takip**: İlaç kullanımını takip edin

## Yaygın Hatalar

### Reçeteli İlaçlarda

- ❌ Reçete olmadan kullanmak
- ❌ Dozajı kendiniz belirlemek
- ❌ İlacı aniden kesmek
- ❌ Başkalarıyla paylaşmak
- ❌ Doktor kontrolüne gitmemek

### Reçetesiz İlaçlarda

- ❌ Uzun süreli kullanmak
- ❌ Dozajı aşmak
- ❌ Prospektüs okumamak
- ❌ Eczacıya danışmamak
- ❌ Ciddi semptomlarda doktora gitmemek

## Sonuç

Reçeteli ve reçetesiz ilaçlar arasındaki farkları anlamak, doğru ilaç kullanımı için kritik öneme sahiptir. Karasu'da yaşayan vatandaşlarımız, ciddi semptomlar için mutlaka doktora başvurmalı, reçetesiz ilaç kullanırken de eczacı danışmanlığı almalıdır. Her iki ilaç türünde de doğru kullanım ve güvenlik önlemleri hayati önem taşır.

Sağlıklı günler dileriz.`,
    meta_description: "Reçeteli ve reçetesiz ilaçların farkları, kullanım alanları, güvenlik önlemleri, doğru ilaç seçimi ve yaygın hatalar hakkında kapsamlı rehber.",
    keywords: ["reçeteli ilaç", "reçetesiz ilaç", "ilaç kullanımı", "ilaç güvenliği", "eczane", "karasu"],
    category: "Sağlık",
    author: "Karasu Emlak",
    status: "published",
  },
];

async function createBlogArticles() {
  console.log("🚀 Blog yazıları oluşturuluyor...\n");

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const article of ARTICLES) {
    try {
      // Check if article already exists
      const { data: existing } = await supabase
        .from("articles")
        .select("id, title")
        .eq("slug", article.slug)
        .maybeSingle();

      if (existing) {
        console.log(`⏭️  Atlanan: ${article.title} (zaten mevcut)`);
        skipped++;
        continue;
      }

      // Find or create category
      let categorySlug = article.category.toLowerCase().replace(/\s+/g, "-");
      const { data: category } = await supabase
        .from("categories")
        .select("id, slug")
        .eq("name", article.category)
        .maybeSingle();

      if (!category) {
        // Create category if doesn't exist
        const { data: newCategory } = await supabase
          .from("categories")
          .insert({
            name: article.category,
            slug: categorySlug,
            description: `${article.category} kategorisi`,
          })
          .select("id, slug")
          .single();

        if (newCategory) {
          categorySlug = newCategory.slug;
        }
      } else {
        categorySlug = category.slug;
      }

      // Create article - try with category_id first, fallback to category field
      const articleData: any = {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        meta_description: article.meta_description,
        keywords: article.keywords,
        author: article.author,
        status: article.status,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
      };

      // Try to add category - check what field exists
      if (category) {
        articleData.category_id = category.id;
      }
      articleData.category = article.category;

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
    } catch (error: any) {
      console.error(`❌ Hata (${article.title}):`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Özet:`);
  console.log(`   ✅ Oluşturulan: ${created}`);
  console.log(`   ⏭️  Atlanan: ${skipped}`);
  console.log(`   ❌ Hata: ${errors}`);
  console.log(`   📁 Toplam: ${ARTICLES.length}\n`);

  if (created > 0) {
    console.log("✨ Blog yazıları başarıyla oluşturuldu!\n");
  }
}

// Run the script
createBlogArticles()
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
