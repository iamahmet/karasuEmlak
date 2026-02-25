DO $$
DECLARE
  static_pages_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'static_pages'
  )
  INTO static_pages_exists;

  IF NOT static_pages_exists THEN
    RAISE NOTICE 'Skipping static page seed migration: public.static_pages table does not exist';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.static_pages
    WHERE slug = 'hakkimizda/kariyer' AND locale = 'tr'
  ) THEN
    INSERT INTO public.static_pages (
      slug,
      title,
      locale,
      content,
      meta_title,
      meta_description,
      meta_keywords,
      is_published
    ) VALUES (
      'hakkimizda/kariyer',
      'Kariyer',
      'tr',
      $career$
<h2>Karasu Emlak''ta Kariyer</h2>
<p>Karasu ve Sakarya bölgesinde büyüyen gayrimenkul operasyonumuz için farklı alanlarda ekip arkadaşları arıyoruz. Müşteri deneyimi, saha operasyonu ve dijital içerik üretimi odaklı bir ekip yapımız var.</p>

<h3>Kimleri Arıyoruz?</h3>
<ul>
  <li>Gayrimenkul danışmanlığı alanında gelişmek isteyen iletişimi güçlü adaylar</li>
  <li>Saha araştırması, portföy takibi ve müşteri koordinasyonunda disiplinli çalışan ekip üyeleri</li>
  <li>Dijital pazarlama, içerik üretimi ve sosyal medya yönetimi deneyimi olan adaylar</li>
  <li>Yerel bölge dinamiklerini öğrenmeye açık, çözüm odaklı çalışan profesyoneller</li>
</ul>

<h3>Çalışma Yaklaşımımız</h3>
<ul>
  <li>Şeffaf iletişim ve ekip içi koordinasyon</li>
  <li>Müşteri ihtiyaçlarına hızlı geri dönüş</li>
  <li>Veri destekli karar alma ve süreç takibi</li>
  <li>Sürekli öğrenme ve sahadan beslenen gelişim</li>
</ul>

<h3>Başvuru</h3>
<p>Özgeçmişinizi ve kısa bir ön yazınızı <strong>iletisim@karasuemlak.net</strong> adresine gönderebilir veya iletişim sayfamız üzerinden bize ulaşabilirsiniz. Uygun pozisyonlar oluştuğunda sizinle iletişime geçiyoruz.</p>
      $career$,
      'Kariyer | Karasu Emlak',
      'Karasu Emlak kariyer fırsatları, ekip kültürü ve başvuru süreci hakkında bilgiler.',
      'karasu emlak kariyer, emlak danışmanı iş ilanı, sakarya emlak kariyer',
      true
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.static_pages
    WHERE slug = 'hakkimizda/referanslar' AND locale = 'tr'
  ) THEN
    INSERT INTO public.static_pages (
      slug,
      title,
      locale,
      content,
      meta_title,
      meta_description,
      meta_keywords,
      is_published
    ) VALUES (
      'hakkimizda/referanslar',
      'Referanslar',
      'tr',
      $references$
<h2>Müşteri Referansları</h2>
<p>Karasu Emlak olarak alım, satım ve kiralama süreçlerinde müşterilerimizin hedeflerine güvenli ve hızlı şekilde ulaşmasını amaçlıyoruz. Aşağıda sık çalıştığımız müşteri profilleri ve sunduğumuz değer alanlarını bulabilirsiniz.</p>

<h3>Hizmet Verdiğimiz Başlıca Profiller</h3>
<ul>
  <li>Yazlık veya kalıcı yaşam için konut arayan aileler</li>
  <li>Karasu ve çevresinde yatırım amaçlı gayrimenkul arayan bireysel yatırımcılar</li>
  <li>Kiralama süreçlerinde hızlı eşleştirme isteyen mülk sahipleri</li>
  <li>Portföy yönetimi ve değerleme desteği arayan gayrimenkul sahipleri</li>
</ul>

<h3>Neden Bizi Tercih Ediyorlar?</h3>
<ul>
  <li>Bölgeye hakim yerel ekip ve mahalle bazlı bilgi</li>
  <li>İlan hazırlığı, görsel düzenleme ve dijital görünürlük desteği</li>
  <li>Şeffaf fiyatlandırma ve süreç bilgilendirmesi</li>
  <li>Satış sonrası iletişim ve yönlendirme desteği</li>
</ul>

<blockquote>
  <p>Detaylı müşteri başarı hikayeleri ve vaka örnekleri için bizimle iletişime geçebilirsiniz. Talebe göre proje ve işlem tipine göre referans paylaşımı yapılmaktadır.</p>
</blockquote>
      $references$,
      'Referanslar | Karasu Emlak',
      'Karasu Emlak müşteri referansları, hizmet verdiğimiz profiller ve başarı odaklı çalışma yaklaşımımız.',
      'karasu emlak referanslar, emlak danışmanlık referans, sakarya gayrimenkul referans',
      true
    );
  END IF;
END
$$;
