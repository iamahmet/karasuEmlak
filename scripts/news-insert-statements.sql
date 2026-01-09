
INSERT INTO news_articles (
  title, slug, source_url, source_domain, original_summary,
  emlak_analysis, emlak_analysis_generated, related_neighborhoods,
  related_listings, seo_title, seo_description, seo_keywords,
  published, featured, created_at, updated_at
) VALUES (
  'Karasu Emlak Haberleri: Karasuspor’da Galibiyet Hasreti Devam Ediyor',
  'karasuspor-galibiyet-hasreti',
  'https://karasugundem.com/karasu-haber/karasu-spor/karasuspor-galibiyet-hasreti/',
  'karasugundem.com',
  'Bölgesel Amatör Lig’de Karasu’yu temsil eden Karasuspor, ligin son haftalarına girilirken galibiyet özlemini yine dindiremedi. Sarı-kırmızılı ekip, Pazar günü kendi sahasında ağırladığı Dikilitaşspor ile 1-1 berabere kalarak sahadan bir puanla&#8230;',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Bölgesel Amatör Lig’de Karasu’yu temsil eden Karasuspor, ligin son haftalarına girilirken galibiyet özlemini yine dindiremedi. Sarı-kırmızılı ekip, Pazar günü kendi sahasında ağırladığı Dikilitaşspor ...',
  true,
  ARRAY['karasu'],
  ARRAY[]::TEXT[],
  'Karasu Emlak Haberleri: Karasuspor’da Galibiyet Hasreti Devam Ediyor',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Bölgesel Amatör Lig’de Karasu’yu temsil eden Karasuspor, ligin son haftaların...',
  ARRAY['karasu emlak', 'karasu haberleri', 'karasu'],
  false,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  emlak_analysis = EXCLUDED.emlak_analysis,
  updated_at = EXCLUDED.updated_at;



INSERT INTO news_articles (
  title, slug, source_url, source_domain, original_summary,
  emlak_analysis, emlak_analysis_generated, related_neighborhoods,
  related_listings, seo_title, seo_description, seo_keywords,
  published, featured, created_at, updated_at
) VALUES (
  'Karasu Emlak Haberleri: Karasu Devlet Hastanesi’nde Ocak Ayı Mesai Dışı Poliklinik Takvimi Belli Oldu',
  'karasu-hastanesi-ocak-mesai-disi',
  'https://karasugundem.com/karasu-haber/karasu-saglik/karasu-hastanesi-ocak-mesai-disi/',
  'karasugundem.com',
  'Karasu Devlet Hastanesi, vatandaşların sağlık hizmetlerine daha kolay erişebilmesi amacıyla Ocak 2026 dönemine ait mesai dışı poliklinik hizmetlerini kamuoyuyla paylaştı. Açıklanan takvim kapsamında, mesai saatleri dışında da hasta kabulü yapacak&#8230;',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Karasu Devlet Hastanesi, vatandaşların sağlık hizmetlerine daha kolay erişebilmesi amacıyla Ocak 2026 dönemine ait mesai dışı poliklinik hizmetlerini kamuoyuyla paylaştı. Açıklanan takvim kapsamında, ...',
  true,
  ARRAY['karasu'],
  ARRAY[]::TEXT[],
  'Karasu Emlak Haberleri: Karasu Devlet Hastanesi’nde Ocak Ayı Mesai Dışı Poliklinik Takvimi Belli Oldu',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Karasu Devlet Hastanesi, vatandaşların sağlık hizmetlerine daha kolay erişebi...',
  ARRAY['karasu emlak', 'karasu haberleri', 'karasu'],
  false,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  emlak_analysis = EXCLUDED.emlak_analysis,
  updated_at = EXCLUDED.updated_at;



INSERT INTO news_articles (
  title, slug, source_url, source_domain, original_summary,
  emlak_analysis, emlak_analysis_generated, related_neighborhoods,
  related_listings, seo_title, seo_description, seo_keywords,
  published, featured, created_at, updated_at
) VALUES (
  'Karasu Emlak Haberleri: Karasu’da Okullar Tatil mi? 30 Aralık Salı Günü İçin Gözler Valilikte',
  'karasu-okullar-tatil-mi-30-aralik',
  'https://karasugundem.com/karasu-haber/karasu-okullar-tatil-mi-30-aralik/',
  'karasugundem.com',
  'Sakarya genelinde etkisini sürdüren yoğun kar yağışı sonrası “Karasu’da okullar tatil mi?”, “Yarın Karasu’da okullar tatil olacak mı?” soruları öğrenci, veli ve eğitim camiasının gündeminde ilk sıraya yerleşti. Özellikle gece&#8230;',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Sakarya genelinde etkisini sürdüren yoğun kar yağışı sonrası “Karasu’da okullar tatil mi?”, “Yarın Karasu’da okullar tatil olacak mı?” soruları öğrenci, veli ve eğitim camiasının gündeminde ilk sıraya...',
  true,
  ARRAY['karasu'],
  ARRAY[]::TEXT[],
  'Karasu Emlak Haberleri: Karasu’da Okullar Tatil mi? 30 Aralık Salı Günü İçin Gözler Valilikte',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Sakarya genelinde etkisini sürdüren yoğun kar yağışı sonrası “Karasu’da okull...',
  ARRAY['karasu emlak', 'karasu haberleri', 'karasu'],
  false,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  emlak_analysis = EXCLUDED.emlak_analysis,
  updated_at = EXCLUDED.updated_at;



INSERT INTO news_articles (
  title, slug, source_url, source_domain, original_summary,
  emlak_analysis, emlak_analysis_generated, related_neighborhoods,
  related_listings, seo_title, seo_description, seo_keywords,
  published, featured, created_at, updated_at
) VALUES (
  'Karasu Emlak Haberleri: 30 Aralık 2025 Karasu Hava Durumu &#124; Yağmur Akşam Saatlerinde Etkili',
  '30-aralik-2025-karasu-hava-durumu',
  'https://karasugundem.com/karasu-haber/30-aralik-2025-karasu-hava-durumu/',
  'karasugundem.com',
  'Karasu’da 30 Aralık 2025 Salı günü hava durumu, günün ilerleyen saatlerinde değişkenlik gösterecek. Sabah ve gündüz saatlerinde parçalı bulutlu bir gökyüzü hakim olurken, akşam saatlerinden itibaren yağmurun etkisini artırması bekleniyor.&#8230;',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Karasu’da 30 Aralık 2025 Salı günü hava durumu, günün ilerleyen saatlerinde değişkenlik gösterecek. Sabah ve gündüz saatlerinde parçalı bulutlu bir gökyüzü hakim olurken, akşam saatlerinden itibaren y...',
  true,
  ARRAY['karasu'],
  ARRAY[]::TEXT[],
  'Karasu Emlak Haberleri: 30 Aralık 2025 Karasu Hava Durumu &#124; Yağmur Akşam Saatlerinde Etkili',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Karasu’da 30 Aralık 2025 Salı günü hava durumu, günün ilerleyen saatlerinde d...',
  ARRAY['karasu emlak', 'karasu haberleri', 'karasu'],
  false,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  emlak_analysis = EXCLUDED.emlak_analysis,
  updated_at = EXCLUDED.updated_at;



INSERT INTO news_articles (
  title, slug, source_url, source_domain, original_summary,
  emlak_analysis, emlak_analysis_generated, related_neighborhoods,
  related_listings, seo_title, seo_description, seo_keywords,
  published, featured, created_at, updated_at
) VALUES (
  'Karasu Emlak Haberleri: Sakarya’da Kar Alarmı Eğitimi Durdurdu: Karasu Dahil 3 İlçede Okullara Ara Verildi',
  'sakarya-kar-tatili',
  'https://karasugundem.com/karasu-haber/sakarya-kar-tatili/',
  'karasugundem.com',
  'Sakarya genelinde gece saatlerinden itibaren etkisini artıran yoğun kar yağışı, özellikle yüksek kesimlerde günlük yaşamı olumsuz etkiledi. Olumsuz hava koşulları ve ulaşımda yaşanabilecek riskler nedeniyle bazı ilçelerde eğitim öğretime geçici&#8230;',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Sakarya genelinde gece saatlerinden itibaren etkisini artıran yoğun kar yağışı, özellikle yüksek kesimlerde günlük yaşamı olumsuz etkiledi. Olumsuz hava koşulları ve ulaşımda yaşanabilecek riskler ned...',
  true,
  ARRAY['karasu'],
  ARRAY[]::TEXT[],
  'Karasu Emlak Haberleri: Sakarya’da Kar Alarmı Eğitimi Durdurdu: Karasu Dahil 3 İlçede Okullara Ara Verildi',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Sakarya genelinde gece saatlerinden itibaren etkisini artıran yoğun kar yağış...',
  ARRAY['karasu emlak', 'karasu haberleri', 'karasu'],
  false,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  emlak_analysis = EXCLUDED.emlak_analysis,
  updated_at = EXCLUDED.updated_at;



INSERT INTO news_articles (
  title, slug, source_url, source_domain, original_summary,
  emlak_analysis, emlak_analysis_generated, related_neighborhoods,
  related_listings, seo_title, seo_description, seo_keywords,
  published, featured, created_at, updated_at
) VALUES (
  'Karasu Emlak Haberleri: Karasu’da Kış Aylarında Hayat: İlçede Yaşayanların Bilmesi Gereken Her Şey',
  'karasuda-kis-aylarinda-hayat',
  'https://karasugundem.com/karasu-yasam/karasuda-kis-aylarinda-hayat/',
  'karasugundem.com',
  'Karasu’da kış ayları, ilçeyi yaz kalabalığından tamamen farklı bir atmosfere sokar. Sahil hattı sakinleşir, ilçe merkezinde tempo düşer, günlük hayat daha çok yerel ihtiyaçlar etrafında şekillenir. Bu dönem, Karasu’da yaşayanlar&#8230;',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Karasu’da kış ayları, ilçeyi yaz kalabalığından tamamen farklı bir atmosfere sokar. Sahil hattı sakinleşir, ilçe merkezinde tempo düşer, günlük hayat daha çok yerel ihtiyaçlar etrafında şekillenir. Bu...',
  true,
  ARRAY['merkez', 'sahil', 'karasu'],
  ARRAY[]::TEXT[],
  'Karasu Emlak Haberleri: Karasu’da Kış Aylarında Hayat: İlçede Yaşayanların Bilmesi Gereken Her Şey',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Karasu’da kış ayları, ilçeyi yaz kalabalığından tamamen farklı bir atmosfere ...',
  ARRAY['karasu emlak', 'karasu haberleri', 'merkez', 'sahil', 'karasu'],
  false,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  emlak_analysis = EXCLUDED.emlak_analysis,
  updated_at = EXCLUDED.updated_at;



INSERT INTO news_articles (
  title, slug, source_url, source_domain, original_summary,
  emlak_analysis, emlak_analysis_generated, related_neighborhoods,
  related_listings, seo_title, seo_description, seo_keywords,
  published, featured, created_at, updated_at
) VALUES (
  'Karasu Emlak Haberleri: Büyükşehir’den Güncel Kar Raporu: 31 Yol Açıldı &#124; Karasu Haber',
  'kar-raporu-yollar-acildi',
  'https://karasugundem.com/karasu-haber/kar-raporu-yollar-acildi/',
  'karasugundem.com',
  'Sakarya genelinde gece saatlerinden itibaren etkisini artıran yoğun kar yağışı sonrası, ulaşımda yaşanan aksaklıkların giderilmesi için Büyükşehir Belediyesi ekipleri sahadaki çalışmalarını aralıksız sürdürüyor. Sabah saatlerinde kapalı olan grup yollarının büyük&#8230;',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Sakarya genelinde gece saatlerinden itibaren etkisini artıran yoğun kar yağışı sonrası, ulaşımda yaşanan aksaklıkların giderilmesi için Büyükşehir Belediyesi ekipleri sahadaki çalışmalarını aralıksız ...',
  true,
  ARRAY['karasu'],
  ARRAY[]::TEXT[],
  'Karasu Emlak Haberleri: Büyükşehir’den Güncel Kar Raporu: 31 Yol Açıldı &#124; Karasu Haber',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Sakarya genelinde gece saatlerinden itibaren etkisini artıran yoğun kar yağış...',
  ARRAY['karasu emlak', 'karasu haberleri', 'karasu'],
  false,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  emlak_analysis = EXCLUDED.emlak_analysis,
  updated_at = EXCLUDED.updated_at;



INSERT INTO news_articles (
  title, slug, source_url, source_domain, original_summary,
  emlak_analysis, emlak_analysis_generated, related_neighborhoods,
  related_listings, seo_title, seo_description, seo_keywords,
  published, featured, created_at, updated_at
) VALUES (
  'Karasu Emlak Haberleri: Saadet Partisi Gençlik Kolları Genel Başkan Yardımcısı Osman Sedat Akyüz Karasu’da Gençlerle Buluştu',
  'osman-sedat-akyuz-karasu',
  'https://karasugundem.com/karasu-haber/karasu-siyaset/osman-sedat-akyuz-karasu/',
  'karasugundem.com',
  'Saadet Partisi Gençlik Kolları Genel Başkan Yardımcısı Osman Sedat Akyüz, Karasu’da düzenlenen program kapsamında partililer, gençlik teşkilatları ve yerel basın temsilcileriyle bir araya geldi. Karasu’daki temaslarında gençlerin yaşadığı ekonomik ve&#8230;',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Saadet Partisi Gençlik Kolları Genel Başkan Yardımcısı Osman Sedat Akyüz, Karasu’da düzenlenen program kapsamında partililer, gençlik teşkilatları ve yerel basın temsilcileriyle bir araya geldi. Karas...',
  true,
  ARRAY['karasu'],
  ARRAY[]::TEXT[],
  'Karasu Emlak Haberleri: Saadet Partisi Gençlik Kolları Genel Başkan Yardımcısı Osman Sedat Akyüz Karasu’da Gençlerle Buluştu',
  'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. Saadet Partisi Gençlik Kolları Genel Başkan Yardımcısı Osman Sedat Akyüz, Kar...',
  ARRAY['karasu emlak', 'karasu haberleri', 'karasu'],
  false,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  emlak_analysis = EXCLUDED.emlak_analysis,
  updated_at = EXCLUDED.updated_at;
