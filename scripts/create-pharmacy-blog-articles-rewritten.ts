#!/usr/bin/env tsx

/**
 * Create Pharmacy Blog Articles Script (Rewritten - Natural, Expert Style)
 * 
 * Bu script nöbetçi eczaneler sayfasındaki eksik blog yazılarını oluşturur.
 * Yazılar medikal alanda uzman SEO içerik full stack geliştirici tarafından yazılmış gibi doğal ve profesyonel.
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
    excerpt: "İlaç kullanımında dikkat edilmesi gereken kritik noktalar, yan etki yönetimi ve güvenli ilaç kullanım pratikleri hakkında uzman görüşleri.",
    content: `# İlaç Kullanımında Dikkat Edilmesi Gerekenler

İlaç kullanımı, modern tıbbın en önemli araçlarından biri. Ancak ilaçların etkili olabilmesi için doğru kullanılması şart. Karasu'da yaşayan vatandaşlarımızın ilaç kullanımında dikkat etmesi gereken temel prensipleri bu yazıda ele alıyoruz.

## Doktor ve Eczacı Tavsiyesinin Önemi

İlaç kullanımında en kritik nokta, mutlaka doktor veya eczacı tavsiyesine uymaktır. Reçeteli ilaçlar sadece reçetede belirtilen dozda ve sürede kullanılmalıdır. Her ilacın kendine özgü farmakokinetik özellikleri vardır ve bu özellikler dozajın belirlenmesinde kritik rol oynar.

Reçetesiz ilaçlar bile dikkatli kullanılmalıdır. Eczacılar, ilaç etkileşimleri ve yan etkiler konusunda en güncel bilgilere sahiptir. Karasu'daki eczanelerimizde çalışan eczacılar, ilaç kullanımı hakkında danışmanlık hizmeti vermektedir.

## Dozaj ve Zamanlama Kritik Öneme Sahip

İlaçların farmakolojik etkisi, dozaj ve zamanlamaya bağlıdır. Doktorunuzun belirttiği saatlerde ilaç almak, ilacın kan plazma konsantrasyonunu optimal seviyede tutar. İlacı atladıysanız, bir sonraki dozu ikiye katlamak ciddi yan etkilere yol açabilir.

İlaç kullanımını aniden kesmek de tehlikelidir. Özellikle antidepresanlar, kortikosteroidler ve bazı kardiyovasküler ilaçlar, yavaş yavaş azaltılarak bırakılmalıdır. Bu tür ilaçların aniden kesilmesi, rebound etkisi veya withdrawal sendromuna neden olabilir.

## İlaç Etkileşimleri ve Risk Yönetimi

Farklı ilaçlar birbirleriyle etkileşime girebilir. Bu etkileşimler farmakokinetik (ilaç emilimi, dağılımı, metabolizması, atılımı) veya farmakodinamik (ilaçların hedef reseptörler üzerindeki etkileri) düzeyde gerçekleşebilir.

Örneğin, warfarin gibi antikoagülan ilaçlar, birçok ilaçla etkileşime girer. Bu nedenle birden fazla ilaç kullanıyorsanız, mutlaka doktorunuza ve eczacınıza bildirmelisiniz. Bitkisel takviyeler ve vitaminler de ilaç etkileşimine neden olabilir. St. John's Wort gibi bitkisel takviyeler, birçok ilacın metabolizmasını etkileyebilir.

## Yan Etki Yönetimi

İlaçların yan etkileri, farmakolojik etkilerinin bir parçasıdır. Bazı yan etkiler normal kabul edilirken, bazıları acil müdahale gerektirir. Hafif baş dönmesi, uyku hali, mide bulantısı gibi yan etkiler genellikle geçicidir ve ilaca adaptasyon sürecinde görülebilir.

Ancak şiddetli alerjik reaksiyonlar (anafilaksi), nefes darlığı, göğüs ağrısı, bilinç kaybı veya şiddetli kanama gibi durumlar acil müdahale gerektirir. Bu durumlarda 112 acil servisi aranmalı ve ilaç kullanımı derhal durdurulmalıdır.

Yan etki yaşadığınızda, bunu mutlaka doktorunuza veya eczacınıza bildirmelisiniz. Yan etki raporlama sistemi, ilaç güvenliği açısından kritik öneme sahiptir.

## Özel Popülasyonlarda İlaç Kullanımı

Hamilelik ve emzirme döneminde ilaç kullanımı özel dikkat gerektirir. FDA'nın gebelik kategorileri (A, B, C, D, X), ilaçların gebelikte kullanım güvenliğini değerlendirir. Hamilelikte ilaç kullanmadan önce mutlaka doktorunuza danışmalısınız.

Emzirme döneminde ilaçlar süte geçebilir. Bu nedenle emziren anneler, ilaç kullanımı konusunda dikkatli olmalıdır. Bazı ilaçlar bebek için zararlı olabilir veya süt üretimini etkileyebilir.

Yaşlı bireylerde ilaç metabolizması değişir. Böbrek ve karaciğer fonksiyonları yaşla birlikte azalır, bu da ilaçların vücuttan atılımını etkiler. Yaşlılarda ilaç dozajları genellikle düşürülür ve birden fazla ilaç kullanımı daha dikkatli takip edilir.

Çocuklarda ilaç kullanımı, yaş ve kiloya göre hesaplanır. Çocuklar için özel formülasyonlar kullanılmalı ve asla yetişkin ilacı çocuklara verilmemelidir. Pediatrik dozaj hesaplamaları, vücut yüzey alanı veya vücut ağırlığına göre yapılır.

## İlaç Saklama ve Güvenlik Protokolleri

İlaçların etkinliğini korumak için doğru saklama koşulları kritiktir. Çoğu ilaç, oda sıcaklığında (15-25°C), serin, kuru ve ışıktan uzak yerlerde saklanmalıdır. Buzdolabında saklanması gereken ilaçlar (insülin, bazı antibiyotikler) için özel dikkat gösterilmelidir.

İlaçlar orijinal ambalajlarında saklanmalıdır. Ambalaj, ilacın korunması ve doğru kullanımı için önemlidir. Son kullanma tarihleri düzenli olarak kontrol edilmeli ve geçmiş ilaçlar kullanılmamalıdır.

Güvenlik açısından, ilaçlar çocukların ulaşamayacağı yüksek dolaplarda saklanmalıdır. Çocuk kapağı olan ilaçlar tercih edilmeli ve ilaçlar asla başkalarıyla paylaşılmamalıdır. İlaç zehirlenmeleri, çocuklarda ciddi sağlık sorunlarına yol açabilir.

## Karasu'da İlaç Kullanımı ve Eczane Hizmetleri

Karasu'daki lisanslı eczanelerimiz, sadece ilaç satışı yapmakla kalmaz, aynı zamanda sağlık danışmanlığı hizmeti de verir. Eczacılar, ilaç kullanımı, yan etkiler ve ilaç etkileşimleri konusunda güncel bilgilere sahiptir.

Acil durumlarda nöbetçi eczanelerden yararlanabilirsiniz. Türk Eczacıları Birliği'nin 444 0 332 numaralı hattı, 7/24 nöbetçi eczane bilgisi vermektedir. Kronik hastalığınız varsa, düzenli doktor kontrolüne gitmek ve ilaç kullanımını takip etmek önemlidir.`,
    meta_description: "İlaç kullanımında dikkat edilmesi gereken kritik noktalar, yan etki yönetimi, ilaç etkileşimleri ve güvenli ilaç kullanım pratikleri. Karasu eczane hizmetleri ve uzman görüşleri.",
    keywords: ["ilaç kullanımı", "ilaç yan etkileri", "ilaç etkileşimleri", "güvenli ilaç kullanımı", "karasu eczane", "farmakoloji"],
    category: "Sağlık",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "Acil Durumlarda İlaç Temini ve Nöbetçi Eczaneler",
    slug: "acil-durumlarda-ilac-temini-ve-nobetci-eczaneler",
    excerpt: "Acil ilaç ihtiyacı durumunda nöbetçi eczanelerden nasıl yararlanılacağı, Karasu nöbetçi eczane sistemi ve acil durum protokolleri hakkında detaylı bilgi.",
    content: `# Acil Durumlarda İlaç Temini ve Nöbetçi Eczaneler

Acil ilaç ihtiyacı, özellikle gece saatlerinde, hafta sonlarında veya resmi tatillerde ortaya çıkabilir. Bu durumlarda nöbetçi eczaneler, vatandaşların ilaç ihtiyacını karşılamak için 7/24 hizmet verir. Karasu'da nöbetçi eczane sistemi, Türk Eczacıları Birliği ve Sakarya Eczacılar Odası tarafından organize edilmektedir.

## Nöbetçi Eczane Sisteminin İşleyişi

Nöbetçi eczane sistemi, dönüşümlü bir yapıda çalışır. Her gün farklı eczaneler nöbetçi olarak görevlendirilir ve 7/24 hizmet verir. Bu sistem, acil ilaç ihtiyacı olan vatandaşların her zaman bir eczaneye ulaşabilmesini sağlar.

Karasu'daki tüm eczaneler bu sisteme dahildir. Nöbetçi eczane listesi günlük olarak güncellenir ve eczanelerin kapılarında, eczacılar odası web sitesinde ve 444 0 332 numaralı hattan öğrenilebilir.

## Nöbetçi Eczane Bilgisi Nasıl Öğrenilir?

Türk Eczacıları Birliği'nin 444 0 332 numaralı hattı, 7/24 hizmet vermektedir. Bu hat üzerinden güncel nöbetçi eczane bilgilerini öğrenebilirsiniz. Ayrıca Karasu Eczacılar Odası'ndan da bilgi alabilirsiniz.

Eczanelerin kapılarında genellikle nöbetçi eczane listesi bulunmaktadır. Bu listeler günlük olarak güncellenir. Online olarak eczaneler.gen.tr web sitesinden de sorgulama yapabilirsiniz.

## Acil İlaç İhtiyacı Protokolü

Acil ilaç ihtiyacı durumunda öncelikle nöbetçi eczaneyi telefon ile arayarak ilacın mevcut olup olmadığını kontrol etmelisiniz. Bu, zaman ve emek tasarrufu sağlar. Eczane adresini, çalışma saatlerini ve ilacın fiyatını öğrenin.

Reçeteli ilaçlar için mutlaka reçetenizi yanınızda bulundurmalısınız. Reçetenin geçerlilik süresini kontrol edin. Acil durumlarda doktorunuzdan telefon ile onay alabilirsiniz, ancak bu durumlar sınırlıdır.

Eczaneye giderken mümkünse bir yakınınızla gidin, özellikle gece saatlerinde. Nakit para veya kredi kartı bulundurun. Nöbetçi eczanelerde bazı ilaçlar normal fiyattan farklı olabilir, bu nedenle fiyatı önceden sorun.

## İlaç Bulunamazsa Ne Yapılmalı?

Eğer nöbetçi eczanede ilaç bulunamazsa, en yakın hastane acil servisine başvurabilirsiniz. Hastanelerin acil servisleri, acil ilaç ihtiyacı durumunda ilaç verebilir. 112 acil servisi numarasını da arayabilirsiniz.

Doktorunuzla iletişime geçerek alternatif çözümler bulabilirsiniz. Bazı durumlarda benzer etkili alternatif ilaçlar önerilebilir.

## Nöbetçi Eczane Saatleri ve Kapsamı

Nöbetçi eczaneler 7/24 hizmet vermektedir. Hafta içi normal eczaneler kapandıktan sonra (genellikle 19:00'dan sonra), hafta sonu ve resmi tatillerde nöbetçi eczaneler devreye girer.

Gece saatlerinde de nöbetçi eczane bulunmaktadır. Bu, özellikle kronik hastalığı olan ve düzenli ilaç kullanması gereken vatandaşlar için kritik öneme sahiptir.

## Karasu'da Nöbetçi Eczane Sistemi

Karasu'da nöbetçi eczane sistemi, Sakarya Eczacılar Odası tarafından koordine edilmektedir. Sistem, adil bir dönüşüm prensibiyle çalışır. Her eczane, belirli aralıklarla nöbetçi görevi yapar.

Nöbetçi eczane listesi her gün güncellenir. Bu güncellemeler, eczanelerin kapılarında, eczacılar odası web sitesinde ve 444 0 332 numaralı hattan öğrenilebilir. Sistem, vatandaşların en güncel bilgilere ulaşmasını sağlar.

## Özel Durumlar ve Dikkat Edilmesi Gerekenler

Nöbetçi eczane bilgileri günlük olarak değişmektedir. Bu nedenle her gün kontrol etmek önemlidir. Acil durumlarda önce telefon ile arayarak ilacın mevcut olup olmadığını kontrol edin.

Reçeteli ilaçlar için mutlaka reçetenizi yanınızda bulundurun. Reçete olmadan reçeteli ilaç alınamaz. Bazı durumlarda eczacı geçici reçete yazabilir, ancak bu sınırlı durumlar için geçerlidir.

Gece saatlerinde eczaneye giderken güvenlik önlemleri alın. Mümkünse bir yakınınızla gidin ve iyi aydınlatılmış yolları tercih edin.

## Karasu'da Sağlık Hizmetleri ve Acil Durumlar

Karasu'da acil ilaç ihtiyacı durumunda nöbetçi eczanelerin yanı sıra hastanelerin acil servisleri de hizmet vermektedir. Acil servisler 7/24 açıktır ve acil ilaç ihtiyacı durumunda ilaç verebilir.

112 acil servisi, hayati tehlike durumlarında aranmalıdır. Acil ilaç ihtiyacı, hayati tehlike oluşturuyorsa 112'yi arayın. Aile hekimleri de acil durumlarda telefon ile ulaşılabilir.`,
    meta_description: "Acil ilaç ihtiyacı durumunda nöbetçi eczanelerden nasıl yararlanılacağı, Karasu nöbetçi eczane sistemi, 444 0 332 acil hat ve acil durum protokolleri hakkında detaylı rehber.",
    keywords: ["nöbetçi eczane", "acil ilaç", "karasu nöbetçi eczane", "444 0 332", "acil eczane", "7/24 eczane"],
    category: "Sağlık",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "İlaç Saklama Koşulları ve Son Kullanma Tarihleri",
    slug: "ilac-saklama-kosullari-ve-son-kullanim-tarihleri",
    excerpt: "İlaçların doğru saklama yöntemleri, son kullanma tarihlerinin önemi, farmasötik stabilite ve ilaç güvenliği hakkında teknik bilgiler.",
    content: `# İlaç Saklama Koşulları ve Son Kullanma Tarihleri

İlaçların farmasötik stabilitesi, saklama koşullarına bağlıdır. Yanlış saklama, ilaçların etkinliğini kaybetmesine, bozulmasına ve hatta zararlı hale gelmesine neden olabilir. Bu yazıda, ilaç saklama koşulları ve son kullanma tarihlerinin farmakolojik önemi ele alınmaktadır.

## Farmasötik Stabilite ve Saklama Koşulları

İlaçların farmasötik stabilitesi, sıcaklık, nem, ışık ve oksijen gibi çevresel faktörlerden etkilenir. Çoğu ilaç, oda sıcaklığında (15-25°C) saklanmalıdır. Bu sıcaklık aralığı, ilaçların kimyasal yapısını ve farmakolojik etkinliğini korur.

Nem, ilaçların stabilitesini etkileyen önemli bir faktördür. Yüksek nem, tabletlerin bozulmasına, kapsüllerin yapışmasına ve toz ilaçların topaklanmasına neden olabilir. Bu nedenle ilaçlar, banyo ve mutfak gibi nemli yerlerden uzak tutulmalıdır.

Işık, özellikle UV ışınları, birçok ilacın bozulmasına neden olur. Fotolabil ilaçlar, koyu renkli şişelerde saklanmalı ve doğrudan güneş ışığından uzak tutulmalıdır. Nitrogliserin gibi ilaçlar, ışığa karşı özellikle hassastır.

## Özel Saklama Gereksinimleri

Bazı ilaçlar, buzdolabında (2-8°C) saklanmalıdır. Bu ilaçlar arasında insülin, bazı antibiyotikler (özellikle sıvı formülasyonlar) ve bazı aşılar bulunur. Bu ilaçların dondurucuya konulmaması kritiktir. Dondurma, ilaçların yapısını bozarak etkinliğini kaybettirir.

Buzdolabında saklanması gereken ilaçlar, buzdolabının ana bölümünde saklanmalıdır. Kapı rafları, sıcaklık değişimlerine daha açıktır ve bu nedenle uygun değildir.

Açıldıktan sonra buzdolabında saklanması gereken ilaçlar da vardır. Örneğin, bazı göz damlaları açıldıktan sonra buzdolabında saklanmalıdır. Bu bilgi, ilaç prospektüsünde belirtilir.

## Son Kullanma Tarihlerinin Farmakolojik Önemi

Son kullanma tarihi, ilacın güvenli ve etkili kullanılabileceği son tarihtir. Bu tarih, farmasötik stabilite testleri sonucunda belirlenir. Son kullanma tarihi geçmiş ilaçlar, etkinliğini kaybetmiş olabilir veya bozulmuş olabilir.

İlaçların bozulması, kimyasal degradasyona neden olur. Bu degradasyon, ilacın etkin maddesinin azalmasına veya toksik metabolitlerin oluşmasına yol açabilir. Bu nedenle son kullanma tarihi geçmiş ilaçlar kesinlikle kullanılmamalıdır.

Son kullanma tarihleri, ilaçların orijinal ambalajında belirtilir. İlaçları orijinal ambalajlarında saklamak, bu tarihleri takip etmek için önemlidir.

## İlaç Güvenliği ve Çocuk Koruması

İlaçlar, çocuklar için ciddi risk oluşturabilir. İlaç zehirlenmeleri, çocuklarda en sık görülen zehirlenme türlerinden biridir. Bu nedenle ilaçlar, çocukların ulaşamayacağı yüksek dolaplarda saklanmalıdır.

Kilitli dolaplar, çocuk koruması için en güvenli yöntemdir. Çocuk kapağı olan ilaçlar tercih edilmeli, ancak bu kapakların da %100 güvenli olmadığı unutulmamalıdır.

Çocuklara ilaçların oyuncak olmadığı öğretilmelidir. Eğer bir çocuk ilaç yuttuysa, derhal 112 acil servisi aranmalıdır. Zaman kaybetmeden müdahale edilmesi kritiktir.

## Yaşlılarda İlaç Yönetimi

Yaşlı bireylerde ilaç yönetimi, özel dikkat gerektirir. Yaşlılarda çoklu ilaç kullanımı (polifarmasi) yaygındır ve bu durum ilaç etkileşimleri riskini artırır.

Haftalık ilaç kutuları, yaşlılarda ilaç kullanımını takip etmek için faydalıdır. Bu kutular, dozaj hatasını önler ve ilaç kullanımını düzenler.

Yaşlılarda ilaç listesi tutmak önemlidir. Bu liste, doktor ve eczacı ile paylaşılmalıdır. İlaç etkileşimleri, yaşlılarda ciddi sağlık sorunlarına yol açabilir.

## Seyahat ve İlaç Taşıma

Seyahat ederken ilaçlar, orijinal ambalajlarında taşınmalıdır. Bu, gümrük kontrolünde sorun yaşanmasını önler. Reçeteler de yanınızda bulundurulmalıdır.

Uçak yolculuğunda ilaçlar, el bagajında taşınmalıdır. Bagaj kompartımanındaki sıcaklık değişimleri, ilaçların bozulmasına neden olabilir.

Sıcaklık değişimlerinden korunmak için, ilaçlar termal çantada taşınabilir. Özellikle buzdolabında saklanması gereken ilaçlar için bu kritiktir.

## İlaç Atık Yönetimi ve Çevre

Geçmiş veya kullanılmayan ilaçlar, çevre kirliliğine neden olabilir. İlaçlar tuvalete atılmamalı veya çöpe atılmamalıdır. İlaçlar, su kaynaklarına karışarak çevre kirliliğine yol açabilir.

Geçmiş ilaçlar, eczanelerde toplanmaktadır. Eczaneler, ilaç geri dönüşümü yapmaktadır. Belediyelerin ilaç toplama noktaları da kullanılabilir.

İlaç atık yönetimi, hem çevre hem de güvenlik açısından önemlidir. Geçmiş ilaçlar, yanlışlıkla kullanılabilir veya başkaları tarafından bulunabilir.

## Kronik Hastalıklar ve İlaç Stoku

Kronik hastalığı olanlar için ilaç stoku tutmak önemlidir. 1-2 aylık ilaç stoku, acil durumlar için yeterlidir. Ancak stok tutarken son kullanma tarihlerini düzenli kontrol etmek gerekir.

Acil durumlar için yedek ilaç bulundurmak, özellikle kronik hastalığı olanlar için kritiktir. Doğal afetler veya acil durumlar, ilaç teminini zorlaştırabilir.

Doktor ile düzenli iletişim kurmak, ilaç yönetimi için önemlidir. İlaç kullanımı, düzenli olarak gözden geçirilmeli ve gerekirse ayarlanmalıdır.

## Karasu'da İlaç Güvenliği

Karasu'daki lisanslı eczaneler, ilaç saklama konusunda danışmanlık hizmeti vermektedir. Eczacılar, ilaç saklama koşulları hakkında güncel bilgilere sahiptir.

Evdeki ilaçları düzenli kontrol etmek, güvenlik açısından önemlidir. Son kullanma tarihleri geçmiş ilaçlar, eczaneye teslim edilmelidir.`,
    meta_description: "İlaç saklama koşulları, farmasötik stabilite, son kullanma tarihlerinin farmakolojik önemi, ilaç güvenliği ve çocuk koruması hakkında teknik bilgiler.",
    keywords: ["ilaç saklama", "son kullanma tarihi", "farmasötik stabilite", "ilaç güvenliği", "ilaç atık yönetimi", "karasu eczane"],
    category: "Sağlık",
    author: "Karasu Emlak",
    status: "published",
  },
  {
    title: "Reçeteli ve Reçetesiz İlaçlar Arasındaki Fark",
    slug: "receteli-ve-recetesiz-ilaclar-arasindaki-fark",
    excerpt: "Reçeteli ve reçetesiz ilaçların farmakolojik farkları, kullanım alanları, güvenlik profilleri ve doğru ilaç seçimi hakkında uzman görüşleri.",
    content: `# Reçeteli ve Reçetesiz İlaçlar Arasındaki Fark

İlaçlar, reçeteli ve reçetesiz olmak üzere iki ana kategoriye ayrılır. Bu ayrım, ilaçların güvenlik profili, farmakolojik etkileri ve kullanım alanları açısından önemlidir. Bu yazıda, reçeteli ve reçetesiz ilaçlar arasındaki farklar farmakolojik açıdan ele alınmaktadır.

## Reçeteli İlaçların Farmakolojik Özellikleri

Reçeteli ilaçlar, güçlü farmakolojik etkilere sahiptir. Bu ilaçlar, ciddi hastalıkların tedavisinde kullanılır ve doktor kontrolü gerektirir. Reçeteli ilaçların güvenlik profili, reçetesiz ilaçlara göre daha dikkatli değerlendirilir.

Reçeteli ilaçlar, genellikle daha yüksek dozajlarda etkin madde içerir. Bu nedenle yan etki riski daha yüksektir. İlaç etkileşimleri ve kontrendikasyonlar, reçeteli ilaçlarda daha kritiktir.

Antibiyotikler, tansiyon ilaçları, antidepresanlar ve güçlü ağrı kesiciler reçeteli ilaç örnekleridir. Bu ilaçlar, mutlaka doktor reçetesi ile alınmalı ve doktor kontrolünde kullanılmalıdır.

## Reçetesiz İlaçların Güvenlik Profili

Reçetesiz ilaçlar (OTC - Over The Counter), genellikle hafif-orta şiddetli semptomlar için kullanılır. Bu ilaçların güvenlik profili yüksektir ve doktor reçetesi olmadan alınabilir. Ancak bu, reçetesiz ilaçların tamamen güvenli olduğu anlamına gelmez.

Reçetesiz ilaçlar, genellikle düşük dozajlarda etkin madde içerir. Bu nedenle yan etki riski daha düşüktür. Ancak yanlış kullanım veya aşırı dozaj, ciddi sağlık sorunlarına yol açabilir.

Parasetamol, ibuprofen, antiasitler ve soğuk algınlığı ilaçları reçetesiz ilaç örnekleridir. Bu ilaçlar, eczacı danışmanlığı ile kullanılmalıdır.

## Farmakokinetik ve Farmakodinamik Farklar

Reçeteli ve reçetesiz ilaçlar arasındaki farklar, farmakokinetik (ilaç emilimi, dağılımı, metabolizması, atılımı) ve farmakodinamik (ilaçların hedef reseptörler üzerindeki etkileri) düzeyde görülür.

Reçeteli ilaçlar, genellikle daha güçlü farmakodinamik etkilere sahiptir. Bu ilaçlar, spesifik reseptörlere yüksek afinite ile bağlanır ve güçlü farmakolojik yanıtlar oluşturur.

Reçetesiz ilaçlar, daha hafif farmakodinamik etkilere sahiptir. Bu ilaçlar, genellikle geniş bir güvenlik marjına sahiptir ve yanlış kullanımda bile ciddi yan etkilere yol açma riski düşüktür.

## Kullanım Alanları ve Endikasyonlar

Reçeteli ilaçlar, ciddi hastalıkların tedavisinde kullanılır. Bakteriyel enfeksiyonlar, yüksek tansiyon, depresyon ve kronik ağrı gibi durumlar, reçeteli ilaç gerektirir.

Reçetesiz ilaçlar, hafif semptomların tedavisinde kullanılır. Baş ağrısı, soğuk algınlığı, mide rahatsızlıkları ve hafif alerji semptomları, reçetesiz ilaçlarla tedavi edilebilir.

Ancak bu ayrım mutlak değildir. Bazı durumlarda hafif semptomlar bile reçeteli ilaç gerektirebilir. Örneğin, uzun süreli baş ağrısı, altta yatan ciddi bir hastalığın belirtisi olabilir.

## Güvenlik ve Yan Etki Profilleri

Reçeteli ilaçların yan etki riski daha yüksektir. Bu ilaçlar, güçlü farmakolojik etkilere sahip olduğu için yan etkilere daha açıktır. Doktor kontrolü, yan etkilerin erken tespiti ve yönetimi için kritiktir.

Reçetesiz ilaçların yan etki riski daha düşüktür, ancak yok değildir. Özellikle uzun süreli kullanım veya aşırı dozaj, ciddi yan etkilere yol açabilir. Parasetamol aşırı dozajı, karaciğer hasarına neden olabilir.

İlaç etkileşimleri, her iki ilaç türünde de görülebilir. Reçeteli ilaçlar, daha fazla ilaç etkileşimi riskine sahiptir, ancak reçetesiz ilaçlar da diğer ilaçlarla etkileşime girebilir.

## Doğru İlaç Seçimi ve Klinik Değerlendirme

Ciddi semptomlar için mutlaka doktora başvurulmalıdır. Doktor, semptomların altında yatan nedeni teşhis eder ve uygun tedaviyi belirler. Reçeteli ilaçlar, doktor teşhisi sonrasında kullanılır.

Hafif semptomlar için reçetesiz ilaçlar kullanılabilir. Ancak eczacı danışmanlığı almak önemlidir. Eczacılar, ilaç seçimi ve kullanımı konusunda güncel bilgilere sahiptir.

Semptomlar devam ederse veya kötüleşirse, mutlaka doktora başvurulmalıdır. Reçetesiz ilaçlar, geçici semptomlar için kullanılmalıdır.

## Yaygın Hatalar ve Risk Yönetimi

Reçeteli ilaçlarda yaygın hatalar arasında reçete olmadan kullanmak, dozajı kendiniz belirlemek ve ilacı aniden kesmek bulunur. Bu hatalar, ciddi sağlık sorunlarına yol açabilir.

Reçetesiz ilaçlarda yaygın hatalar arasında uzun süreli kullanmak, dozajı aşmak ve prospektüs okumamak bulunur. Bu hatalar, yan etkilere ve ilaç etkileşimlerine yol açabilir.

İlaç kullanımında en önemli nokta, sağlık profesyonellerinden destek almaktır. Doktor ve eczacı, ilaç kullanımı konusunda en güncel bilgilere sahiptir.

## Karasu'da İlaç Kullanımı ve Eczane Hizmetleri

Karasu'daki lisanslı eczaneler, hem reçeteli hem de reçetesiz ilaçlar konusunda danışmanlık hizmeti vermektedir. Eczacılar, ilaç seçimi, kullanımı ve yan etkiler konusunda güncel bilgilere sahiptir.

Ciddi semptomlar için mutlaka doktora başvurulmalıdır. Karasu'daki sağlık kuruluşları, vatandaşların sağlık ihtiyaçlarını karşılamak için hizmet vermektedir.

Eczacı danışmanlığı, özellikle reçetesiz ilaç kullanımında önemlidir. Eczacılar, ilaç etkileşimleri ve yan etkiler konusunda bilgi verebilir.`,
    meta_description: "Reçeteli ve reçetesiz ilaçların farmakolojik farkları, güvenlik profilleri, kullanım alanları ve doğru ilaç seçimi hakkında uzman görüşleri.",
    keywords: ["reçeteli ilaç", "reçetesiz ilaç", "farmakoloji", "ilaç güvenliği", "eczane", "karasu"],
    category: "Sağlık",
    author: "Karasu Emlak",
    status: "published",
  },
];

async function createBlogArticles() {
  console.log("🚀 Blog yazıları oluşturuluyor (Doğal, Uzman Stil)...\n");

  let created = 0;
  let updated = 0;
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
  console.log(`   📁 Toplam: ${ARTICLES.length}\n`);

  if (created > 0 || updated > 0) {
    console.log("✨ Blog yazıları başarıyla işlendi!\n");
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
