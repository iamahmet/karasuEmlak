/**
 * Script to create pharmacy and health-related blog posts
 * Run with: pnpm tsx scripts/create-pharmacy-health-blog-posts.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from multiple possible locations
const envPaths = [
  resolve(__dirname, '../.env.local'),
  resolve(__dirname, '../../.env.local'),
  resolve(process.cwd(), '.env.local'),
];

for (const envPath of envPaths) {
  try {
    dotenv.config({ path: envPath });
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      break; // Found valid env file
    }
  } catch {
    // Continue to next path
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_description: string;
  keywords: string[];
  category: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    title: 'İlaç Kullanımında Dikkat Edilmesi Gerekenler: Güvenli İlaç Kullanım Rehberi',
    slug: 'ilac-kullaniminda-dikkat-edilmesi-gerekenler',
    excerpt: 'İlaç kullanırken dikkat edilmesi gereken önemli noktalar, yan etkiler, ilaç etkileşimleri ve güvenli kullanım hakkında kapsamlı rehber. Reçeteli ve reçetesiz ilaçların doğru kullanımı için bilmeniz gerekenler.',
    meta_description: 'İlaç kullanımında dikkat edilmesi gerekenler, yan etkiler, ilaç etkileşimleri ve güvenli kullanım rehberi. Reçeteli ve reçetesiz ilaçların doğru kullanımı hakkında detaylı bilgiler.',
    keywords: [
      'ilaç kullanımı',
      'güvenli ilaç kullanımı',
      'ilaç yan etkileri',
      'ilaç etkileşimleri',
      'reçeteli ilaçlar',
      'reçetesiz ilaçlar',
      'ilaç kullanım rehberi',
      'sağlık',
      'eczane',
      'karasu eczane',
    ],
    category: 'Sağlık',
    tags: ['sağlık', 'ilaç', 'eczane', 'rehber', 'güvenlik'],
    content: `<h2>İlaç Kullanımında Temel Prensipler</h2>
<p>İlaç kullanımı, sağlığımızı korumak ve hastalıkları tedavi etmek için kritik bir süreçtir. Ancak ilaçların yanlış kullanımı ciddi sağlık sorunlarına yol açabilir. Bu nedenle ilaç kullanırken mutlaka doktor veya eczacı tavsiyesine uymalı ve aşağıdaki temel prensipleri göz önünde bulundurmalısınız.</p>

<h3>1. Doktor ve Eczacı Tavsiyesine Uyun</h3>
<p>İlaç kullanımında en önemli kural, mutlaka doktor veya eczacı tavsiyesine uymaktır. Reçeteli ilaçları sadece reçetede belirtilen dozda ve sürede kullanmalı, reçetesiz ilaçları da eczacı danışmanlığı ile almalısınız. Karasu'daki eczaneler, ilaç kullanımı hakkında profesyonel danışmanlık hizmeti vermektedir.</p>

<h3>2. Dozaj Talimatlarına Dikkat Edin</h3>
<p>Her ilacın belirli bir dozajı ve kullanım süresi vardır. İlaç prospektüsünü mutlaka okuyun ve doktorunuzun belirttiği dozajı aşmayın. Fazla doz kullanımı ciddi yan etkilere yol açabilir.</p>

<h2>Reçeteli İlaçların Kullanımı</h2>
<p>Reçeteli ilaçlar, doktor kontrolünde kullanılması gereken ve sadece reçete ile temin edilebilen ilaçlardır. Bu ilaçların kullanımında özellikle dikkatli olunmalıdır.</p>

<h3>Reçeteli İlaç Kullanımında Dikkat Edilmesi Gerekenler:</h3>
<ul>
<li><strong>Reçeteyi Tam Olarak Takip Edin:</strong> Doktorunuzun belirttiği dozaj, kullanım sıklığı ve süreyi mutlaka takip edin.</li>
<li><strong>İlaçları Düzenli Kullanın:</strong> İlaçları belirtilen saatlerde düzenli olarak alın. Unutursanız, bir sonraki dozu ikiye katlamayın.</li>
<li><strong>Antibiyotik Kullanımı:</strong> Antibiyotikleri mutlaka doktorunuzun belirttiği süre boyunca kullanın. Erken bırakmak veya yanlış kullanmak direnç gelişimine yol açabilir.</li>
<li><strong>İlaç Etkileşimlerine Dikkat:</strong> Birden fazla ilaç kullanıyorsanız, ilaç etkileşimlerini mutlaka doktorunuza danışın.</li>
</ul>

<h2>Reçetesiz İlaçların Kullanımı</h2>
<p>Reçetesiz ilaçlar (OTC - Over The Counter), eczanelerden doğrudan alınabilen ilaçlardır. Ancak bu ilaçların da dikkatli kullanılması gerekir.</p>

<h3>Reçetesiz İlaç Kullanımında Dikkat Edilmesi Gerekenler:</h3>
<ul>
<li><strong>Eczacı Danışmanlığı Alın:</strong> Reçetesiz ilaç alırken mutlaka eczacınızdan danışmanlık alın.</li>
<li><strong>Prospektüsü Okuyun:</strong> İlaç prospektüsünü mutlaka okuyun ve yan etkileri öğrenin.</li>
<li><strong>Doğru Dozaj:</strong> Reçetesiz ilaçlarda da doğru dozajı kullanın. Fazla kullanım zararlı olabilir.</li>
<li><strong>Kronik Hastalıklar:</strong> Kronik bir hastalığınız varsa, reçetesiz ilaç kullanmadan önce mutlaka doktorunuza danışın.</li>
</ul>

<h2>İlaç Yan Etkileri</h2>
<p>Her ilacın potansiyel yan etkileri vardır. Yan etkiler hafif olabileceği gibi ciddi de olabilir. Yan etki yaşadığınızda mutlaka doktorunuza veya eczacınıza danışın.</p>

<h3>Yaygın İlaç Yan Etkileri:</h3>
<ul>
<li>Mide bulantısı ve kusma</li>
<li>Baş dönmesi</li>
<li>Uyku hali veya uykusuzluk</li>
<li>Cilt döküntüleri</li>
<li>İshal veya kabızlık</li>
</ul>

<h3>Ciddi Yan Etkiler (Acil Tıbbi Yardım Gerekir):</h3>
<ul>
<li>Nefes darlığı</li>
<li>Şiddetli alerjik reaksiyonlar</li>
<li>Göğüs ağrısı</li>
<li>Bilinç kaybı</li>
<li>Şiddetli karın ağrısı</li>
</ul>

<h2>İlaç Etkileşimleri</h2>
<p>Birden fazla ilaç kullanıldığında, ilaçlar birbirleriyle etkileşime girebilir. Bu etkileşimler ilaçların etkinliğini azaltabilir veya yan etkileri artırabilir.</p>

<h3>İlaç Etkileşimlerinden Kaçınmak İçin:</h3>
<ul>
<li><strong>Tüm İlaçlarınızı Listeyin:</strong> Kullandığınız tüm ilaçları (reçeteli, reçetesiz, vitaminler, bitkisel takviyeler) doktorunuza bildirin.</li>
<li><strong>Farklı Doktorlara Danışın:</strong> Farklı doktorlardan ilaç alıyorsanız, her birine diğer ilaçlarınızı mutlaka bildirin.</li>
<li><strong>Eczacıya Danışın:</strong> Karasu'daki eczaneler, ilaç etkileşimleri konusunda danışmanlık hizmeti vermektedir.</li>
</ul>

<h2>Özel Durumlar</h2>

<h3>Hamilelik ve Emzirme</h3>
<p>Hamilelik ve emzirme döneminde ilaç kullanımı özel dikkat gerektirir. Bu dönemde ilaç kullanmadan önce mutlaka doktorunuza danışın.</p>

<h3>Yaşlılık</h3>
<p>Yaşlı bireylerde ilaç metabolizması değişebilir. Bu nedenle dozaj ayarlamaları gerekebilir. Mutlaka doktor kontrolünde ilaç kullanın.</p>

<h3>Çocuklarda İlaç Kullanımı</h3>
<p>Çocuklarda ilaç kullanımı, yaş ve kiloya göre dozaj ayarlaması gerektirir. Çocuklar için özel formüle edilmiş ilaçları tercih edin ve mutlaka doktor tavsiyesine uyun.</p>

<h2>İlaç Saklama Koşulları</h2>
<p>İlaçların doğru saklanması, etkinliklerini korumak için çok önemlidir. İlaçları serin, kuru ve ışıktan uzak yerlerde saklayın. Buzdolabında saklanması gereken ilaçları mutlaka buzdolabında tutun.</p>

<h2>Sonuç</h2>
<p>İlaç kullanımı, sağlığımız için kritik bir konudur. Doğru kullanım, tedavinin başarısını artırırken, yanlış kullanım ciddi sağlık sorunlarına yol açabilir. İlaç kullanırken mutlaka doktor ve eczacı tavsiyesine uyun, prospektüsü okuyun ve yan etkileri takip edin. Karasu'daki eczaneler, ilaç kullanımı hakkında profesyonel danışmanlık hizmeti vermektedir.</p>

<p>Acil ilaç ihtiyacınız olduğunda, Karasu nöbetçi eczanelerinden yararlanabilirsiniz. Nöbetçi eczane bilgilerini Türk Eczacıları Birliği'nin <strong>444 0 332</strong> numaralı hattından öğrenebilirsiniz.</p>`,
  },
  {
    title: 'Acil Durumlarda İlaç Temini ve Nöbetçi Eczaneler: Karasu Rehberi',
    slug: 'acil-durumlarda-ilac-temini-ve-nobetci-eczaneler',
    excerpt: 'Acil ilaç ihtiyacı durumunda nöbetçi eczanelerden nasıl yararlanılacağı, Karasu nöbetçi eczane bilgileri, 7/24 hizmet veren eczaneler ve acil durumlarda dikkat edilmesi gerekenler hakkında kapsamlı rehber.',
    meta_description: 'Acil ilaç ihtiyacı durumunda nöbetçi eczanelerden nasıl yararlanılacağı, Karasu nöbetçi eczane bilgileri ve acil durumlarda dikkat edilmesi gerekenler hakkında detaylı rehber.',
    keywords: [
      'nöbetçi eczane',
      'acil ilaç temini',
      'karasu nöbetçi eczane',
      '7/24 eczane',
      'acil eczane',
      'nöbetçi eczane bilgileri',
      '444 0 332',
      'acil durum',
      'ilaç ihtiyacı',
      'karasu eczane',
    ],
    category: 'Sağlık',
    tags: ['nöbetçi eczane', 'acil durum', 'sağlık', 'karasu', 'eczane'],
    content: `<h2>Nöbetçi Eczane Sistemi Nedir?</h2>
<p>Nöbetçi eczane sistemi, Türkiye'de acil ilaç ihtiyacı olan vatandaşların 7/24 eczane hizmeti alabilmesi için oluşturulmuş bir sistemdir. Her gün farklı eczaneler nöbetçi olarak görevlendirilir ve gece, hafta sonu ve resmi tatillerde de hizmet verirler.</p>

<h2>Karasu Nöbetçi Eczane Sistemi</h2>
<p>Karasu'da nöbetçi eczane sistemi, Türk Eczacıları Birliği ve Sakarya Eczacılar Odası tarafından organize edilmektedir. Her gün farklı eczaneler nöbetçi olarak görevlendirilir ve 7/24 hizmet verirler. Bu sistem sayesinde acil ilaç ihtiyacı olan vatandaşlar her zaman bir eczaneye ulaşabilir.</p>

<h3>Nöbetçi Eczane Nasıl Öğrenilir?</h3>
<p>Karasu'da nöbetçi eczane bilgilerini öğrenmek için birkaç yöntem bulunmaktadır:</p>

<ul>
<li><strong>Telefon ile Öğrenme:</strong> Türk Eczacıları Birliği'nin <strong>444 0 332</strong> numaralı hattını arayarak güncel nöbetçi eczane bilgilerini öğrenebilirsiniz. Bu hat 7/24 hizmet vermektedir.</li>
<li><strong>Eczane Kapılarında:</strong> Karasu'daki eczanelerin kapılarında genellikle nöbetçi eczane listesi bulunmaktadır. Bu listeler günlük olarak güncellenmektedir.</li>
<li><strong>Eczacılar Odası:</strong> Sakarya Eczacılar Odası'ndan da nöbetçi eczane bilgilerini öğrenebilirsiniz.</li>
<li><strong>Online Kaynaklar:</strong> Bazı web siteleri ve mobil uygulamalar nöbetçi eczane bilgilerini paylaşmaktadır.</li>
</ul>

<h2>Acil İlaç İhtiyacı Durumunda Ne Yapmalı?</h2>
<p>Acil ilaç ihtiyacı durumunda öncelikle sakin olmalı ve aşağıdaki adımları takip etmelisiniz:</p>

<h3>1. Nöbetçi Eczaneyi Bulun</h3>
<p>Öncelikle nöbetçi eczaneyi bulmak için Türk Eczacıları Birliği'nin <strong>444 0 332</strong> numaralı hattını arayın veya eczane kapılarındaki listeleri kontrol edin.</p>

<h3>2. Telefon ile Kontrol Edin</h3>
<p>Nöbetçi eczaneyi bulduktan sonra, mutlaka telefon ile arayarak ilacın mevcut olup olmadığını kontrol edin. Özellikle gece saatlerinde veya uzak mesafelerde bu kontrol çok önemlidir.</p>

<h3>3. Reçetenizi Yanınıza Alın</h3>
<p>Reçeteli ilaçlar için mutlaka reçetenizi yanınızda bulundurun. Nöbetçi eczaneler, reçeteli ilaçları reçete olmadan veremezler.</p>

<h3>4. Eczaneye Ulaşın</h3>
<p>İlacın mevcut olduğunu doğruladıktan sonra, eczaneye ulaşın. Acil durumlarda yakınlarınızdan yardım alabilir veya taksi gibi ulaşım araçlarını kullanabilirsiniz.</p>

<h2>Nöbetçi Eczanelerin Özellikleri</h2>
<p>Nöbetçi eczaneler, normal eczanelerden farklı olarak 7/24 hizmet vermektedir. Ancak bazı özel durumlar olabilir:</p>

<ul>
<li><strong>Hizmet Saatleri:</strong> Nöbetçi eczaneler genellikle 7/24 hizmet verir, ancak bazı durumlarda belirli saatlerde kapalı olabilirler.</li>
<li><strong>İlaç Stoku:</strong> Nöbetçi eczaneler her ilacı bulundurmayabilir. Özellikle nadir ilaçlar için önceden kontrol etmek önemlidir.</li>
<li><strong>Fiyatlar:</strong> Nöbetçi eczanelerdeki ilaç fiyatları normal eczanelerle aynıdır. Ekstra ücret alınmaz.</li>
</ul>

<h2>Karasu'da Nöbetçi Eczane Bilgileri</h2>
<p>Karasu'da nöbetçi eczane bilgileri günlük olarak güncellenmektedir. Nöbetçi eczane listesi her gün değişir, bu nedenle güncel bilgi almak önemlidir.</p>

<h3>Nöbetçi Eczane Bilgilerini Öğrenme Yöntemleri:</h3>
<ul>
<li><strong>444 0 332:</strong> Türk Eczacıları Birliği'nin 7/24 hizmet veren hattı</li>
<li><strong>Eczane Kapıları:</strong> Eczanelerin kapılarında güncel nöbetçi eczane listesi</li>
<li><strong>Sakarya Eczacılar Odası:</strong> İlçe eczacılar odasından bilgi alabilirsiniz</li>
</ul>

<h2>Acil Durumlarda Dikkat Edilmesi Gerekenler</h2>

<h3>1. Sakin Olun</h3>
<p>Acil durumlarda öncelikle sakin olmalı ve panik yapmamalısınız. Sakin bir şekilde nöbetçi eczaneyi bulup ilacınızı temin edebilirsiniz.</p>

<h3>2. İlacın Mevcut Olduğunu Kontrol Edin</h3>
<p>Eczaneye gitmeden önce mutlaka telefon ile ilacın mevcut olup olmadığını kontrol edin. Özellikle gece saatlerinde bu kontrol çok önemlidir.</p>

<h3>3. Reçetenizi Unutmayın</h3>
<p>Reçeteli ilaçlar için mutlaka reçetenizi yanınızda bulundurun. Reçete olmadan reçeteli ilaç alınamaz.</p>

<h3>4. Alternatif Çözümler</h3>
<p>Eğer ilaç bulunamazsa, en yakın hastane acil servisine başvurabilir veya 112 acil servisi numarasını arayabilirsiniz. Özellikle hayati önem taşıyan ilaçlar için bu yöntemler kullanılabilir.</p>

<h2>Gece Saatlerinde İlaç Temini</h2>
<p>Gece saatlerinde ilaç ihtiyacı olduğunda, nöbetçi eczanelerden yararlanabilirsiniz. Ancak gece saatlerinde bazı özel durumlar olabilir:</p>

<ul>
<li><strong>Erişim:</strong> Gece saatlerinde ulaşım zor olabilir. Yakınlarınızdan yardım alabilir veya taksi kullanabilirsiniz.</li>
<li><strong>İlaç Stoku:</strong> Gece saatlerinde bazı ilaçlar stokta olmayabilir. Önceden telefon ile kontrol etmek önemlidir.</li>
<li><strong>Güvenlik:</strong> Gece saatlerinde eczaneye giderken güvenlik önlemlerini alın.</li>
</ul>

<h2>Hafta Sonu ve Resmi Tatillerde İlaç Temini</h2>
<p>Hafta sonu ve resmi tatillerde de nöbetçi eczaneler hizmet vermektedir. Bu dönemlerde normal eczaneler kapalı olduğu için nöbetçi eczanelerden yararlanabilirsiniz.</p>

<h2>Kronik Hastalıklar ve İlaç Temini</h2>
<p>Kronik hastalığı olan bireyler, ilaçlarını düzenli olarak kullanmalıdır. Acil durumlarda nöbetçi eczanelerden yararlanabilirler, ancak ilaçlarını önceden temin etmek daha iyi olacaktır.</p>

<h3>Kronik Hastalıklar İçin Öneriler:</h3>
<ul>
<li><strong>İlaç Stoku:</strong> Kronik ilaçlarınızı önceden temin edin ve yedek stok bulundurun.</li>
<li><strong>Düzenli Kontrol:</strong> İlaçlarınızın bitmeden önce yenilenmesini sağlayın.</li>
<li><strong>Doktor İletişimi:</strong> Acil durumlarda doktorunuzla iletişime geçin.</li>
</ul>

<h2>Sonuç</h2>
<p>Acil ilaç ihtiyacı durumunda nöbetçi eczanelerden yararlanabilirsiniz. Karasu'da 7/24 hizmet veren nöbetçi eczaneler, acil ilaç ihtiyaçlarınız için hazırdır. Nöbetçi eczane bilgilerini Türk Eczacıları Birliği'nin <strong>444 0 332</strong> numaralı hattından öğrenebilirsiniz.</p>

<p>İlaç kullanımında dikkat edilmesi gerekenler ve güvenli kullanım hakkında daha fazla bilgi için <a href="/blog/ilac-kullaniminda-dikkat-edilmesi-gerekenler">İlaç Kullanımında Dikkat Edilmesi Gerekenler</a> yazımızı okuyabilirsiniz.</p>`,
  },
  {
    title: 'İlaç Saklama Koşulları ve Son Kullanma Tarihleri: Güvenli İlaç Kullanımı',
    slug: 'ilac-saklama-kosullari-ve-son-kullanim-tarihleri',
    excerpt: 'İlaçların doğru saklama yöntemleri, son kullanma tarihlerinin önemi, güvenli kullanım ve ilaçların etkinliğini koruma yöntemleri hakkında kapsamlı rehber.',
    meta_description: 'İlaç saklama koşulları, son kullanma tarihleri ve güvenli ilaç kullanımı hakkında detaylı rehber. İlaçların etkinliğini koruma yöntemleri.',
    keywords: [
      'ilaç saklama',
      'ilaç saklama koşulları',
      'son kullanma tarihi',
      'ilaç güvenliği',
      'ilaç etkinliği',
      'ilaç koruma',
      'buzdolabında ilaç',
      'ilaç saklama sıcaklığı',
      'güvenli ilaç kullanımı',
      'sağlık',
    ],
    category: 'Sağlık',
    tags: ['ilaç saklama', 'güvenlik', 'sağlık', 'ilaç', 'rehber'],
    content: `<h2>İlaç Saklama Koşullarının Önemi</h2>
<p>İlaçların doğru saklanması, etkinliklerini korumak ve güvenli kullanım için çok önemlidir. Yanlış saklama koşulları, ilaçların etkinliğini azaltabilir, bozulmasına yol açabilir veya zararlı hale getirebilir. Bu nedenle ilaçları mutlaka prospektüsünde belirtilen koşullarda saklamalısınız.</p>

<h2>Genel İlaç Saklama Kuralları</h2>
<p>Çoğu ilaç için geçerli olan genel saklama kuralları şunlardır:</p>

<h3>1. Serin ve Kuru Yerlerde Saklayın</h3>
<p>İlaçları genellikle oda sıcaklığında (15-25°C), serin ve kuru yerlerde saklamalısınız. Nemli ortamlar ilaçların bozulmasına yol açabilir.</p>

<h3>2. Işıktan Uzak Tutun</h3>
<p>İlaçları doğrudan güneş ışığından ve parlak ışıktan uzak tutun. Işık, bazı ilaçların bozulmasına neden olabilir.</p>

<h3>3. Orijinal Ambalajında Saklayın</h3>
<p>İlaçları mutlaka orijinal ambalajında saklayın. Ambalaj, ilacı ışık, nem ve diğer dış etkenlerden korur. Ayrıca ilaç bilgilerini ve son kullanma tarihini içerir.</p>

<h3>4. Çocukların Ulaşamayacağı Yerlerde Saklayın</h3>
<p>İlaçları mutlaka çocukların ulaşamayacağı, kilitli dolaplarda veya yüksek yerlerde saklayın. Çocukların ilaçlara erişimi ciddi zehirlenmelere yol açabilir.</p>

<h2>Buzdolabında Saklanması Gereken İlaçlar</h2>
<p>Bazı ilaçlar buzdolabında (2-8°C) saklanması gereken ilaçlardır. Bu ilaçlar genellikle prospektüsünde "Buzdolabında saklayın" veya "2-8°C arasında saklayın" şeklinde belirtilir.</p>

<h3>Buzdolabında Saklanması Gereken İlaç Örnekleri:</h3>
<ul>
<li>Bazı antibiyotikler (süspansiyon formları)</li>
<li>İnsülin</li>
<li>Bazı aşılar</li>
<li>Bazı göz damlaları</li>
<li>Bazı biyolojik ilaçlar</li>
</ul>

<h3>Buzdolabında Saklama Kuralları:</h3>
<ul>
<li><strong>Donma Noktasından Uzak:</strong> İlaçları buzdolabının donma bölgesinden uzak tutun. Donma, ilaçların bozulmasına yol açabilir.</li>
<li><strong>Nem Kontrolü:</strong> Buzdolabında nem kontrolü yapın. Nemli ortamlar ilaçların bozulmasına neden olabilir.</li>
<li><strong>Orijinal Ambalaj:</strong> İlaçları orijinal ambalajında saklayın.</li>
</ul>

<h2>Oda Sıcaklığında Saklanması Gereken İlaçlar</h2>
<p>Çoğu ilaç oda sıcaklığında (15-25°C) saklanabilir. Bu ilaçlar için özel bir saklama koşulu yoksa, serin, kuru ve ışıktan uzak bir yerde saklanmalıdır.</p>

<h3>Oda Sıcaklığında Saklama Kuralları:</h3>
<ul>
<li><strong>Banyo ve Mutfaktan Uzak:</strong> Banyo ve mutfak gibi nemli ortamlar ilaçlar için uygun değildir.</li>
<li><strong>Doğrudan Güneş Işığından Uzak:</strong> Pencerelerin yanında veya doğrudan güneş ışığı alan yerlerde saklamayın.</li>
<li><strong>Isı Kaynaklarından Uzak:</strong> Radyatör, fırın gibi ısı kaynaklarından uzak tutun.</li>
</ul>

<h2>Son Kullanma Tarihlerinin Önemi</h2>
<p>Son kullanma tarihi, ilacın güvenli ve etkili bir şekilde kullanılabileceği son tarihtir. Son kullanma tarihi geçmiş ilaçları kesinlikle kullanmamalısınız.</p>

<h3>Son Kullanma Tarihi Geçmiş İlaçların Riskleri:</h3>
<ul>
<li><strong>Etkinlik Kaybı:</strong> Son kullanma tarihi geçmiş ilaçlar etkinliklerini kaybedebilir.</li>
<li><strong>Zararlı Olabilir:</strong> Bozulmuş ilaçlar zararlı olabilir ve yan etkilere yol açabilir.</li>
<li><strong>Güvenlik Riski:</strong> Son kullanma tarihi geçmiş ilaçlar güvenlik riski oluşturabilir.</li>
</ul>

<h3>Son Kullanma Tarihi Kontrolü:</h3>
<ul>
<li><strong>Düzenli Kontrol:</strong> İlaçlarınızın son kullanma tarihlerini düzenli olarak kontrol edin.</li>
<li><strong>Son Kullanma Tarihi Geçmiş İlaçları Atın:</strong> Son kullanma tarihi geçmiş ilaçları mutlaka atın ve eczaneye teslim edin.</li>
<li><strong>Yeni İlaç Alırken Kontrol Edin:</strong> Yeni ilaç alırken son kullanma tarihini mutlaka kontrol edin.</li>
</ul>

<h2>İlaç Saklama Yerleri</h2>
<p>İlaçları saklamak için uygun yerler:</p>

<h3>Uygun Saklama Yerleri:</h3>
<ul>
<li><strong>Kilitli İlaç Dolabı:</strong> Çocukların ulaşamayacağı, kilitli bir ilaç dolabı</li>
<li><strong>Yüksek Raflar:</strong> Çocukların ulaşamayacağı yüksek raflar</li>
<li><strong>Serin ve Kuru Oda:</strong> Oda sıcaklığında, serin ve kuru bir oda</li>
<li><strong>Buzdolabı (Gerekirse):</strong> Buzdolabında saklanması gereken ilaçlar için buzdolabı</li>
</ul>

<h3>Uygun Olmayan Saklama Yerleri:</h3>
<ul>
<li><strong>Banyo:</strong> Nemli ortamlar ilaçlar için uygun değildir</li>
<li><strong>Mutfak:</strong> Isı ve nem kaynakları ilaçları bozabilir</li>
<li><strong>Pencere Kenarı:</strong> Doğrudan güneş ışığı ilaçları bozabilir</li>
<li><strong>Araba:</strong> Sıcaklık değişimleri ilaçları bozabilir</li>
<li><strong>Çocukların Erişebileceği Yerler:</strong> Güvenlik riski oluşturur</li>
</ul>

<h2>İlaç Saklama Sıcaklıkları</h2>
<p>Farklı ilaç türleri için farklı saklama sıcaklıkları gerekebilir:</p>

<h3>Sıcaklık Kategorileri:</h3>
<ul>
<li><strong>Buzdolabı (2-8°C):</strong> Bazı antibiyotikler, insülin, aşılar</li>
<li><strong>Serin Yer (8-15°C):</strong> Bazı özel ilaçlar</li>
<li><strong>Oda Sıcaklığı (15-25°C):</strong> Çoğu ilaç</li>
<li><strong>30°C'den Yüksek:</strong> İlaçlar için uygun değildir</li>
</ul>

<h2>İlaç Ambalajlarının Korunması</h2>
<p>İlaç ambalajları, ilaçları korumak ve bilgi sağlamak için önemlidir:</p>

<h3>Ambalaj Koruma Kuralları:</h3>
<ul>
<li><strong>Orijinal Ambalajda Saklayın:</strong> İlaçları mutlaka orijinal ambalajında saklayın</li>
<li><strong>Ambalajı Bozmayın:</strong> Ambalajı açmayın veya bozmayın</li>
<li><strong>Etiketleri Koruyun:</strong> İlaç etiketlerini koruyun ve okunabilir tutun</li>
<li><strong>Prospektüsü Saklayın:</strong> İlaç prospektüsünü saklayın</li>
</ul>

<h2>İlaç Saklama ve Çocuk Güvenliği</h2>
<p>İlaçların çocukların ulaşamayacağı yerlerde saklanması çok önemlidir:</p>

<h3>Çocuk Güvenliği Kuralları:</h3>
<ul>
<li><strong>Kilitli Dolap:</strong> İlaçları kilitli bir dolapta saklayın</li>
<li><strong>Yüksek Yerler:</strong> Çocukların ulaşamayacağı yüksek yerlerde saklayın</li>
<li><strong>Çocuk Güvenli Kilitler:</strong> Dolaplarda çocuk güvenli kilitler kullanın</li>
<li><strong>Eğitim:</strong> Çocuklara ilaçların tehlikeli olduğunu öğretin</li>
<li><strong>Acil Durum:</strong> Zehirlenme durumunda 114 Zehir Danışma Hattını arayın</li>
</ul>

<h2>İlaç Saklama ve Yaşlı Bireyler</h2>
<p>Yaşlı bireyler için ilaç saklama özel dikkat gerektirir:</p>

<h3>Yaşlı Bireyler İçin Öneriler:</h3>
<ul>
<li><strong>Kolay Erişilebilir Yerler:</strong> İlaçları kolay erişilebilir ancak güvenli yerlerde saklayın</li>
<li><strong>Etiket Okunabilirliği:</strong> Büyük yazılı etiketler kullanın</li>
<li><strong>İlaç Organizatörü:</strong> İlaç organizatörü kullanarak ilaçları düzenleyin</li>
<li><strong>Hatırlatıcılar:</strong> İlaç alma saatleri için hatırlatıcılar kullanın</li>
</ul>

<h2>İlaç Atma ve Geri Dönüşüm</h2>
<p>Son kullanma tarihi geçmiş veya kullanılmayan ilaçları doğru şekilde atmalısınız:</p>

<h3>İlaç Atma Kuralları:</h3>
<ul>
<li><strong>Eczaneye Teslim:</strong> Son kullanma tarihi geçmiş ilaçları eczaneye teslim edin</li>
<li><strong>Çöpe Atmayın:</strong> İlaçları çöpe atmayın, çevre kirliliğine yol açabilir</li>
<li><strong>Kanalizasyona Atmayın:</strong> İlaçları kanalizasyona atmayın</li>
<li><strong>Geri Dönüşüm:</strong> Bazı eczaneler ilaç geri dönüşüm programları sunmaktadır</li>
</ul>

<h2>İlaç Saklama ve Seyahat</h2>
<p>Seyahat ederken ilaçları doğru şekilde saklamak önemlidir:</p>

<h3>Seyahat İçin Öneriler:</h3>
<ul>
<li><strong>Orijinal Ambalaj:</strong> İlaçları orijinal ambalajında taşıyın</li>
<li><strong>Reçete:</strong> Reçeteli ilaçlar için reçetenizi yanınıza alın</li>
<li><strong>Sıcaklık Kontrolü:</strong> Sıcak ortamlarda ilaçları koruyun</li>
<li><strong>El Çantası:</strong> İlaçları el çantanızda taşıyın, bagaja koymayın</li>
<li><strong>Yedek İlaç:</strong> Yedek ilaç bulundurun</li>
</ul>

<h2>Sonuç</h2>
<p>İlaçların doğru saklanması, etkinliklerini korumak ve güvenli kullanım için çok önemlidir. İlaçları mutlaka prospektüsünde belirtilen koşullarda saklayın, son kullanma tarihlerini kontrol edin ve çocukların ulaşamayacağı yerlerde saklayın. Karasu'daki eczaneler, ilaç saklama koşulları hakkında danışmanlık hizmeti vermektedir.</p>

<p>İlaç kullanımı hakkında daha fazla bilgi için <a href="/blog/ilac-kullaniminda-dikkat-edilmesi-gerekenler">İlaç Kullanımında Dikkat Edilmesi Gerekenler</a> yazımızı okuyabilirsiniz.</p>`,
  },
  {
    title: 'Reçeteli ve Reçetesiz İlaçlar Arasındaki Fark: Hangi İlaç Ne Zaman Kullanılır?',
    slug: 'receteli-ve-recetesiz-ilaclar-arasindaki-fark',
    excerpt: 'Reçeteli ve reçetesiz ilaçların farkları, kullanım alanları, güvenlik önlemleri ve hangi durumlarda hangi ilaç türünün kullanılacağı hakkında kapsamlı rehber.',
    meta_description: 'Reçeteli ve reçetesiz ilaçların farkları, kullanım alanları ve güvenlik önlemleri hakkında detaylı rehber. Hangi ilaç ne zaman kullanılır?',
    keywords: [
      'reçeteli ilaçlar',
      'reçetesiz ilaçlar',
      'OTC ilaçlar',
      'ilaç türleri',
      'ilaç kullanımı',
      'reçete',
      'eczane',
      'ilaç güvenliği',
      'sağlık',
      'ilaç rehberi',
    ],
    category: 'Sağlık',
    tags: ['reçeteli ilaç', 'reçetesiz ilaç', 'sağlık', 'eczane', 'rehber'],
    content: `<h2>Reçeteli ve Reçetesiz İlaçlar: Temel Farklar</h2>
<p>İlaçlar, reçeteli ve reçetesiz olmak üzere iki ana kategoriye ayrılır. Bu ayrım, ilaçların güvenlik profilleri, kullanım alanları ve erişim yöntemleri açısından önemlidir. Her iki ilaç türünün de kendine özgü özellikleri ve kullanım kuralları vardır.</p>

<h2>Reçeteli İlaçlar (Rx İlaçlar)</h2>
<p>Reçeteli ilaçlar, sadece doktor reçetesi ile alınabilen ve doktor kontrolünde kullanılması gereken ilaçlardır. Bu ilaçlar genellikle daha güçlü etkilere sahiptir ve yanlış kullanımda ciddi sağlık sorunlarına yol açabilir.</p>

<h3>Reçeteli İlaçların Özellikleri:</h3>
<ul>
<li><strong>Doktor Kontrolü Gerekir:</strong> Reçeteli ilaçlar mutlaka doktor kontrolünde kullanılmalıdır</li>
<li><strong>Reçete ile Alınır:</strong> Sadece doktor reçetesi ile eczanelerden alınabilir</li>
<li><strong>Güçlü Etkiler:</strong> Genellikle daha güçlü etkilere sahiptir</li>
<li><strong>Yan Etki Riski:</strong> Daha fazla yan etki riski taşır</li>
<li><strong>İlaç Etkileşimleri:</strong> Diğer ilaçlarla etkileşime girme riski yüksektir</li>
<li><strong>Doğru Dozaj Kritik:</strong> Doğru dozaj kullanımı çok önemlidir</li>
</ul>

<h3>Reçeteli İlaç Örnekleri:</h3>
<ul>
<li>Antibiyotikler</li>
<li>Antidepresanlar</li>
<li>Kan basıncı ilaçları</li>
<li>Kolesterol ilaçları</li>
<li>Ağrı kesiciler (güçlü olanlar)</li>
<li>Hormon ilaçları</li>
<li>Kanser ilaçları</li>
</ul>

<h3>Reçeteli İlaç Kullanımında Dikkat Edilmesi Gerekenler:</h3>
<ul>
<li><strong>Doktor Talimatlarına Uyun:</strong> Doktorunuzun belirttiği dozaj, kullanım sıklığı ve süreyi mutlaka takip edin</li>
<li><strong>Reçeteyi Tamamlayın:</strong> Antibiyotik gibi ilaçları mutlaka belirtilen süre boyunca kullanın</li>
<li><strong>Yan Etkileri Takip Edin:</strong> Yan etki yaşadığınızda mutlaka doktorunuza danışın</li>
<li><strong>İlaç Etkileşimlerine Dikkat:</strong> Birden fazla ilaç kullanıyorsanız, ilaç etkileşimlerini kontrol edin</li>
<li><strong>Reçeteyi Saklayın:</strong> Reçeteyi saklayın, gerekirse tekrar kullanabilirsiniz</li>
</ul>

<h2>Reçetesiz İlaçlar (OTC İlaçlar)</h2>
<p>Reçetesiz ilaçlar (Over The Counter - OTC), doktor reçetesi olmadan eczanelerden doğrudan alınabilen ilaçlardır. Bu ilaçlar genellikle hafif-orta şiddetteki semptomları tedavi etmek için kullanılır.</p>

<h3>Reçetesiz İlaçların Özellikleri:</h3>
<ul>
<li><strong>Reçete Gerekmez:</strong> Doktor reçetesi olmadan alınabilir</li>
<li><strong>Güvenli Profil:</strong> Genellikle daha güvenli bir profil taşır</li>
<li><strong>Hafif-Orta Etkiler:</strong> Hafif-orta şiddetteki semptomları tedavi eder</li>
<li><strong>Eczacı Danışmanlığı:</strong> Eczacı danışmanlığı alınması önerilir</li>
<li><strong>Prospektüs Okunmalı:</strong> İlaç prospektüsü mutlaka okunmalıdır</li>
<li><strong>Doğru Kullanım Önemli:</strong> Doğru kullanım hala önemlidir</li>
</ul>

<h3>Reçetesiz İlaç Örnekleri:</h3>
<ul>
<li>Ağrı kesiciler (parasetamol, ibuprofen)</li>
<li>Soğuk algınlığı ilaçları</li>
<li>Öksürük şurupları</li>
<li>Mide ilaçları (antiasitler)</li>
<li>Vitamin ve mineral takviyeleri</li>
<li>Cilt bakım ürünleri</li>
<li>Göz damlaları (bazıları)</li>
</ul>

<h3>Reçetesiz İlaç Kullanımında Dikkat Edilmesi Gerekenler:</h3>
<ul>
<li><strong>Eczacı Danışmanlığı Alın:</strong> Reçetesiz ilaç alırken mutlaka eczacınızdan danışmanlık alın</li>
<li><strong>Prospektüsü Okuyun:</strong> İlaç prospektüsünü mutlaka okuyun ve yan etkileri öğrenin</li>
<li><strong>Doğru Dozaj:</strong> Reçetesiz ilaçlarda da doğru dozajı kullanın</li>
<li><strong>Kronik Hastalıklar:</strong> Kronik bir hastalığınız varsa, reçetesiz ilaç kullanmadan önce doktorunuza danışın</li>
<li><strong>İlaç Etkileşimleri:</strong> Diğer ilaçlarla etkileşime girebileceğini unutmayın</li>
<li><strong>Uzun Süreli Kullanım:</strong> Uzun süreli kullanımda doktorunuza danışın</li>
</ul>

<h2>Reçeteli ve Reçetesiz İlaçlar Arasındaki Farklar</h2>

<h3>1. Erişim Yöntemi</h3>
<p><strong>Reçeteli İlaçlar:</strong> Sadece doktor reçetesi ile alınabilir</p>
<p><strong>Reçetesiz İlaçlar:</strong> Reçete olmadan doğrudan eczanelerden alınabilir</p>

<h3>2. Güvenlik Profili</h3>
<p><strong>Reçeteli İlaçlar:</strong> Daha güçlü etkilere sahiptir ve daha fazla yan etki riski taşır</p>
<p><strong>Reçetesiz İlaçlar:</strong> Genellikle daha güvenli bir profil taşır</p>

<h3>3. Kullanım Alanları</h3>
<p><strong>Reçeteli İlaçlar:</strong> Ciddi hastalıkların tedavisinde kullanılır</p>
<p><strong>Reçetesiz İlaçlar:</strong> Hafif-orta şiddetteki semptomları tedavi eder</p>

<h3>4. Doktor Kontrolü</h3>
<p><strong>Reçeteli İlaçlar:</strong> Mutlaka doktor kontrolünde kullanılmalıdır</p>
<p><strong>Reçetesiz İlaçlar:</strong> Eczacı danışmanlığı ile kullanılabilir</p>

<h3>5. Dozaj Kontrolü</h3>
<p><strong>Reçeteli İlaçlar:</strong> Doktor tarafından belirlenen dozaj kritiktir</p>
<p><strong>Reçetesiz İlaçlar:</strong> Prospektüste belirtilen dozaj kullanılır</p>

<h2>Hangi İlaç Ne Zaman Kullanılır?</h2>

<h3>Reçeteli İlaçlar Ne Zaman Kullanılır?</h3>
<p>Reçeteli ilaçlar genellikle şu durumlarda kullanılır:</p>
<ul>
<li>Ciddi enfeksiyonlar (antibiyotikler)</li>
<li>Kronik hastalıklar (diyabet, hipertansiyon)</li>
<li>Ruh sağlığı sorunları (depresyon, anksiyete)</li>
<li>Şiddetli ağrı</li>
<li>Kanser tedavisi</li>
<li>Hormon bozuklukları</li>
</ul>

<h3>Reçetesiz İlaçlar Ne Zaman Kullanılır?</h3>
<p>Reçetesiz ilaçlar genellikle şu durumlarda kullanılır:</p>
<ul>
<li>Hafif baş ağrısı</li>
<li>Soğuk algınlığı semptomları</li>
<li>Hafif mide rahatsızlıkları</li>
<li>Hafif ağrılar</li>
<li>Vitamin ve mineral eksiklikleri</li>
<li>Hafif cilt sorunları</li>
</ul>

<h2>Reçeteli ve Reçetesiz İlaçların Birlikte Kullanımı</h2>
<p>Reçeteli ve reçetesiz ilaçlar birlikte kullanılabilir, ancak dikkatli olunmalıdır:</p>

<h3>Birlikte Kullanımda Dikkat Edilmesi Gerekenler:</h3>
<ul>
<li><strong>Doktor ve Eczacıya Danışın:</strong> Reçeteli ve reçetesiz ilaçları birlikte kullanmadan önce mutlaka doktorunuza veya eczacınıza danışın</li>
<li><strong>İlaç Etkileşimlerini Kontrol Edin:</strong> İlaç etkileşimlerini mutlaka kontrol edin</li>
<li><strong>Doğru Dozaj:</strong> Her iki ilaç türünde de doğru dozajı kullanın</li>
<li><strong>Yan Etkileri Takip Edin:</strong> Yan etkileri mutlaka takip edin</li>
</ul>

<h2>Reçeteli İlaçlardan Reçetesiz İlaçlara Geçiş</h2>
<p>Bazı ilaçlar zamanla reçetesiz hale gelebilir. Bu genellikle ilacın güvenlik profili ve kullanım deneyimi ile ilgilidir.</p>

<h3>Reçetesiz Hale Geçen İlaç Örnekleri:</h3>
<ul>
<li>Bazı antihistaminikler</li>
<li>Bazı ağrı kesiciler</li>
<li>Bazı mide ilaçları</li>
</ul>

<h2>Reçeteli ve Reçetesiz İlaçların Maliyeti</h2>
<p>Reçeteli ve reçetesiz ilaçların maliyeti farklı olabilir:</p>

<h3>Maliyet Farkları:</h3>
<ul>
<li><strong>Reçeteli İlaçlar:</strong> Genellikle daha pahalıdır, ancak sigorta kapsamında olabilir</li>
<li><strong>Reçetesiz İlaçlar:</strong> Genellikle daha ucuzdur, ancak sigorta kapsamında olmayabilir</li>
</ul>

<h2>Karasu'da Reçeteli ve Reçetesiz İlaç Erişimi</h2>
<p>Karasu'daki eczaneler, hem reçeteli hem de reçetesiz ilaçlar için hizmet vermektedir:</p>

<h3>Reçeteli İlaçlar İçin:</h3>
<ul>
<li>Doktor reçetesi gereklidir</li>
<li>Eczaneler reçeteli ilaçları temin edebilir</li>
<li>Nöbetçi eczaneler de reçeteli ilaç hizmeti verir</li>
</ul>

<h3>Reçetesiz İlaçlar İçin:</h3>
<ul>
<li>Reçete gerekmez</li>
<li>Eczanelerden doğrudan alınabilir</li>
<li>Eczacı danışmanlığı alınması önerilir</li>
</ul>

<h2>Sonuç</h2>
<p>Reçeteli ve reçetesiz ilaçlar, farklı özelliklere ve kullanım alanlarına sahiptir. Her iki ilaç türünün de doğru kullanımı çok önemlidir. Reçeteli ilaçları mutlaka doktor kontrolünde kullanın, reçetesiz ilaçları da eczacı danışmanlığı ile alın. Karasu'daki eczaneler, hem reçeteli hem de reçetesiz ilaçlar için profesyonel danışmanlık hizmeti vermektedir.</p>

<p>İlaç kullanımı hakkında daha fazla bilgi için <a href="/blog/ilac-kullaniminda-dikkat-edilmesi-gerekenler">İlaç Kullanımında Dikkat Edilmesi Gerekenler</a> yazımızı okuyabilirsiniz.</p>`,
  },
];

async function insertArticle(article: BlogPost): Promise<boolean> {
  try {
    // Check if article already exists
    const { data: existing } = await supabase
      .from('articles')
      .select('id, title')
      .eq('slug', article.slug)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  Article "${article.title}" already exists, updating...`);
      
      // Update existing article
      const { data, error } = await supabase
        .from('articles')
        .update({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          meta_description: article.meta_description,
          keywords: article.keywords,
          category: article.category,
          tags: article.tags,
          status: 'published',
          updated_at: new Date().toISOString(),
        })
        .eq('slug', article.slug)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error updating article "${article.title}":`, error);
        return false;
      }

      console.log(`✅ Successfully updated article: "${article.title}" (${data.id})`);
      return true;
    }

    // Insert new article
    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        meta_description: article.meta_description,
        keywords: article.keywords,
        category: article.category,
        tags: article.tags,
        author: 'Karasu Emlak',
        status: 'published',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
        discover_eligible: true,
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error inserting article "${article.title}":`, error);
      return false;
    }

    console.log(`✅ Successfully inserted article: "${article.title}" (${data.id})`);
    return true;
  } catch (error) {
    console.error(`❌ Unexpected error for article "${article.title}":`, error);
    return false;
  }
}

async function createBlogPosts() {
  console.log('🚀 Starting pharmacy and health blog posts creation...\n');

  let successCount = 0;
  let failCount = 0;

  for (const article of blogPosts) {
    const success = await insertArticle(article);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created/updated: ${successCount} articles`);
  console.log(`❌ Failed: ${failCount} articles`);
  console.log(`📝 Total: ${blogPosts.length} articles\n`);

  if (failCount === 0) {
    console.log('🎉 All blog posts created successfully!');
  } else {
    console.log('⚠️  Some articles failed to create. Please check the errors above.');
  }
}

// Run the script
createBlogPosts()
  .then(() => {
    console.log('\n✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
