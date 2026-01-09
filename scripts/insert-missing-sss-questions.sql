-- Insert missing FAQ questions for hukuki, finansman, and kiralama categories
-- These are high-priority questions that should be in the database

-- HUKUKI KATEGORİSİ
INSERT INTO qa_entries (question, answer, category, priority, region)
VALUES
(
  'Tapu devri süreci nasıl işler?',
  'Tapu devri süreci, emlak alım-satım işlemlerinin en önemli aşamasıdır. Süreç genellikle şu adımlardan oluşur: Öncelikle satıcı ve alıcı noterde buluşur. Gerekli belgeler (kimlik, tapu, vergi levhası, ruhsat) hazırlanır. Tapu devir işlemi noter huzurunda yapılır ve tapu sicil müdürlüğüne bildirilir. İşlem genellikle 1-2 hafta içinde tamamlanır. Karasu ve Kocaali bölgelerinde tapu işlemleri için profesyonel emlak danışmanlığı hizmeti almanız önerilir. Tüm yasal süreçlerde yanınızdayız ve güvenli bir işlem sağlıyoruz.',
  'hukuki',
  'high',
  'karasu'
),
(
  'Emlak alım-satım sözleşmesi nasıl hazırlanır?',
  'Emlak alım-satım sözleşmesi, işlemin yasal güvencesini sağlayan en önemli belgedir. Sözleşmede şu bilgiler yer almalıdır: Tarafların kimlik bilgileri, gayrimenkulün tam adresi ve tapu bilgileri, satış bedeli ve ödeme planı, teslim tarihi, özel şartlar ve yükümlülükler. Sözleşme mutlaka noter huzurunda düzenlenmelidir. Karasu Emlak olarak, tüm sözleşme hazırlama süreçlerinde profesyonel hukuki destek sunuyoruz. Sözleşmenizin hukuki açıdan eksiksiz olmasını sağlıyoruz.',
  'hukuki',
  'high',
  'karasu'
),
(
  'Tapu kayıtlarında nelere dikkat edilmeli?',
  'Tapu kayıtlarını kontrol ederken şu noktalara dikkat etmelisiniz: Tapu üzerindeki mülkiyet durumu (hisseli tapu, müstakil tapu), üzerindeki ipotek ve haciz durumu, imar durumu ve yapı ruhsatı bilgileri, komşu hakları ve sınır durumu, tapu üzerindeki şerhler ve yükümlülükler. Karasu ve Kocaali bölgelerinde emlak alımı yaparken, tapu kayıtlarının detaylı kontrolü için profesyonel danışmanlık hizmeti almanız önerilir. Tüm yasal kontrolleri yaparak güvenli bir işlem sağlıyoruz.',
  'hukuki',
  'medium',
  'karasu'
),
(
  'İmar durumu nedir ve nasıl öğrenilir?',
  'İmar durumu, bir arsanın veya yapının imar planına göre ne amaçla kullanılabileceğini gösteren belgedir. İmar durumu belgesi, belediyeden veya ilgili kurumlardan alınır. Belgede şu bilgiler yer alır: Parsel numarası, imar adası, yapılaşma koşulları, kat yüksekliği, yapı yoğunluğu, kullanım amacı. Karasu ve Kocaali bölgelerinde emlak alımı yaparken, imar durumu belgesini mutlaka kontrol etmelisiniz. Profesyonel emlak danışmanlarımız, imar durumu kontrollerinde size yardımcı olmaktadır.',
  'hukuki',
  'medium',
  'karasu'
),
(
  'Tapu işlemlerinde hangi belgeler gereklidir?',
  'Tapu işlemleri için gerekli belgeler şunlardır: Kimlik belgesi (TC kimlik kartı veya pasaport), tapu belgesi, vergi levhası veya muafiyet belgesi, yapı ruhsatı ve iskan belgesi, vekaletname (eğer vekil aracılığıyla işlem yapılıyorsa), ödeme belgeleri. Karasu ve Kocaali bölgelerinde tapu işlemleri için tüm gerekli belgelerin hazırlanmasında profesyonel destek sunuyoruz. Eksiksiz belge hazırlığı ile hızlı ve sorunsuz bir işlem sağlıyoruz.',
  'hukuki',
  'medium',
  'karasu'
),

-- FİNANSMAN KATEGORİSİ
(
  'Kredi başvurusu için gerekli belgeler nelerdir?',
  'Emlak kredisi başvurusu için gerekli belgeler şunlardır: Kimlik belgesi, gelir belgesi (maaş bordrosu, SGK hizmet dökümü), vergi levhası (esnaf/serbest meslek sahipleri için), banka hesap ekstreleri, tapu belgesi (alınacak gayrimenkul için), ekspertiz raporu, peşinat belgesi. Karasu ve Kocaali bölgelerinde emlak kredisi başvurularında, tüm belgelerin hazırlanmasında profesyonel destek sunuyoruz. Kredi başvuru sürecinde yanınızdayız ve en uygun kredi seçeneklerini bulmanıza yardımcı oluyoruz.',
  'finansman',
  'high',
  'karasu'
),
(
  'Emlak kredisi nasıl alınır?',
  'Emlak kredisi alma süreci şu adımlardan oluşur: Öncelikle kredi notunuzu kontrol edin. Bankalardan kredi teklifleri alın ve karşılaştırın. Gerekli belgeleri hazırlayın. Kredi başvurusu yapın. Banka değerleme yapar ve onay verir. Kredi sözleşmesi imzalanır ve gayrimenkul alımı gerçekleştirilir. Karasu ve Kocaali bölgelerinde emlak kredisi almak için profesyonel danışmanlık hizmeti sunuyoruz. En uygun kredi seçeneklerini bulmanıza ve başvuru sürecinde yardımcı oluyoruz.',
  'finansman',
  'high',
  'karasu'
),
(
  'Karasu''da ev almak için kredi şartları nelerdir?',
  'Karasu''da ev almak için kredi şartları genellikle şunlardır: Düzenli gelir belgesi, yeterli kredi notu, peşinat (genellikle %20-30), yaş sınırı (genellikle 18-65 yaş arası), sigortalı çalışma durumu. Kredi şartları bankaya göre değişiklik gösterebilir. Karasu ve Kocaali bölgelerinde emlak kredisi almak için, kredi şartlarını değerlendirmenizde profesyonel danışmanlık hizmeti sunuyoruz. En uygun kredi seçeneklerini bulmanıza yardımcı oluyoruz.',
  'finansman',
  'medium',
  'karasu'
),
(
  'Kredi hesaplama nasıl yapılır?',
  'Kredi hesaplama, aylık ödeme tutarını ve toplam geri ödeme miktarını belirlemek için yapılır. Hesaplamada şu faktörler dikkate alınır: Kredi tutarı, faiz oranı, vade süresi, peşinat miktarı. Kredi hesaplama araçları ile aylık ödeme tutarını hesaplayabilirsiniz. Karasu Emlak olarak, kredi hesaplama konusunda profesyonel danışmanlık hizmeti sunuyoruz. Size en uygun kredi seçeneklerini bulmanıza ve hesaplama yapmanıza yardımcı oluyoruz.',
  'finansman',
  'medium',
  'karasu'
),
(
  'Karasu''da kredi ile ev alınabilir mi?',
  'Evet, Karasu''da kredi ile ev alınabilir. Karasu, İstanbul''a yakınlığı ve gelişen altyapısı nedeniyle bankalar tarafından kredi verilebilir bölgeler arasında yer almaktadır. Kredi almak için düzenli gelir, yeterli kredi notu ve peşinat gereklidir. Karasu ve Kocaali bölgelerinde kredi ile ev almak için profesyonel danışmanlık hizmeti sunuyoruz. En uygun kredi seçeneklerini bulmanıza ve başvuru sürecinde yardımcı oluyoruz.',
  'finansman',
  'high',
  'karasu'
),

-- KİRALAMA KATEGORİSİ
(
  'Kiralık ev arıyorum, nasıl yardımcı olabilirsiniz?',
  'Kiralık ev arayışınızda size şu şekilde yardımcı oluyoruz: Bütçenize ve ihtiyaçlarınıza uygun seçenekleri birlikte değerlendiriyoruz. Görüntüleme randevuları ayarlıyoruz. Kira sözleşmesi hazırlama konusunda destek sunuyoruz. Tüm yasal süreçlerde rehberlik ediyoruz. Karasu ve Kocaali bölgelerinde geniş bir kiralık ev portföyümüz bulunmaktadır. İletişim formunu doldurarak veya telefon ile bize ulaşabilirsiniz. Hayalinizdeki kiralık evi bulmanızda yanınızdayız.',
  'kiralama',
  'high',
  'karasu'
),
(
  'Kira sözleşmesi nasıl yapılır?',
  'Kira sözleşmesi, kiracı ve ev sahibi arasında yapılan yasal anlaşmadır. Sözleşmede şu bilgiler yer almalıdır: Tarafların kimlik bilgileri, kiralanan gayrimenkulün adresi, kira bedeli ve ödeme şekli, sözleşme süresi, depozito miktarı, özel şartlar. Kira sözleşmesi yazılı olarak yapılmalı ve noter huzurunda onaylanmalıdır. Karasu Emlak olarak, kira sözleşmesi hazırlama konusunda profesyonel hukuki destek sunuyoruz. Güvenli bir kiralama işlemi sağlıyoruz.',
  'kiralama',
  'high',
  'karasu'
),
(
  'Kira bedeli nasıl belirlenir?',
  'Kira bedeli, birçok faktöre göre belirlenir: Gayrimenkulün konumu ve özellikleri, bölgedeki piyasa koşulları, metrekare, oda sayısı, bina yaşı, ek özellikler (balkon, bahçe, garaj). Karasu ve Kocaali bölgelerinde kira bedelleri, denize yakınlık ve merkez konum gibi faktörlere göre değişiklik göstermektedir. Profesyonel emlak danışmanlarımız, adil kira bedeli belirleme konusunda size yardımcı olmaktadır. Piyasa analizi yaparak en uygun kira bedelini belirlemenize destek oluyoruz.',
  'kiralama',
  'medium',
  'karasu'
),
(
  'Karasu''da kiralık ev bulmak kolay mı?',
  'Karasu''da kiralık ev bulmak, bütçenize ve ihtiyaçlarınıza göre değişiklik göstermektedir. Karasu, geniş bir kiralık ev portföyüne sahiptir. Denize yakın konumlar, merkez mahalleler ve yazlık bölgelerde çeşitli seçenekler bulunmaktadır. Kiralık ev bulma süresi genellikle 1-2 hafta arasında değişir. Profesyonel emlak danışmanlarımız, bütçenize ve ihtiyaçlarınıza uygun kiralık ev seçeneklerini bulmanızda size yardımcı olmaktadır. Geniş portföyümüz ile hayalinizdeki kiralık evi bulmanızı sağlıyoruz.',
  'kiralama',
  'medium',
  'karasu'
),
(
  'Kira sözleşmesinde nelere dikkat edilmeli?',
  'Kira sözleşmesinde şu noktalara dikkat etmelisiniz: Kira bedeli ve ödeme tarihi, sözleşme süresi, depozito miktarı ve iade koşulları, ev sahibi ve kiracı yükümlülükleri, fesih koşulları, özel şartlar. Sözleşme mutlaka yazılı olarak yapılmalı ve noter huzurunda onaylanmalıdır. Karasu Emlak olarak, kira sözleşmesi hazırlama ve kontrol konusunda profesyonel hukuki destek sunuyoruz. Güvenli bir kiralama işlemi için tüm yasal süreçlerde yanınızdayız.',
  'kiralama',
  'medium',
  'karasu'
)
ON CONFLICT DO NOTHING;
