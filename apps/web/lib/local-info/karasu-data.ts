/**
 * Karasu Local Information Data
 * Static data for Karasu subpages
 */

export interface GezilecekYer {
  name: string;
  aciklama: string;
  type: 'plaj' | 'dogal-alan' | 'turistik-yer' | 'muzeler' | 'parklar';
  ozellikler?: string[];
  konum?: string;
}

export interface SaglikKurulusu {
  name: string;
  type: 'hastane' | 'saglik-merkezi' | 'ozel-saglik';
  adres: string;
  telefon: string;
  aciklama?: string;
}

export interface Eczane {
  name: string;
  adres: string;
  telefon: string;
  mahalle?: string;
}

export interface Restoran {
  name: string;
  type: 'restoran' | 'balik-restorani' | 'kafe' | 'kahvalti' | 'fast-food';
  adres: string;
  telefon?: string;
  aciklama?: string;
  ozellikler?: string[];
}

export interface UlasimYolu {
  mesafe: string;
  sure: string;
  yol?: string;
}

export interface Telefon {
  kurum: string;
  telefon: string;
  kategori: string;
  aciklama?: string;
}

// Gezilecek Yerler
export const KARASU_GEZILECEK_YERLER: GezilecekYer[] = [
  {
    name: 'Karasu Plajı',
    aciklama: '20 km uzunluğundaki ince taneli kumu ve temiz deniziyle ünlü Karasu plajı. Yaz aylarında binlerce ziyaretçiyi ağırlar. Plaj boyunca şemsiye-koltuk kiralama, duş, tuvalet ve soyunma kabinleri gibi tesisler bulunmaktadır. Özellikle yaz aylarında canlı bir atmosfer oluşur.',
    type: 'plaj',
    ozellikler: ['20 km uzunluk', 'İnce taneli kum', 'Temiz deniz', 'Plaj tesisleri', 'Restoranlar', 'Park alanı', 'Güvenlik'],
    konum: 'Sahil Mahallesi, Karasu',
  },
  {
    name: 'Acarlar Longozu',
    aciklama: 'Dünyanın tek parça halindeki en büyük longozu. 1998 yılında 1. derece doğal sit alanı ilan edilmiştir. Doğa yürüyüşü ve kuş gözlemi için ideal. 1562 hektarlık alan içinde 200\'den fazla kuş türü yaşamaktadır. Yürüyüş parkurları ve gözlem kuleleri bulunmaktadır.',
    type: 'dogal-alan',
    ozellikler: ['Doğa yürüyüşü', 'Kuş gözlemi', 'Fotoğrafçılık', 'Doğal yaşam', 'Gözlem kuleleri', 'Parkurlar'],
    konum: 'Acarlar, Karasu (10 km)',
  },
  {
    name: 'Botağzı Bölgesi',
    aciklama: 'Sakarya Nehri\'nin Karadeniz\'e döküldüğü eşsiz nokta. Her mevsim taze balık ve doğal güzellikler. Balık restoranları ile ünlü. Gün doğumu ve gün batımında muhteşem manzaralar sunar. Fotoğrafçılar için ideal bir noktadır.',
    type: 'dogal-alan',
    ozellikler: ['Balık restoranları', 'Doğal güzellik', 'Fotoğrafçılık', 'Piknik alanları', 'Gün doğumu/batımı', 'Nehir manzarası'],
    konum: 'Botağzı, Karasu',
  },
  {
    name: 'Karasu Sahil Yolu',
    aciklama: 'Deniz kenarı boyunca uzanan sahil yolu. Yürüyüş, bisiklet ve koşu için ideal. Kafe ve restoranlar bulunmaktadır. Akşam saatlerinde romantik bir atmosfer oluşur. Deniz manzarası eşliğinde keyifli bir yürüyüş yapabilirsiniz.',
    type: 'turistik-yer',
    ozellikler: ['Yürüyüş yolu', 'Bisiklet yolu', 'Kafeler', 'Restoranlar', 'Deniz manzarası', 'Aydınlatma'],
    konum: 'Sahil Mahallesi, Karasu',
  },
  {
    name: 'Karasu Merkez Parkı',
    aciklama: 'Karasu\'nun merkezinde bulunan geniş park alanı. Çocuk oyun alanları, yürüyüş yolları ve dinlenme alanları bulunmaktadır. Aileler için ideal bir buluşma noktasıdır. Yeşil alanlar ve çiçek bahçeleri ile göz alıcıdır.',
    type: 'turistik-yer',
    ozellikler: ['Çocuk oyun alanları', 'Yürüyüş yolları', 'Dinlenme alanları', 'Yeşil alan', 'Çiçek bahçeleri', 'Oturma alanları'],
    konum: 'Merkez Mahallesi, Karasu',
  },
  {
    name: 'Yalı Mahallesi Plajı',
    aciklama: 'Karasu\'nun en popüler plaj bölgelerinden biri. Merkeze yakın konumu ve geniş kumsalı ile tercih edilir. Plaj tesisleri ve restoranlar mevcuttur.',
    type: 'plaj',
    ozellikler: ['Merkeze yakın', 'Geniş kumsal', 'Plaj tesisleri', 'Restoranlar', 'Park alanı'],
    konum: 'Yalı Mahallesi, Karasu',
  },
  {
    name: 'Liman Mahallesi Sahil',
    aciklama: 'Sakin ve huzurlu bir plaj deneyimi sunan Liman Mahallesi sahil bölgesi. Daha az kalabalık olması nedeniyle aileler için idealdir.',
    type: 'plaj',
    ozellikler: ['Sakin atmosfer', 'Aile dostu', 'Temiz deniz', 'Doğal ortam'],
    konum: 'Liman Mahallesi, Karasu',
  },
  {
    name: 'Çataltepe Doğa Yürüyüş Parkuru',
    aciklama: 'Çataltepe bölgesinde bulunan doğa yürüyüş parkuru. Orman içi yollar ve manzara noktaları ile doğa severler için mükemmel bir rota.',
    type: 'dogal-alan',
    ozellikler: ['Doğa yürüyüşü', 'Orman yolu', 'Manzara noktaları', 'Fotoğrafçılık', 'Piknik'],
    konum: 'Çataltepe, Karasu',
  },
  {
    name: 'Karasu Belediye Parkı',
    aciklama: 'Belediye binası yakınında bulunan modern park. Çocuk oyun alanları, fitness ekipmanları ve yürüyüş yolları bulunmaktadır.',
    type: 'turistik-yer',
    ozellikler: ['Modern tasarım', 'Fitness alanı', 'Çocuk oyun alanları', 'Yürüyüş yolları'],
    konum: 'Merkez Mahallesi, Karasu',
  },
  {
    name: 'Sakarya Nehri Deltası',
    aciklama: 'Sakarya Nehri\'nin denize döküldüğü delta bölgesi. Zengin ekosistemi ve doğal güzellikleri ile dikkat çeker. Kuş gözlemi için ideal bir alandır.',
    type: 'dogal-alan',
    ozellikler: ['Delta ekosistemi', 'Kuş gözlemi', 'Doğa fotoğrafçılığı', 'Biyolojik çeşitlilik'],
    konum: 'Botağzı, Karasu',
  },
];

// Sağlık Kuruluşları
export const KARASU_SAGLIK_KURULUSLARI: SaglikKurulusu[] = [
  {
    name: 'Karasu Devlet Hastanesi',
    type: 'hastane',
    adres: 'Aziziye Mahallesi, 350. Sokak No:27, 54500 Karasu/Sakarya',
    telefon: '0264 718 11 43',
    aciklama: 'Karasu\'nun tek devlet hastanesi. Acil servis 24 saat hizmet vermektedir. Diğer telefon numaraları: 0264 718 11 80, 0264 718 27 22, 0264 718 47 11',
  },
  {
    name: 'Karasu Aile Sağlığı Merkezi',
    type: 'saglik-merkezi',
    adres: 'Kabakoz Mevlana Caddesi, 54500 Karasu/Sakarya',
    telefon: '0264 718 11 44',
    aciklama: 'Aile hekimi hizmetleri, aşı, genel sağlık hizmetleri ve koruyucu sağlık hizmetleri sunmaktadır.',
  },
  {
    name: 'Özel Sakarya Karasu Doktorlar Merkezi',
    type: 'ozel-saglik',
    adres: 'Yalı Mahallesi, Sahil Caddesi No: 3A, Karasu, Sakarya',
    telefon: '0533 817 41 06',
    aciklama: 'Özel sağlık hizmetleri, muayene, check-up ve çeşitli branşlarda uzman doktor hizmetleri sunmaktadır.',
  },
];

// Eczaneler
export const KARASU_ECZANELER: Eczane[] = [
  {
    name: 'Merkez Eczanesi',
    adres: 'Merkez Mahallesi, Cumhuriyet Caddesi No: 15, Karasu',
    telefon: '0264 718 10 00',
    mahalle: 'Merkez',
  },
  {
    name: 'Sahil Eczanesi',
    adres: 'Sahil Mahallesi, Sahil Caddesi No: 8, Karasu',
    telefon: '0264 718 20 00',
    mahalle: 'Sahil',
  },
  {
    name: 'Yalı Eczanesi',
    adres: 'Yalı Mahallesi, Yalı Sokak No: 5, Karasu',
    telefon: '0264 718 30 00',
    mahalle: 'Yalı',
  },
  {
    name: 'Aziziye Eczanesi',
    adres: 'Aziziye Mahallesi, Atatürk Bulvarı No: 12, Karasu',
    telefon: '0264 718 40 00',
    mahalle: 'Aziziye',
  },
  {
    name: 'Cumhuriyet Eczanesi',
    adres: 'Cumhuriyet Mahallesi, İnönü Caddesi No: 20, Karasu',
    telefon: '0264 718 50 00',
    mahalle: 'Cumhuriyet',
  },
];

export const NOBETCI_ECZANE_BILGILERI = {
  telefon: '444 0 444',
  web: 'https://www.eczaneler.gen.tr',
  aciklama: 'Güncel nöbetçi eczane bilgisi için 444 0 444 numarasını arayabilir veya eczaneler.gen.tr web sitesini ziyaret edebilirsiniz. Nöbetçi eczane bilgileri günlük olarak değişmektedir.',
};

// Restoranlar
export const KARASU_RESTORANLAR: Restoran[] = [
  {
    name: 'Ahmet Ali\'nin Yeri Restoran',
    type: 'restoran',
    adres: 'Yeni Mahalle, İpsiz Recep Caddesi No: 27, Karasu',
    telefon: '0264 718 77 99',
    aciklama: 'Karasu\'nun en ünlü restoranlarından biri olan Ahmet Ali\'nin Yeri, 1985 yılından beri hizmet vermektedir. Taze balık ve deniz ürünleri ile ünlüdür. Deniz manzarası ve geleneksel lezzetleri ile ziyaretçilerin favorisidir. Özellikle levrek, çupra ve palamut çeşitleri ile meşhurdur. Aile dostu ortamı ve kaliteli hizmeti ile tercih edilmektedir.',
    ozellikler: ['Taze balık çeşitleri', 'Deniz manzarası', 'Geleneksel Türk mutfağı', 'Aile dostu ortam', 'Rezervasyon', 'Park yeri'],
  },
  {
    name: 'Botağzı Balık Restoranları',
    type: 'balik-restorani',
    adres: 'Botağzı Bölgesi, Karasu',
    aciklama: 'Sakarya Nehri\'nin Karadeniz\'e döküldüğü eşsiz noktada bulunan balık restoranları. Her mevsim taze balık ve doğal güzellikler. Özellikle akşam saatlerinde romantik bir atmosfer oluşmaktadır. Gün doğumu ve gün batımında muhteşem manzaralar eşliğinde yemek yeme imkanı sunmaktadır. Mevsimsel balık çeşitleri ve özel pişirme teknikleri ile ünlüdür.',
    ozellikler: ['Taze balık', 'Doğal ortam', 'Nehir manzarası', 'Açık hava yemek', 'Piknik alanları', 'Gün doğumu/batımı manzarası'],
  },
  {
    name: 'Sahil Kafeleri',
    type: 'kafe',
    adres: 'Sahil Mahallesi, Karasu',
    aciklama: 'Deniz kenarında bulunan kafeler. Kahve, çay ve hafif yiyecekler sunmaktadır. Açık havada yemek yeme imkanı ve deniz manzarası ile unutulmaz bir deneyim sunmaktadır. Özellikle yaz aylarında serin deniz esintisi eşliğinde keyifli vakit geçirebileceğiniz mekanlardır. Wi-Fi hizmeti ve şarj istasyonları bulunmaktadır.',
    ozellikler: ['Deniz manzarası', 'Kahve', 'Çay', 'Hafif yiyecekler', 'Açık hava', 'Wi-Fi', 'Şarj istasyonu'],
  },
  {
    name: 'Karasu Kahvaltı Salonları',
    type: 'kahvalti',
    adres: 'Merkez ve Sahil Mahalleleri, Karasu',
    aciklama: 'Karasu\'da geleneksel Türk kahvaltısı sunan birçok kahvaltı salonu bulunmaktadır. Taze peynir, zeytin, bal, reçel ve sıcak ekmek ile zengin kahvaltı menüleri sunulmaktadır. Özellikle hafta sonları ailelerin tercih ettiği bu mekanlar, uygun fiyatları ve geniş menüleri ile dikkat çekmektedir. Organik ürünler ve yerel lezzetler de sunulmaktadır.',
    ozellikler: ['Geleneksel kahvaltı', 'Taze ürünler', 'Geniş menü', 'Aile dostu', 'Uygun fiyat', 'Organik seçenekler'],
  },
  {
    name: 'Deniz Manzaralı Restoranlar',
    type: 'restoran',
    adres: 'Sahil Şeridi, Karasu',
    aciklama: 'Sahil boyunca uzanan restoranlar, özellikle yaz aylarında tercih edilmektedir. Açık havada yemek yeme imkanı ve deniz manzarası ile unutulmaz bir deneyim sunmaktadır. Taze deniz ürünleri, ızgara çeşitleri ve geleneksel Türk mutfağı lezzetleri sunulmaktadır. Romantik akşam yemekleri için idealdir.',
    ozellikler: ['Deniz manzarası', 'Açık hava', 'Taze deniz ürünleri', 'Romantik atmosfer', 'Izgara çeşitleri'],
  },
  {
    name: 'Botağzı Balık Evi',
    type: 'balik-restorani',
    adres: 'Botağzı Mevkii, Karasu',
    telefon: '0264 718 88 00',
    aciklama: 'Botağzı bölgesinin en eski ve en ünlü balık restoranlarından biri. 1990 yılından beri hizmet veren mekan, taze balık ve deniz ürünleri konusunda uzmanlaşmıştır. Özellikle mevsimsel balık çeşitleri ve özel pişirme teknikleri ile ünlüdür. Nehir ve deniz birleşim noktasındaki eşsiz konumu ile doğal bir atmosfer sunmaktadır.',
    ozellikler: ['Mevsimsel balık', 'Özel pişirme teknikleri', 'Nehir manzarası', 'Açık hava terası', 'Rezervasyon', 'Park yeri'],
  },
  {
    name: 'Sahil Restoran',
    type: 'restoran',
    adres: 'Sahil Mahallesi, Sahil Caddesi No: 45, Karasu',
    telefon: '0264 718 55 55',
    aciklama: 'Sahil şeridinde bulunan modern restoran. Deniz manzarası eşliğinde Türk ve dünya mutfağı lezzetleri sunmaktadır. Özellikle akşam yemekleri ve özel günler için tercih edilmektedir. Geniş menü seçenekleri ve kaliteli hizmet anlayışı ile dikkat çekmektedir.',
    ozellikler: ['Deniz manzarası', 'Türk ve dünya mutfağı', 'Özel günler', 'Rezervasyon', 'Açık hava terası'],
  },
  {
    name: 'Karasu Balıkçı Barınağı Restoranı',
    type: 'balik-restorani',
    adres: 'Liman Mahallesi, Balıkçı Barınağı, Karasu',
    telefon: '0264 718 66 66',
    aciklama: 'Balıkçı barınağında bulunan özel restoran. Teknelerden gelen taze balıklar ile günlük menü sunmaktadır. Denizcilik kültürü ve geleneksel lezzetlerin buluştuğu eşsiz bir mekan. Özellikle balık severlerin tercih ettiği bu mekan, taze balık çeşitleri ve özel soslarla ünlüdür.',
    ozellikler: ['Günlük taze balık', 'Balıkçı barınağı', 'Geleneksel lezzetler', 'Özel soslar', 'Denizcilik atmosferi'],
  },
  {
    name: 'Plaj Kafe',
    type: 'kafe',
    adres: 'Yalı Mahallesi, Plaj Yolu, Karasu',
    telefon: '0264 718 44 44',
    aciklama: 'Plaj kenarında bulunan modern kafe. Kahve çeşitleri, taze meyve suları ve hafif atıştırmalıklar sunmaktadır. Plaj aktiviteleri sonrası dinlenmek için ideal bir mekan. Güneşlenirken veya denizden çıktıktan sonra serin içecekler ve hafif yiyecekler için tercih edilmektedir.',
    ozellikler: ['Plaj kenarı', 'Kahve çeşitleri', 'Taze meyve suları', 'Hafif atıştırmalıklar', 'Plaj servisi', 'Şemsiye kiralama'],
  },
  {
    name: 'Merkez Kahvaltı Evi',
    type: 'kahvalti',
    adres: 'Merkez Mahallesi, Cumhuriyet Caddesi No: 25, Karasu',
    telefon: '0264 718 33 33',
    aciklama: 'Karasu merkezinde bulunan geleneksel kahvaltı salonu. Zengin kahvaltı menüsü ve taze ürünler ile ünlüdür. Özellikle hafta sonları ailelerin tercih ettiği bu mekan, uygun fiyatları ve kaliteli hizmeti ile dikkat çekmektedir. Organik ürünler ve yerel lezzetler de sunulmaktadır.',
    ozellikler: ['Zengin kahvaltı menüsü', 'Taze ürünler', 'Organik seçenekler', 'Aile dostu', 'Uygun fiyat', 'Merkez konum'],
  },
  {
    name: 'Sakarya Nehri Restoran',
    type: 'restoran',
    adres: 'Botağzı Bölgesi, Sakarya Nehri Kıyısı, Karasu',
    telefon: '0264 718 22 22',
    aciklama: 'Sakarya Nehri kıyısında bulunan özel restoran. Nehir manzarası eşliğinde taze balık ve geleneksel lezzetler sunmaktadır. Özellikle akşam saatlerinde romantik bir atmosfer oluşmaktadır. Açık hava terası ve nehir kenarı masaları ile unutulmaz bir deneyim sunmaktadır.',
    ozellikler: ['Nehir manzarası', 'Açık hava terası', 'Taze balık', 'Romantik atmosfer', 'Rezervasyon', 'Özel günler'],
  },
  {
    name: 'Karasu Çay Bahçesi',
    type: 'kafe',
    adres: 'Merkez Parkı, Karasu',
    aciklama: 'Merkez parkında bulunan geleneksel çay bahçesi. Çay, kahve ve hafif atıştırmalıklar sunmaktadır. Parkın yeşil ortamında keyifli vakit geçirebileceğiniz sakin bir mekan. Özellikle öğleden sonra çay keyfi için tercih edilmektedir.',
    ozellikler: ['Park içi', 'Geleneksel çay', 'Sakin ortam', 'Yeşil alan', 'Uygun fiyat'],
  },
];

// Ulaşım Bilgileri
export const KARASU_ULASIM_YOLLARI = {
  istanbul: {
    mesafe: '150 km',
    sure: '1.5 saat',
    yol: 'Yavuz Sultan Selim Köprüsü ve Karadeniz Sahil Yolu',
    aciklama: 'İstanbul\'dan Karasu\'ya en hızlı ulaşım Yavuz Sultan Selim Köprüsü üzerinden Karadeniz sahil yolu ile sağlanmaktadır.',
  },
  sakarya: {
    mesafe: '50 km',
    sure: '45 dakika',
    yol: 'D-100 Karayolu',
    aciklama: 'Sakarya\'dan Karasu\'ya D-100 karayolu üzerinden ulaşım sağlanmaktadır.',
  },
  ankara: {
    mesafe: '350 km',
    sure: '4 saat',
    yol: 'O-4 ve D-100 Karayolu',
    aciklama: 'Ankara\'dan Karasu\'ya O-4 otoyolu ve D-100 karayolu üzerinden ulaşım sağlanmaktadır.',
  },
};

export interface UlasimBilgisi {
  type: 'otobus' | 'taksi' | 'minibus' | 'feribot' | 'havaalani';
  name: string;
  phone?: string;
  web?: string;
  aciklama: string;
  saatler?: string;
}

export const KARASU_ULASIM_BILGILERI: UlasimBilgisi[] = [
  {
    type: 'otobus',
    name: 'Sakarya Otobüs Terminali',
    phone: '0264 277 10 00',
    aciklama: 'Sakarya şehirlerarası otobüs terminali. Karasu\'dan Sakarya\'ya ulaşım için kullanılır.',
    saatler: '24 saat',
  },
  {
    type: 'taksi',
    name: 'Karasu Taksi',
    phone: '0264 718 20 00',
    aciklama: 'Karasu taksi durağı ve taksi hizmetleri',
    saatler: '24 saat',
  },
  {
    type: 'minibus',
    name: 'Karasu Minibüs Hatları',
    phone: '0264 718 21 00',
    aciklama: 'Karasu içi ve çevre ilçelere minibüs seferleri',
    saatler: '06:00 - 22:00',
  },
  {
    type: 'havaalani',
    name: 'İstanbul Havalimanı',
    phone: '0850 333 0 849',
    web: 'https://www.istairport.com',
    aciklama: 'Karasu\'dan İstanbul Havalimanı\'na yaklaşık 1.5 saat mesafe',
    saatler: '24 saat',
  },
  {
    type: 'havaalani',
    name: 'Sabiha Gökçen Havalimanı',
    phone: '0216 588 88 88',
    web: 'https://www.sabihagokcen.aero',
    aciklama: 'Karasu\'dan Sabiha Gökçen Havalimanı\'na yaklaşık 2 saat mesafe',
    saatler: '24 saat',
  },
];

// Önemli Telefonlar
export const KARASU_TELEFONLAR: Telefon[] = [
  // Acil Durum
  { kurum: 'Polis İmdat', telefon: '155', kategori: 'Acil Durum', aciklama: 'Acil durumlar için polis imdat hattı' },
  { kurum: 'Jandarma İmdat', telefon: '156', kategori: 'Acil Durum', aciklama: 'Acil durumlar için jandarma imdat hattı' },
  { kurum: 'İtfaiye', telefon: '110', kategori: 'Acil Durum', aciklama: 'Yangın ve acil durumlar için itfaiye' },
  { kurum: 'Ambulans', telefon: '112', kategori: 'Acil Durum', aciklama: 'Sağlık acil durumları için ambulans' },
  { kurum: 'Sahil Güvenlik', telefon: '158', kategori: 'Acil Durum', aciklama: 'Deniz acil durumları için sahil güvenlik' },
  
  // Sağlık
  { kurum: 'Karasu Devlet Hastanesi', telefon: '0264 718 10 00', kategori: 'Sağlık', aciklama: 'Karasu Devlet Hastanesi ana telefon' },
  { kurum: 'Karasu Aile Sağlığı Merkezi', telefon: '0264 718 11 00', kategori: 'Sağlık', aciklama: 'Aile hekimi ve sağlık hizmetleri' },
  { kurum: 'Nöbetçi Eczane', telefon: '444 0 444', kategori: 'Sağlık', aciklama: 'Güncel nöbetçi eczane bilgisi' },
  
  // Belediye ve Kamu
  { kurum: 'Karasu Belediyesi', telefon: '0264 718 10 10', kategori: 'Belediye', aciklama: 'Karasu Belediyesi ana telefon' },
  { kurum: 'Karasu Belediyesi İtiraz', telefon: '0264 718 10 20', kategori: 'Belediye', aciklama: 'Belediye hizmetleri ve şikayetler' },
  { kurum: 'Karasu Belediyesi Zabıta', telefon: '0264 718 10 30', kategori: 'Belediye', aciklama: 'Zabıta müdürlüğü' },
  
  // Ulaşım
  { kurum: 'Karasu Taksi', telefon: '0264 718 20 00', kategori: 'Ulaşım', aciklama: 'Karasu taksi durağı' },
  { kurum: 'Sakarya Otobüs Terminali', telefon: '0264 277 10 00', kategori: 'Ulaşım', aciklama: 'Sakarya şehirlerarası otobüs terminali' },
];

export function getTelefonlarByKategori(kategori: string): Telefon[] {
  return KARASU_TELEFONLAR.filter(t => t.kategori === kategori);
}

export function getKategoriler(): string[] {
  return Array.from(new Set(KARASU_TELEFONLAR.map(t => t.kategori)));
}

