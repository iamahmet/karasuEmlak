/**
 * Create Ramadan 2026 Cornerstone + Blog Articles
 *
 * Safe-by-default:
 * - default is dry-run (no DB writes)
 * - pass --apply to insert/update
 * - pass --update to update existing slugs
 *
 * Usage:
 *   pnpm tsx scripts/create-ramadan-2026-articles.ts
 *   pnpm tsx scripts/create-ramadan-2026-articles.ts --apply
 *   pnpm tsx scripts/create-ramadan-2026-articles.ts --apply --update
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function p(text: string) {
  return `<p>${text}</p>`;
}

function ul(items: string[]) {
  return `<ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul>`;
}

function ramadanToolsBlockHtml(headingTag: "h2" | "h3" = "h2") {
  const H = headingTag;
  return [
    `<${H}>Karasu Ramazan Araçları</${H}>`,
    p("İmsak-iftar saatleri ve geri sayım için iki hızlı sayfa:"),
    ul([
      `<a href="/karasu/ramazan-imsakiyesi">Sakarya Karasu Ramazan imsakiyesi 2026 (imsak + iftar vakitleri)</a>`,
      `<a href="/karasu/iftara-kac-dakika-kaldi">Karasu iftara kaç dakika kaldı? (canlı geri sayım)</a>`,
    ]),
  ].join("\n");
}

function injectAfterFirstParagraph(html: string, injectionHtml: string) {
  const idx = html.indexOf("</p>");
  if (idx === -1) return `${injectionHtml}\n${html}`;
  return `${html.slice(0, idx + 4)}\n${injectionHtml}\n${html.slice(idx + 4)}`;
}

function ensureRamadanToolsBlock(html: string) {
  if (html.includes("Karasu Ramazan Araçları")) return html;
  return injectAfterFirstParagraph(html, ramadanToolsBlockHtml("h2"));
}

type ArticleInput = {
  title: string;
  slug: string;
  category: string;
  tags: string[];
  keywords: string[];
  meta_description: string;
  excerpt: string;
  contentHtml: string;
  published_at: string; // ISO
  cornerstone?: boolean;
};

const RAMADAN_2026 = {
  // Turkiye'de (Diyanet hesabi takvim): tarih metnini hardcode tutuyoruz ki
  // gelistirme makinesi timezone'u 1 gun kaydirmasin.
  startIso: "2026-02-19",
  startText: "19 Şubat 2026 Perşembe",
  endIso: "2026-03-19",
  endText: "19 Mart 2026 Perşembe (Arefe)",
  eidStartIso: "2026-03-20",
  eidStartText: "20 Mart 2026 Cuma",
  eidEndIso: "2026-03-22",
  eidEndText: "22 Mart 2026 Pazar",
};

function buildCornerstoneKarasuRamadanGuide(): ArticleInput {
  const title = "Ramazan 2026 Karasu Rehberi: İftar, Sahur, Sosyal Hayat ve Yazlık Planı";
  const slug = "ramazan-2026-karasu-rehberi";

  const excerpt =
    "Ramazan ayında Karasu’da yaşam daha sakin, daha paylaşımcı ve daha planlı bir ritme girer. Bu rehberde Ramazan 2026 tarihlerini, Karasu’da iftar ve sahur planı yaparken dikkat edilecek noktaları, aileler için akşam aktivitelerini ve bayram haftası ile bahar sezonuna girerken yazlık planlamasını ele alıyoruz. Ayrıca taşınma, kiralık ev arama ve ev alım-satım süreçlerinde Ramazan döneminin pratik etkilerini de, gereksiz satış dili kullanmadan, adım adım anlatıyoruz.";

  const meta_description =
    "Ramazan 2026 Karasu rehberi: tarihleri, iftar-sahur planı, aile aktiviteleri, bayram haftası ve yazlık/kiralık planlaması için pratik öneriler.";

  const keywords = [
    "ramazan 2026",
    "karasu ramazan",
    "karasu iftar",
    "karasu sahur",
    "ramazan bayramı 2026",
    "karasu yazlık",
    "karasu kiralık ev",
    "karasu emlak",
  ];

  const tags = ["ramazan", "2026", "karasu", "rehber", "yasam"];

  const contentHtml = ensureRamadanToolsBlock([
    `<h2>Ramazan 2026 Ne Zaman? (Türkiye Takvimi)</h2>`,
    p(
      `Türkiye'de Ramazan 2026, Diyanet takvimine göre ${RAMADAN_2026.startText} tarihinde başlar; ${RAMADAN_2026.endText} ile tamamlanır. Ramazan Bayramı ise ${RAMADAN_2026.eidStartText} ile ${RAMADAN_2026.eidEndText} tarihleri arasındadır. İmsak ve iftar saatleri gün gün değişir; Karasu için güncel saatleri resmî takvimlerden kontrol etmek en sağlıklısıdır.`
    ),
    `<h2>Karasu’da Ramazan’da Gün Planı: İftar ve Sahur İçin Pratik Rutin</h2>`,
    p(
      "Karasu sahil hattı ve merkez bölgeleri, Ramazan akşamlarında daha hareketli olur. Gün içinde iş, okul ve günlük koşturmaca devam ederken; iftar öncesi alışveriş, ev hazırlığı ve ulaşım süreleri planı belirler."
    ),
    `<h3>1) İftar Öncesi Alışverişi Kolaylaştırın</h3>`,
    ul([
      "Haftalık alışverişi tek güne yığmak yerine 2 parça halinde planlayın.",
      "Sahil ve merkez yoğunluğunu düşünerek mümkünse iftara yakın saatlerde uzun mesafe işlerini erteleyin.",
      "Evde hızlı hazırlanacak menüler için stok listesi oluşturun (bakliyat, dondurulmuş sebze, kahvaltılık).",
    ]),
    `<h3>2) Sahur İçin “Sessiz ve Hafif” Plan</h3>`,
    p(
      "Özellikle apartman yaşamında sahur hazırlığı komşuluk hassasiyetleriyle birlikte düşünülür. Ön hazırlık (yoğurt, yulaf, haşlanmış yumurta) ile mutfakta geçirdiğiniz süreyi azaltabilirsiniz."
    ),
    `<h2>Aileler İçin Akşam Aktiviteleri: Sahil Yürüyüşü ve Mini Rotalar</h2>`,
    p(
      "İftar sonrası Karasu’da sahil yürüyüşü, hem sindirim hem de “evde sıkışmadan” vakit geçirmek için iyi bir seçenek. Çocuklu ailelerde kısa, güvenli ve aydınlık rotalar tercih edilirse gün daha rahat kapanır."
    ),
    ul([
      "20-30 dakikalık “kısa sahil turu” planı (dönüşte sıcak içecek).",
      "Ara sokaklarda sessiz yürüyüş (bebek arabası için daha sakin saatler).",
      "Evde mini oyun/okuma saati (ekran süresini sınırlayan rutin).",
    ]),
    `<h2>Ramazan Döneminde Emlak İşleri: Kiralık Arama, Taşınma ve Randevu Yönetimi</h2>`,
    p(
      "Ramazan döneminde görüşmeler, randevular ve taşınma işleri zaman yönetimi gerektirir. İftar/sahur saatleri sebebiyle mesai dışı saatlerde görüşme talepleri artabilir; bu da hem alıcı/kiracı hem de danışman için doğru planlama ihtiyacı doğurur."
    ),
    `<h3>Kiralık Ev Ararken</h3>`,
    ul([
      `İlan taramasını tek seferde uzun uzun yapmak yerine 15-20 dakikalık bloklar halinde yapın (gün içinde daha sürdürülebilir).`,
      `İlk eleme: bütçe, mahalle, oda sayısı; ikinci eleme: bina yaşı, güneş alma, aidat, ulaşım.`,
      `İçeriden karar vermek için aynı gün 2-3 evi üst üste planlayın (ayrı günlere yayılınca verim düşer).`,
      `Kiralık ilanları görmek için: <a href="/kiralik">Kiralık ilanlar</a>.`,
    ]),
    `<h3>Satın Alma Sürecinde</h3>`,
    ul([
      "Ekspertiz, tapu ve banka süreçleri için resmi kurum saatlerini dikkate alın.",
      "Karar aşamasında acele etmeyin; iftar öncesi “zaman sıkışması” hatalı karar doğurabilir.",
      `Satılık seçeneklere göz atmak için: <a href="/satilik">Satılık ilanlar</a>.`,
    ]),
    `<h2>Bayram Haftası ve Bahar Sezonu: Yazlık Planlaması</h2>`,
    p(
      "Ramazan Bayramı döneminde Karasu’da hareketlilik artabilir. Bu, kısa süreli konaklama ve yazlık kiralama taleplerini etkiler. Eğer yazlık planlıyorsanız, bayram haftasından önce erken rezervasyon benzeri bir plan yapmak (tarihleri netleştirmek, ihtiyaç listesini çıkarmak) daha rahat ettirir."
    ),
    `<h2>Sık Sorulan Sorular (Kısa)</h2>`,
    `<h3>Ramazan 2026’da Karasu’da yoğunluk artar mı?</h3>`,
    p(
      "İftar sonrası sahil hattında ve merkezde hareketlilik artabilir. Hafta sonları ve bayram haftası daha yoğun geçer."
    ),
    `<h3>Ramazan’da ev bakmak mantıklı mı?</h3>`,
    p(
      "Evet, mantıklı olabilir. Randevuları doğru saatlere koyup (iftar öncesi sıkışıklığı azaltarak) karar süreçlerini aceleye getirmeden yönetmek yeterli."
    ),
    `<h2>İki küçük hatırlatma</h2>`,
    p(
      "Ramazan’da Karasu’da gün biraz farklı akıyor: iftara yakın saatler hızlanıyor, akşamları sahil hattı canlanıyor. Takvimi bir kez netleştirip (alışveriş, randevu, ulaşım) kendinize sade bir akış kurduğunuzda ay daha rahat geçiyor. Ev bakıyorsanız görüşmeleri iftar öncesi son saate bırakmamaya çalışın; yazlık düşünüyorsanız bayram haftası için birkaç alternatif tarih çıkarın. Aklınıza takılan bir şey olursa <a href=\"/iletisim\">iletişim</a> sayfasından yazabilirsiniz."
    ),
    `<h2>Ramazan 2026 İçerik Merkezi</h2>`,
    ul([
      `<a href="/blog/ramazan-2026">Ramazan 2026 Karasu rehberleri (tüm yazılar)</a>`,
      `<a href="/blog/ramazan-bayrami-2026-karasu-tatil-yazlik-rehberi">Ramazan Bayramı 2026 Karasu rehberi</a>`,
      `<a href="/blog/etiket/ramazan">Ramazan etiketi</a>`,
    ]),
  ].join("\n"));

  return {
    title,
    slug,
    category: "Rehber",
    tags,
    keywords,
    meta_description,
    excerpt,
    contentHtml,
    // Publish immediately (avoid future-dated "published" posts being treated as newest)
    published_at: new Date("2026-02-15T09:00:00+03:00").toISOString(),
    cornerstone: true,
  };
}

function buildCornerstoneEidGuide(): ArticleInput {
  const title = "Ramazan Bayramı 2026 Karasu: Tatil Planı, Ulaşım, Konaklama ve Yazlık Rehberi";
  const slug = "ramazan-bayrami-2026-karasu-tatil-yazlik-rehberi";

  const excerpt =
    "Ramazan Bayramı 2026 yaklaşırken Karasu’da kısa bir tatil planlamak isteyenler için pratik bir rehber hazırladık. Ulaşım seçenekleri, konaklama ve yazlık kiralama gibi başlıklarda, abartılı vaatler olmadan, gerçekçi bir kontrol listesi sunuyoruz. Ayrıca aile ziyaretleri ve sahil planı yaparken yoğun saatleri nasıl yöneteceğinizi ve bayram sonrası bahar sezonuna geçerken Karasu’da yaşam ritmini nasıl yakalayabileceğinizi anlatıyoruz.";

  const meta_description =
    "Ramazan Bayramı 2026’da Karasu tatil rehberi: ulaşım, konaklama, yazlık planı, yoğun saatler ve aileler için pratik öneriler.";

  const keywords = [
    "ramazan bayramı 2026",
    "karasu bayram",
    "karasu tatil",
    "karasu yazlık kiralama",
    "karasu konaklama",
    "karasu ulaşım",
  ];

  const tags = ["ramazan-bayrami", "2026", "karasu", "rehber", "tatil", "yazlik"];

  const contentHtml = ensureRamadanToolsBlock([
    `<h2>Ramazan Bayramı 2026 Tarihleri</h2>`,
    p(
      `Ramazan Bayramı 2026, Türkiye takvimine göre ${RAMADAN_2026.eidStartText} ile ${RAMADAN_2026.eidEndText} tarihleri arasındadır. Bayram öncesi ve bayramın ilk günü, ulaşım ve sahil yoğunluğu artabileceği için planı bir gün önceden netleştirmek faydalı olur.`
    ),
    `<h2>Karasu’da Bayram Planı: 3 Parça Kontrol Listesi</h2>`,
    `<h3>1) Ulaşım</h3>`,
    ul([
      "Gidiş-dönüş saatlerini iftar/sahur gibi gün içi ritimden bağımsız düşünün: bayram yoğunluğu erken başlar.",
      "Araçla geliyorsanız park planını önceden yapın (sahil bölgesi daha yoğun olabilir).",
      "Kısa tatilde “tek gün çok iş” yerine “az rota” daha iyi hissettirir.",
    ]),
    `<h3>2) Konaklama / Yazlık</h3>`,
    ul([
      "Kaç kişi kalacak, kaç gece, çocuk/yaşlı ihtiyaçları var mı: bu 3 soru doğru evi seçtirir.",
      "Mutfağı kullanacaksanız market planını da ekleyin (bayram sabahı yoğunluk olabilir).",
      `Karasu’da kiralık seçeneklere göz atmak için: <a href="/kiralik">Kiralık ilanlar</a>.`,
    ]),
    `<h3>3) Sahil ve Aile Ziyaretleri</h3>`,
    ul([
      "Ziyaretleri tek güne sıkıştırmayın; kısa ama kaliteli plan daha sürdürülebilir.",
      "Sahil yürüyüşünü günün en yoğun saatine koymak yerine “ikindi sonrası” veya daha sakin saatlere kaydırın.",
    ]),
    `<h2>Bayram Sonrası: Bahar Sezonuna Girerken Karasu’da Yazlık Düşünenler</h2>`,
    p(
      "Bayram sonrası dönem, yazlık arayışının hızlandığı bir eşik olabilir. Eğer yazlık alım-satım veya kiralama düşünüyorsanız, bu dönemde arama kriterlerinizi netleştirmek (mahalle, site/aidat, ulaşım, güneş alma) doğru karar oranını artırır."
    ),
    `<h2>İç Linkler: İhtiyaca Göre Hızlı Geçiş</h2>`,
    ul([
      `<a href="/satilik">Satılık ilanlar</a>`,
      `<a href="/kiralik">Kiralık ilanlar</a>`,
      `<a href="/blog">Blog rehberleri</a>`,
      `<a href="/iletisim">İletişim</a>`,
    ]),
    `<h2>Bir cümleyle</h2>`,
    p(
      "Karasu’da bayramı keyifli yapan şey programı doldurmak değil; ulaşımı ve konaklamayı önceden netleştirip günü akışına bırakmak. Sahil yürüyüşünü daha sakin saatlere çekmek, park işini baştan planlamak ve market gibi küçük işleri zamana yaymak, bayramın en yoğun anlarında bile işleri epey kolaylaştırır."
    ),
    `<h2>Ramazan 2026 İçerik Merkezi</h2>`,
    ul([
      `<a href="/blog/ramazan-2026">Ramazan 2026 Karasu rehberleri (tüm yazılar)</a>`,
      `<a href="/blog/ramazan-2026-karasu-rehberi">Ramazan 2026 Karasu ana rehberi</a>`,
      `<a href="/blog/etiket/bayram">Bayram etiketi</a>`,
    ]),
  ].join("\n"));

  return {
    title,
    slug,
    category: "Rehber",
    tags,
    keywords,
    meta_description,
    excerpt,
    contentHtml,
    // Publish immediately (avoid future-dated "published" posts being treated as newest)
    published_at: new Date("2026-02-15T14:00:00+03:00").toISOString(),
    cornerstone: true,
  };
}

function buildSupportingArticles(): ArticleInput[] {
  const mk = (a: Omit<ArticleInput, "slug"> & { slug?: string }): ArticleInput => {
    const slug = a.slug || slugify(a.title);
    return { ...a, slug, contentHtml: ensureRamadanToolsBlock(a.contentHtml) };
  };

  return [
    mk({
      title: "Ramazan 2026’da Karasu’da Kiralık Ev Arayanlar İçin 10 Pratik İpucu",
      slug: "ramazan-2026-karasu-kiralik-ev-ipuclari",
      category: "Kiralık Rehberi",
      tags: ["ramazan", "2026", "karasu", "kiralik", "rehber"],
      keywords: ["ramazan 2026", "karasu kiralık ev", "kiralık daire karasu", "ev kiralama ipuçları"],
      meta_description:
        "Ramazan 2026’da Karasu’da kiralık ev arayanlar için 10 pratik ipucu: randevu saatleri, kriter listesi, kontrat öncesi kontrol ve daha fazlası.",
      excerpt:
        "Ramazan döneminde ev aramak, doğru plan yapıldığında daha verimli ilerler. Bu yazıda Karasu’da kiralık ev ararken randevuları hangi saatlere koymanın daha rahat olduğu, aynı gün kaç evi gezmenin mantıklı olduğu, ilan eleme kriterleri ve kontrat öncesi kontrol listesi gibi pratik önerileri derledik.",
      contentHtml: [
        `<h2>Neden Ramazan’da Ev Aramak Farklı Hissettirir?</h2>`,
        p(
          "Gün içi ritmin değişmesi (iftar-sahur), randevu saatlerini ve enerji yönetimini etkiler. Bu yüzden küçük plan farkları büyük verim sağlar."
        ),
        `<h2>10 İpucu</h2>`,
        ul([
          "Randevuları iftardan 2-3 saat öncesine sıkıştırmayın; hem trafik hem odak düşer.",
          "Aynı gün 2-3 evi peş peşe planlayın, sonra değerlendirme için zaman bırakın.",
          "Kriterleri yazılı hale getirin: mahalle, bütçe, oda, bina yaşı, aidat, güneş alma.",
          "Gürültü/komşuluk: akşam saatlerinde çevreyi kısaca gözlemleyin.",
          "Sözleşme öncesi: depozito, aidat, sayaç devri, demirbaş listesi net olsun.",
          "Eşya/taşınma takvimi: bayram haftası yoğunluğunu hesaba katın.",
          "İletişim kanalı tek olsun (WhatsApp/telefon) ve not tutun.",
          "Fotoğrafa aldanmayın: mutfak-banyo ölçüleri ve balkon kullanımı sorulsun.",
          "Isınma/altyapı: internet, doğalgaz, site yönetimi gibi detaylar en başta sorulsun.",
          `İlanlara hızlı bakış: <a href="/kiralik">Kiralık ilanlar</a>.`,
        ]),
        `<h2>İlgili Yazılar</h2>`,
        ul([
          `<a href="/blog/ramazan-2026">Ramazan 2026 içerik merkezi</a>`,
          `<a href="/blog/ramazan-2026-karasu-rehberi">Ramazan 2026 Karasu rehberi</a>`,
        ]),
      ].join("\n"),
      published_at: new Date("2026-02-15T10:00:00+03:00").toISOString(),
    }),
    mk({
      title: "Karasu’da Ramazan’da Sahil Yürüyüşleri: Aileler İçin Sakin Akşam Planı",
      slug: "karasu-ramazan-sahil-aksam-plani",
      category: "Yaşam",
      tags: ["ramazan", "karasu", "yasam", "aile", "sahil"],
      keywords: ["karasu sahil", "ramazan akşamı", "karasu aile aktiviteleri"],
      meta_description:
        "Karasu’da Ramazan akşamları için sakin plan: sahil yürüyüşü, aile aktiviteleri ve kalabalık saatleri yönetmek için pratik öneriler.",
      excerpt:
        "İftar sonrası kısa bir yürüyüş, hem sindirimi destekler hem de günün stresini azaltır. Karasu’da Ramazan akşamlarını daha sakin geçirmek isteyen aileler için pratik bir akşam planı ve küçük öneriler.",
      contentHtml: [
        `<h2>Kısa Yürüyüş Planı</h2>`,
        ul([
          "20-30 dakika yürüyüş + dönüşte sıcak içecek.",
          "Çocuklarla daha kısa rota + güvenli aydınlatma tercihleri.",
          "Kalabalık saatlerde sahil yerine ara sokak/park rotası alternatifi.",
        ]),
        `<h2>Evde Devam: “Sessiz Saat” Rutini</h2>`,
        p(
          "Yürüyüş sonrası evde kısa okuma/oyun saati, ekran süresini azaltmaya yardımcı olur."
        ),
        `<h2>İlgili Yazılar</h2>`,
        ul([
          `<a href="/blog/ramazan-2026">Ramazan 2026 içerik merkezi</a>`,
          `<a href="/blog/ramazan-2026-karasu-rehberi">Ramazan 2026 Karasu rehberi</a>`,
        ]),
      ].join("\n"),
      published_at: new Date("2026-02-15T11:00:00+03:00").toISOString(),
    }),
    mk({
      title: "Ramazan Öncesi Taşınma Checklist’i: Karasu’da Ev Değiştireceklere",
      slug: "ramazan-oncesi-tasinma-checklist-karasu",
      category: "Rehber",
      tags: ["ramazan", "karasu", "tasinma", "rehber"],
      keywords: ["taşınma checklist", "karasu taşınma", "ev taşıma planı"],
      meta_description:
        "Ramazan öncesi taşınma checklist’i: Karasu’da ev değiştirecekler için gün gün plan, kutu listesi ve abonelik/sayaç devri notları.",
      excerpt:
        "Taşınma süreci zaten yoğun; Ramazan öncesinde bu yoğunluk daha da hissedilebilir. Bu checklist, Karasu’da ev değiştirecekler için pratik bir plan şablonu sunar.",
      contentHtml: [
        `<h2>7 Günlük Mini Plan</h2>`,
        ul([
          "Gün 1: Eşyaları kategoriye ayır (at/bağışla/sat).",
          "Gün 2: Kutu-etiket sistemi kur (oda + içerik + öncelik).",
          "Gün 3: Taşıma firması/araç planı ve saat seçimi.",
          "Gün 4: Abonelikler, sayaçlar, internet taşıma.",
          "Gün 5: Kırılacaklar ve değerli eşyalar.",
          "Gün 6: Temizlik + teslim kontrolü.",
          "Gün 7: Yeni ev yerleşim planı + acil çanta.",
        ]),
        `<h2>Kiralık / Satılık Hızlı Geçiş</h2>`,
        ul([`<a href="/kiralik">Kiralık ilanlar</a>`, `<a href="/satilik">Satılık ilanlar</a>`]),
        `<h2>İlgili Yazılar</h2>`,
        ul([
          `<a href="/blog/ramazan-2026">Ramazan 2026 içerik merkezi</a>`,
          `<a href="/blog/ramazan-2026-karasu-kiralik-ev-ipuclari">Ramazan döneminde kiralık ev arama ipuçları</a>`,
        ]),
      ].join("\n"),
      published_at: new Date("2026-02-15T12:00:00+03:00").toISOString(),
    }),
    mk({
      title: "Ramazan’da Yazlık Kiralama: Karasu’da Bayram Haftası ve İlkbahar Sezonu",
      slug: "ramazan-karasu-yazlik-kiralama-bayram-2026",
      category: "Kiralık Rehberi",
      tags: ["ramazan", "bayram", "karasu", "yazlik", "kiralik"],
      keywords: ["karasu yazlık kiralama", "bayram karasu", "ramazan bayramı yazlık"],
      meta_description:
        "Karasu’da Ramazan Bayramı 2026 ve bahar sezonu için yazlık kiralama rehberi: tarih planı, kriterler, sözleşme öncesi kontrol listesi.",
      excerpt:
        "Bayram haftası yaklaşırken Karasu’da yazlık kiralamak isteyenler için pratik bir rehber: tarih planı, ev seçimi kriterleri ve sözleşme öncesi hızlı kontrol listesi.",
      contentHtml: [
        `<h2>Önce Tarih, Sonra Ev</h2>`,
        p(
          "Kısa tatillerde ev seçimini en çok etkileyen şey tarih netliğidir. Tarih net değilse aynı evi kaçırmak kolaylaşır."
        ),
        `<h2>Kriterler</h2>`,
        ul([
          "Kişi sayısı ve yatak düzeni",
          "Sahil/merkez mesafesi",
          "Mutfak kullanımı ve temel ekipmanlar",
          "Balkon/teras ve güneş alma",
          "Site/komşuluk sessizliği",
          `Seçeneklere bakış: <a href="/kiralik">Kiralık ilanlar</a>.`,
        ]),
        `<h2>İlgili Yazılar</h2>`,
        ul([
          `<a href="/blog/ramazan-2026">Ramazan 2026 içerik merkezi</a>`,
          `<a href="/blog/ramazan-bayrami-2026-karasu-tatil-yazlik-rehberi">Ramazan Bayramı 2026 Karasu rehberi</a>`,
        ]),
      ].join("\n"),
      published_at: new Date("2026-02-15T13:00:00+03:00").toISOString(),
    }),
    mk({
      title: "Ramazan 2026’da Karasu’da Ev Gezerken Sorulacak 12 Soru (Kiralık İçin)",
      slug: "ramazan-2026-karasu-ev-gezerken-sorular",
      category: "Kiralık Rehberi",
      tags: ["ramazan", "2026", "karasu", "kiralik", "rehber"],
      keywords: ["karasu kiralık", "ev gezme soruları", "kira sözleşmesi", "ramazan 2026"],
      meta_description:
        "Ramazan 2026’da Karasu’da kiralık ev gezerken sorulacak 12 soru: aidat, demirbaş, sayaç devri, internet, komşuluk ve sözleşme detayları.",
      excerpt:
        "Ev gezerken doğru soruları sormak, sonradan sürprizleri azaltır. Ramazan döneminde randevu ve karar süreçleri daha sıkışık olabildiği için bu liste özellikle işe yarar.",
      contentHtml: [
        `<h2>12 Soru</h2>`,
        ul([
          "Aidat ne kadar, neleri kapsıyor?",
          "Depozito/peşinat koşulu ve iade şartları nedir?",
          "Elektrik/su/doğalgaz sayaç devri nasıl yapılacak?",
          "İnternet altyapısı var mı, taşıma süresi ne?",
          "Demirbaş listesi (klima, kombi, beyaz eşya) sözleşmeye yazılacak mı?",
          "Bina yönetimi/kuralları (sessizlik, evcil hayvan, otopark) nasıl?",
          "Kira artışı ve ödeme günü nasıl belirleniyor?",
          "Evde nem/ısı yalıtımı, rutubet geçmişi var mı?",
          "Güneş alma ve rüzgar yönü nasıl?",
          "Park ve güvenlik durumu nasıl?",
          "Teslimde boya/temizlik beklentisi ve tutanak olacak mı?",
          `İlanları incelemek için: <a href="/kiralik">Kiralık ilanlar</a>.`,
        ]),
        `<h2>İlgili Yazılar</h2>`,
        ul([
          `<a href="/blog/ramazan-2026">Ramazan 2026 içerik merkezi</a>`,
          `<a href="/blog/karasu-ramazan-2026-kiralik-daire-mi-ev-mi">Kiralık daire mi ev mi? Karar matrisi</a>`,
        ]),
      ].join("\n"),
      published_at: new Date("2026-02-15T08:30:00+03:00").toISOString(),
    }),
    mk({
      title: "Karasu’da Ramazan 2026: Kiralık Daire mi Ev mi? Hızlı Karar Matrisi",
      slug: "karasu-ramazan-2026-kiralik-daire-mi-ev-mi",
      category: "Kiralık Rehberi",
      tags: ["ramazan", "2026", "karasu", "kiralik", "karsilastirma"],
      keywords: ["karasu kiralık daire", "karasu kiralık ev", "daire mi ev mi", "ramazan 2026"],
      meta_description:
        "Karasu’da Ramazan 2026 döneminde kiralık daire mi ev mi? Bütçe, sessizlik, ulaşım ve günlük rutin üzerinden hızlı karar matrisi.",
      excerpt:
        "Kiralık daire ve müstakil/bağımsız ev seçenekleri farklı ihtiyaçlara hitap eder. Ramazan rutinini (iftar-sahur, sessizlik, ulaşım) düşünerek hızlı bir karar matrisi ile seçim yapın.",
      contentHtml: [
        `<h2>Karar Matrisi (Hızlı)</h2>`,
        ul([
          "Sessizlik önemliyse: daha az sirkülasyonlu bina/kat planlarını tercih edin.",
          "Park ihtiyacı varsa: otopark/net park alanını baştan sorun.",
          "Çocuklu aile: güvenli alan ve yürüyüş rotası (site içi/park) avantaj sağlar.",
          "Uzaktan çalışma: internet altyapısı ve çalışma odası (oda sayısı) kritik.",
        ]),
        `<h2>Hızlı Geçiş</h2>`,
        ul([
          `<a href="/kiralik-daire">Kiralık daireler</a>`,
          `<a href="/kiralik-ev">Kiralık evler</a>`,
          `<a href="/kiralik">Tüm kiralık ilanlar</a>`,
        ]),
        `<h2>İlgili Yazılar</h2>`,
        ul([
          `<a href="/blog/ramazan-2026">Ramazan 2026 içerik merkezi</a>`,
          `<a href="/blog/ramazan-2026-karasu-ev-gezerken-sorular">Ev gezerken sorulacak 12 soru</a>`,
        ]),
      ].join("\n"),
      published_at: new Date("2026-02-15T08:45:00+03:00").toISOString(),
    }),
    mk({
      title: "Ramazan Bayramı 2026 Karasu’da Trafik ve Park: Yoğunluğu Yönetme Rehberi",
      slug: "ramazan-bayrami-2026-karasu-trafik-park",
      category: "Yaşam",
      tags: ["bayram", "2026", "karasu", "trafik", "yasam"],
      keywords: ["karasu bayram", "karasu trafik", "karasu park", "ramazan bayramı 2026"],
      meta_description:
        "Ramazan Bayramı 2026’da Karasu’da trafik ve park yoğunluğunu yönetmek için pratik öneriler: saat seçimi, alternatif plan ve kısa rota yaklaşımı.",
      excerpt:
        "Bayram haftası Karasu’da hareketlilik artabilir. Trafik ve park stresini azaltmak için saat seçimi, kısa rota planı ve alternatif yürüyüş seçenekleriyle daha rahat bir akış kurabilirsiniz.",
      contentHtml: [
        `<h2>3 Pratik Öneri</h2>`,
        ul([
          "Geliş-dönüş saatini esnetin: tek hedef, tek gün yerine 2 parçalı plan kurun.",
          "Sahil yerine alternatif kısa yürüyüş rotası belirleyin (kalabalık saatlerde).",
          "Market/alışveriş işlerini bayram sabahına bırakmayın; bir gün önce tamamlayın.",
        ]),
        `<h2>İlgili Rehber</h2>`,
        ul([`<a href="/blog/ramazan-bayrami-2026-karasu-tatil-yazlik-rehberi">Ramazan Bayramı 2026 Karasu tatil rehberi</a>`]),
        `<h2>İlgili Yazılar</h2>`,
        ul([
          `<a href="/blog/ramazan-2026">Ramazan 2026 içerik merkezi</a>`,
          `<a href="/blog/etiket/bayram">Bayram etiketi</a>`,
        ]),
      ].join("\n"),
      published_at: new Date("2026-02-15T08:55:00+03:00").toISOString(),
    }),
    mk({
      title: "Sakarya Karasu Ramazan İmsakiyesi 2026: İftar ve Sahur Saatleri (Gün Gün)",
      slug: "sakarya-karasu-ramazan-imsakiyesi-2026",
      category: "Rehber",
      tags: ["ramazan", "2026", "karasu", "imsakiye", "vakitler"],
      keywords: [
        "sakarya karasu ramazan imsakiyesi",
        "sakarya karasu iftar vakitleri",
        "karasu imsakiye 2026",
        "karasu iftar saati",
        "karasu sahur saati",
      ],
      meta_description:
        "Sakarya Karasu Ramazan imsakiyesi 2026: imsak, iftar vakitleri ve sahur saatleri nasıl takip edilir? Gün gün tablo ve pratik kullanım önerileri.",
      excerpt:
        "İmsak ve iftar saatleri her gün birkaç dakika değişir. Karasu için Ramazan 2026 imsakiyesi tablosunu, iftar saatini ve gün gün saatleri nasıl pratik takip edeceğinizi bu rehberde topladık.",
      contentHtml: [
        `<h2>Karasu’da Ramazan 2026’da Saatler Neden Değişiyor?</h2>`,
        p(
          "İmsak, güneş ve iftar (akşam) saatleri sabit değildir; gün uzunluğu değiştikçe vakitler de birkaç dakika ileri geri oynar. Bu yüzden “dünkü saat” ile “bugünkü saat” aynı olmayabilir."
        ),
        `<h2>Sakarya Karasu Ramazan İmsakiyesi 2026 (Gün Gün Tablo)</h2>`,
        p(
          "Gün gün tablo görmek istiyorsanız, pratik olan şu: tek bir sayfadan hem imsak hem iftar vakitlerini kontrol edin; ayrıca aynı ekrandan geri sayımı takip edin."
        ),
        ramadanToolsBlockHtml("h3"),
        `<h2>İftar Planı İçin 3 Küçük İpucu</h2>`,
        ul([
          "Market işini iftara 30-60 dakika kala bırakmayın. Karasu merkez ve sahil hattında yoğunluk artabiliyor.",
          "Misafir planı varsa saatten bağımsız bir “hazırlık listesi” çıkarın: sofrada eksik stresini azaltır.",
          "Eğer ev bakıyorsanız randevuyu iftar öncesi son 1 saate koymamaya çalışın: hem karar hem ulaşım daha rahat olur.",
        ]),
        `<h2>İlgili Yazılar</h2>`,
        ul([
          `<a href="/blog/ramazan-2026">Ramazan 2026 içerik merkezi</a>`,
          `<a href="/blog/ramazan-2026-karasu-rehberi">Ramazan 2026 Karasu rehberi</a>`,
        ]),
      ].join("\n"),
      published_at: new Date("2026-02-15T09:05:00+03:00").toISOString(),
      cornerstone: true,
    }),
    mk({
      title: "Karasu’da İftara Kaç Dakika Kaldı? (Sakarya Karasu İçin Pratik Takip)",
      slug: "karasu-iftara-kac-dakika-kaldi",
      category: "Yaşam",
      tags: ["iftar", "ramazan", "karasu", "vakitler"],
      keywords: ["karasu iftara kaç dakika kaldı", "sakarya karasu iftara kaç dk kaldı", "karasu iftar vakti"],
      meta_description:
        "Karasu iftara kaç dakika kaldı? Sakarya Karasu iftar saatine göre geri sayım, saat değişimleri ve günlük pratik takip önerileri.",
      excerpt:
        "İftara kaç dakika kaldı sorusu Ramazan’da en çok sorulanlardan. Karasu için geri sayımı doğru takip etmek ve gün içinde saat değişimini kaçırmamak için pratik bir yöntem paylaşıyoruz.",
      contentHtml: [
        `<h2>Karasu İftara Kaç Dakika Kaldı?</h2>`,
        p(
          "En pratik çözüm: bugünün Karasu iftar saatini tek yerden görüp, aynı anda geri sayımı takip etmek. Böylece saat değişimini kaçırmıyorsunuz."
        ),
        ramadanToolsBlockHtml("h3"),
        `<h2>“Sakarya Karasu iftara kaç dk kaldı” diye arayanlar için not</h2>`,
        p(
          "Geri sayım, Karasu iftar (akşam) saatine göre hesaplanır. İftar geçtiyse otomatik olarak yarının iftarına göre devam eder. Bu sayede gece saatlerinde de “yarın kaç dakika kaldı” sorusu karşılık bulur."
        ),
        `<h2>Ramazan Akşamı Karasu’da Kısa Plan</h2>`,
        ul([
          "İftar sonrası 20-30 dakikalık sahil yürüyüşü (kalabalık saatlerde kısa rota).",
          "Çocuklu aileler için eve yakın, aydınlık ve dönüşü kolay bir rota seçmek.",
          "Bayram haftası için erken plan: yazlık veya kiralık bakıyorsanız hedef mahalle listesini önceden çıkarın.",
        ]),
        `<h2>İlgili Yazılar</h2>`,
        ul([
          `<a href="/blog/ramazan-2026">Ramazan 2026 içerik merkezi</a>`,
          `<a href="/blog/karasu-ramazan-sahil-aksam-plani">Karasu Ramazan sahil akşam planı</a>`,
        ]),
      ].join("\n"),
      published_at: new Date("2026-02-15T09:10:00+03:00").toISOString(),
    }),
    mk({
      title: "Ramazan’da Kiracı Olarak Mutfak Düzeni: İftar-Sahur İçin Pratik Hazırlık",
      slug: "ramazanda-kiraci-mutfak-duzeni-iftar-sahur",
      category: "Yaşam",
      tags: ["ramazan", "mutfak", "kiraci", "yasam"],
      keywords: ["ramazan mutfak", "iftar hazırlık", "sahur pratik", "kiracı ipuçları", "karasu ramazan"],
      meta_description:
        "Ramazan’da kiracı olarak mutfak düzeni: iftar-sahur hazırlığını hızlandıran pratik yerleşim, sessiz sahur planı, ön hazırlık stratejileri ve komşuluk hassasiyeti. Delme-kırma gerektirmeyen profesyonel öneriler.",
      excerpt:
        "Kiralık evde Ramazan geçirirken mutfak düzeni kritik önem taşır. Sahurda sessiz ve hızlı hazırlık, iftar öncesi ön hazırlık ve komşuluk hassasiyeti için delme-kırma gerektirmeyen profesyonel mutfak düzeni rehberi.",
      contentHtml: [
        p(
          "Ramazan ayında kiralık evde yaşayanlar için mutfak düzeni, hem sahurda sessiz ve verimli hazırlık hem de iftar sofrasını stressiz kurmak açısından belirleyici olur. Apartman yaşamında komşuluk hassasiyeti, sınırlı mutfak alanı ve kiralık evde delme-kırma yapamama kısıtı, doğru planlamayı daha da önemli kılar. Bu rehberde Karasu ve çevresinde kiracı olarak Ramazan geçirenler için pratik, uygulanabilir mutfak düzeni önerilerini adım adım ele alıyoruz."
        ),
        `<h2>Sahur Rafı: Tek Bölgede Toplama Stratejisi</h2>`,
        p(
          "Sahurda mutfakta geçirilen süreyi azaltmanın en etkili yolu, hızlı tüketilecek ürünleri tek bir rafa veya dolap bölgesine toplamaktır. Böylece buzdolabı ve dolap kapaklarını gereksiz yere açıp kapatmaz, sessiz ve odaklı bir hazırlık yaparsınız."
        ),
        `<h3>Hangi Ürünler Sahur Rafında Olmalı?</h3>`,
        ul([
          "Yoğurt, ayran, süt (hazır tüketim)",
          "Yulaf, müsli, kahvaltılık gevrek",
          "Peynir, zeytin, reçel (kapalı saklama)",
          "Haşlanmış yumurta (önceki gün hazırlanmış)",
          "Su şişeleri ve sade maden suyu",
          "Kuru meyve, ceviz, badem (küçük porsiyonlarda)",
        ]),
        p(
          "Bu ürünleri tek rafta tutarak sahurda 5–10 dakikada hafif ve doyurucu bir öğün hazırlayabilirsiniz. Özellikle apartman yaşamında gece sessizliğini bozmamak için blender, mikser veya gürültülü aletlerden kaçının."
        ),
        `<h2>Ön Hazırlık: İftar ve Sahur İçin Zaman Kazandıran Adımlar</h2>`,
        p(
          "Ramazan'da mutfakta en çok zaman alan işler, doğrama, haşlama ve pişirme süreçleridir. Bu işleri iftar öncesi veya hafta sonu bloklarında yaparak hem sahur hem iftar hazırlığını hızlandırabilirsiniz."
        ),
        `<h3>Haftalık Ön Hazırlık Listesi</h3>`,
        ul([
          "Haşlanmış yumurta: 3–4 günlük porsiyon buzdolabında saklanabilir.",
          "Doğranmış sebze: salatalık, domates, biber; hava almayan kaplarda 2–3 gün taze kalır.",
          "Çorba bazları: mercimek, tarhana vb. önceden porsiyonlanıp dondurulabilir.",
          "Salata yeşillikleri: yıkanıp kurutulmuş, streç film veya saklama kabında.",
          "Pilav/makarna: 1–2 gün önceden yapılıp buzdolabında saklanabilir.",
        ]),
        `<h3>İftar Öncesi Sessiz Plan</h3>`,
        p(
          "Blender, mikser, bulaşık makinesi gibi gürültülü işleri iftar öncesi saatlere alın. Sahurda sadece sessiz, hızlı tüketim odaklı bir menü planlayın. Komşularınızı rahatsız etmeden kendi ritminizi korumak, Ramazan ayını daha huzurlu geçirmenizi sağlar."
        ),
        `<h2>Kiracı Dostu Düzen: Delme-Kırma Gerektirmeyen Çözümler</h2>`,
        p(
          "Kiralık evde duvara vida çakmak, raf monte etmek veya dolap içi sabit sistemler kurmak genelde sözleşmeye aykırıdır. Bunun yerine taşınabilir, geri alınabilir çözümler kullanın."
        ),
        ul([
          "Tezgah üstü raf sistemleri (vida gerektirmeyen, baskı ile sabitlenen)",
          "Buzdolabı içi organizatörler ve çekmeceli kutular",
          "Tezgah üstü baharatlık ve küçük malzeme kutuları",
          "Dolap kapaklarına takılabilir askılık (yapışkan veya kancalı)",
          "Çekmece bölücüler (taşınırken kolayca sökülür)",
        ]),
        `<h2>İftar Sofrası İçin Hızlı Menü Fikirleri</h2>`,
        p(
          "Yoğun iş temposunda iftar sofrasını kurmak zor olabilir. Ön hazırlık yaptığınız malzemelerle 15–20 dakikada sofraya oturabileceğiniz pratik menü örnekleri:"
        ),
        ul([
          "Çorba + hazır salata + pide/simit",
          "Haşlanmış sebze + pilav + yoğurt",
          "Zeytinyağlı yemek (önceki gün yapılmış) + ekmek + ayran",
          "Mevsim salata + peynir + kuru meyve (hafif iftar)",
        ]),
        `<h2>Sık Sorulan Sorular</h2>`,
        `<h3>Sahurda komşuları rahatsız etmeden nasıl hazırlık yapabilirim?</h3>`,
        p(
          "Blender, mikser ve bulaşık makinesi gibi gürültülü aletleri kullanmayın. Önceden hazırlanmış yoğurt, yulaf, haşlanmış yumurta ve meyve ile sessiz bir sahur yapın. Tezgah üstü ocak kullanımını kısıtlayın; mümkünse mikrodalga veya sessiz ısıtma yöntemlerini tercih edin."
        ),
        `<h3>Kiralık evde mutfak düzenini değiştirmek sözleşmeye aykırı mı?</h3>`,
        p(
          "Duvar delme, raf monte etme ve kalıcı değişiklikler genelde kira sözleşmesinde yasaktır. Tezgah üstü organizatörler, buzdolabı içi kutular ve taşınabilir raflar ise izin gerektirmez; taşınırken kolayca geri alınabilir."
        ),
        `<h3>Ön hazırlık yapılan yemekler kaç gün saklanabilir?</h3>`,
        p(
          "Haşlanmış yumurta 3–4 gün, doğranmış sebze 2–3 gün, çorba 2–3 gün buzdolabında saklanabilir. Dondurulmuş çorba bazları 1–2 ay dayanır. Her zaman taze görünüm ve koku kontrolü yapın."
        ),
        ramadanToolsBlockHtml("h2"),
        `<h2>İlgili Yazılar</h2>`,
        ul([
          `<a href="/blog/ramazan-2026">Ramazan 2026 içerik merkezi</a>`,
          `<a href="/blog/ramazan-2026-karasu-rehberi">Ramazan 2026 Karasu rehberi</a>`,
          `<a href="/blog/karasu-ramazan-sahil-aksam-plani">Karasu Ramazan sahil akşam planı</a>`,
          `<a href="/blog/ramazan-2026-karasu-kiralik-ev-ipuclari">Ramazan'da kiralık ev arama ipuçları</a>`,
        ]),
      ].join("\n"),
      published_at: new Date("2026-02-15T09:15:00+03:00").toISOString(),
    }),
  ];
}

const ARTICLES: ArticleInput[] = [
  buildCornerstoneKarasuRamadanGuide(),
  ...buildSupportingArticles(),
  buildCornerstoneEidGuide(),
];

async function upsertArticle(input: ArticleInput, opts: { apply: boolean; update: boolean }) {
  const { data: existing, error: existingError } = await supabase
    .from("articles")
    .select("id, slug, title")
    .eq("slug", input.slug)
    .maybeSingle();

  if (existingError) throw existingError;

  const row: any = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.contentHtml,
    meta_description: input.meta_description,
    keywords: input.keywords,
    author: "Karasu Emlak",
    status: "published",
    published_at: input.published_at,
    updated_at: new Date().toISOString(),
    category: input.category,
    tags: input.tags,
    // Discover fields intentionally left off (can be curated later)
  };

  if (!opts.apply) {
    const action = existing ? (opts.update ? "UPDATE" : "SKIP") : "INSERT";
    return { action, slug: input.slug, title: input.title, exists: !!existing };
  }

  if (existing) {
    if (!opts.update) {
      return { action: "SKIP", slug: input.slug, title: input.title, exists: true };
    }
    const { error } = await supabase.from("articles").update(row).eq("id", existing.id);
    if (error) throw error;
    return { action: "UPDATE", slug: input.slug, title: input.title, exists: true };
  }

  row.created_at = new Date().toISOString();
  const { error } = await supabase.from("articles").insert(row);
  if (error) throw error;
  return { action: "INSERT", slug: input.slug, title: input.title, exists: false };
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const update = args.includes("--update");

  console.log(`\n🗓️  Ramadan 2026 content: ${ARTICLES.length} article(s)`);
  console.log(`Mode: ${apply ? "APPLY (writes enabled)" : "DRY-RUN (no writes)"}, updateExisting=${update}\n`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const a of ARTICLES) {
    try {
      const res = await upsertArticle(a, { apply, update });
      if (res.action === "INSERT") inserted++;
      else if (res.action === "UPDATE") updated++;
      else skipped++;
      console.log(`${res.action.padEnd(6)} /blog/${res.slug}  ${res.title}`);
    } catch (e: any) {
      errors++;
      console.error(`ERROR  /blog/${a.slug}  ${a.title}:`, e?.message || e);
    }
  }

  console.log(`\nSummary: inserted=${inserted}, updated=${updated}, skipped=${skipped}, errors=${errors}\n`);
  if (!apply) {
    console.log("To apply changes, re-run with: pnpm tsx scripts/create-ramadan-2026-articles.ts --apply\n");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
