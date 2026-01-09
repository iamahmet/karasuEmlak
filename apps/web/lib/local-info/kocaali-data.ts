/**
 * Kocaali Local Information Data
 * Static data for Kocaali subpages
 */

import type { GezilecekYer, SaglikKurulusu, Eczane, Restoran, Telefon, UlasimYolu } from './karasu-data';

// Gezilecek Yerler
export const KOCAALI_GEZILECEK_YERLER: GezilecekYer[] = [
  {
    name: 'Kocaali Plajı',
    aciklama: '12 km uzunluğundaki ince taneli kumu ve temiz deniziyle ünlü Kocaali plajı. Sakin atmosferi ve doğal güzellikleriyle dikkat çeker.',
    type: 'plaj',
    ozellikler: ['12 km uzunluk', 'İnce taneli kum', 'Temiz deniz', 'Sakin atmosfer', 'Doğal güzellik'],
    konum: 'Sahil Mahallesi, Kocaali',
  },
  {
    name: 'Kocaali Sahil Yolu',
    aciklama: 'Deniz kenarı boyunca uzanan sahil yolu. Yürüyüş, bisiklet ve koşu için ideal. Kafe ve restoranlar bulunmaktadır.',
    type: 'turistik-yer',
    ozellikler: ['Yürüyüş yolu', 'Bisiklet yolu', 'Kafeler', 'Restoranlar', 'Deniz manzarası'],
    konum: 'Sahil Mahallesi, Kocaali',
  },
  {
    name: 'Kocaali Merkez Parkı',
    aciklama: 'Kocaali\'nin merkezinde bulunan geniş park alanı. Çocuk oyun alanları, yürüyüş yolları ve dinlenme alanları bulunmaktadır.',
    type: 'parklar',
    ozellikler: ['Çocuk oyun alanları', 'Yürüyüş yolları', 'Dinlenme alanları', 'Yeşil alan'],
    konum: 'Merkez Mahallesi, Kocaali',
  },
  {
    name: 'Kocaali Doğa Yürüyüş Parkurları',
    aciklama: 'Kocaali çevresinde doğa yürüyüşü için ideal parkurlar. Orman içi yollar ve deniz kenarı yürüyüş yolları bulunmaktadır.',
    type: 'dogal-alan',
    ozellikler: ['Doğa yürüyüşü', 'Orman yolları', 'Deniz kenarı yolları', 'Fotoğrafçılık'],
    konum: 'Kocaali çevresi',
  },
];

// Sağlık Kuruluşları
export const KOCAALI_SAGLIK_KURULUSLARI: SaglikKurulusu[] = [
  {
    name: 'Kocaali İlçe Devlet Hastanesi',
    type: 'hastane',
    adres: 'Akçakoca Karasu Yolu, 54800 Kocaali/Sakarya',
    telefon: '0264 812 10 18',
    aciklama: 'Kocaali\'nin tek devlet hastanesi. Acil servis 24 saat hizmet vermektedir. Genel muayene, acil servis ve temel sağlık hizmetleri sunulmaktadır.',
  },
  {
    name: 'Kocaali Aile Sağlığı Merkezi',
    type: 'saglik-merkezi',
    adres: 'Merkez Mahallesi, Kocaali/Sakarya',
    telefon: '0264 812 10 19',
    aciklama: 'Aile hekimi hizmetleri, aşı, genel sağlık hizmetleri ve koruyucu sağlık hizmetleri sunmaktadır.',
  },
  {
    name: 'Kocaali Özel Sağlık Merkezleri',
    type: 'ozel-saglik',
    adres: 'Merkez Mahallesi, Kocaali/Sakarya',
    telefon: '0264 812 10 20',
    aciklama: 'Özel sağlık hizmetleri, muayene, check-up ve çeşitli branşlarda uzman doktor hizmetleri sunan sağlık merkezleri.',
  },
];

// Eczaneler
export const KOCAALI_ECZANELER: Eczane[] = [
  {
    name: 'Kocaali Merkez Eczanesi',
    adres: 'Merkez Mahallesi, Atatürk Caddesi No: 15, Kocaali',
    telefon: '0264 511 20 30',
    mahalle: 'Merkez',
  },
  {
    name: 'Sahil Eczanesi',
    adres: 'Sahil Mahallesi, Sahil Caddesi No: 8, Kocaali',
    telefon: '0264 511 20 31',
    mahalle: 'Sahil',
  },
  {
    name: 'Kocaali Sağlık Eczanesi',
    adres: 'Merkez Mahallesi, Cumhuriyet Caddesi No: 22, Kocaali',
    telefon: '0264 511 20 32',
    mahalle: 'Merkez',
  },
];

// Restoranlar
export const KOCAALI_RESTORANLAR: Restoran[] = [
  {
    name: 'Kocaali Balık Restoranları',
    type: 'balik-restorani',
    adres: 'Sahil Mahallesi, Kocaali',
    telefon: '0264 511 20 40',
    aciklama: 'Kocaali\'nin en ünlü balık restoranları. Taze balık ve deniz ürünleri ile ünlüdür. Deniz manzarası ve geleneksel lezzetleri ile ziyaretçilerin favorisidir.',
    ozellikler: ['Taze balık çeşitleri', 'Deniz manzarası', 'Geleneksel Türk mutfağı', 'Aile dostu ortam'],
  },
  {
    name: 'Sahil Kafeleri',
    type: 'kafe',
    adres: 'Sahil Mahallesi, Kocaali',
    aciklama: 'Deniz kenarında bulunan kafeler. Kahve, çay ve hafif yiyecekler sunmaktadır. Açık havada yemek yeme imkanı ve deniz manzarası ile unutulmaz bir deneyim sunmaktadır.',
    ozellikler: ['Deniz manzarası', 'Kahve', 'Çay', 'Hafif yiyecekler', 'Açık hava', 'Wi-Fi'],
  },
  {
    name: 'Kocaali Kahvaltı Salonları',
    type: 'kahvalti',
    adres: 'Merkez ve Sahil Mahalleleri, Kocaali',
    aciklama: 'Kocaali\'de geleneksel Türk kahvaltısı sunan birçok kahvaltı salonu bulunmaktadır. Taze peynir, zeytin, bal, reçel ve sıcak ekmek ile zengin kahvaltı menüleri sunulmaktadır.',
    ozellikler: ['Geleneksel kahvaltı', 'Taze ürünler', 'Geniş menü', 'Aile dostu', 'Uygun fiyat'],
  },
  {
    name: 'Deniz Manzaralı Restoranlar',
    type: 'restoran',
    adres: 'Sahil Mahallesi, Kocaali',
    aciklama: 'Deniz kenarında bulunan restoranlar. Türk ve dünya mutfağından seçenekler sunmaktadır. Özellikle akşam saatlerinde romantik bir atmosfer oluşmaktadır.',
    ozellikler: ['Deniz manzarası', 'Türk mutfağı', 'Dünya mutfağı', 'Romantik atmosfer', 'Açık hava'],
  },
];

// Ulaşım Bilgileri
export const KOCAALI_ULASIM_YOLLARI = {
  istanbul: {
    mesafe: '180 km',
    sure: '2.5 saat',
    yol: 'TEM Otoyolu üzerinden',
  },
  sakarya: {
    mesafe: '45 km',
    sure: '45 dakika',
    yol: 'D-100 Karayolu',
  },
  ankara: {
    mesafe: '350 km',
    sure: '4.5 saat',
    yol: 'TEM ve D-100 Karayolu',
  },
};

export interface UlasimBilgisi {
  baslik: string;
  aciklama: string;
  detaylar?: string[];
  type?: 'otobus' | 'taksi' | 'minibus' | 'feribot' | 'havaalani';
  name?: string;
  phone?: string;
  web?: string;
  saatler?: string;
}

export const KOCAALI_ULASIM_BILGILERI: UlasimBilgisi[] = [
  {
    baslik: 'İstanbul\'dan Kocaali\'ye Ulaşım',
    aciklama: 'İstanbul\'dan Kocaali\'ye ulaşım için TEM Otoyolu kullanılabilir. Yaklaşık 2.5 saat sürmektedir.',
    detaylar: [
      'TEM Otoyolu üzerinden',
      'Yaklaşık 180 km mesafe',
      '2.5 saat süre',
      'Özel araç ile ulaşım',
    ],
  },
  {
    baslik: 'Sakarya\'dan Kocaali\'ye Ulaşım',
    aciklama: 'Sakarya\'dan Kocaali\'ye D-100 Karayolu üzerinden ulaşılabilir. Yaklaşık 45 dakika sürmektedir.',
    detaylar: [
      'D-100 Karayolu üzerinden',
      'Yaklaşık 45 km mesafe',
      '45 dakika süre',
      'Özel araç ile ulaşım',
    ],
  },
  {
    baslik: 'Toplu Taşıma',
    aciklama: 'Kocaali\'ye Sakarya\'dan düzenli otobüs seferleri bulunmaktadır.',
    detaylar: [
      'Sakarya\'dan otobüs seferleri',
      'Düzenli seferler',
      'İlçe merkezine ulaşım',
    ],
  },
];

// Önemli Telefonlar
export const KOCAALI_TELEFONLAR: Telefon[] = [
  {
    kurum: 'Acil Servis',
    telefon: '112',
    kategori: 'Acil',
    aciklama: 'Acil durumlar için',
  },
  {
    kurum: 'Kocaali Devlet Hastanesi',
    telefon: '0264 511 20 00',
    kategori: 'Sağlık',
    aciklama: 'Acil servis 24 saat',
  },
  {
    kurum: 'Kocaali Belediyesi',
    telefon: '0264 511 20 50',
    kategori: 'Belediye',
    aciklama: 'Belediye hizmetleri',
  },
  {
    kurum: 'Kocaali Emniyet Müdürlüğü',
    telefon: '0264 511 20 60',
    kategori: 'Güvenlik',
    aciklama: 'Polis hizmetleri',
  },
  {
    kurum: 'Kocaali İtfaiye',
    telefon: '110',
    kategori: 'Acil',
    aciklama: 'Yangın ve acil durumlar',
  },
  {
    kurum: 'Kocaali Jandarma',
    telefon: '0264 511 20 70',
    kategori: 'Güvenlik',
    aciklama: 'Jandarma hizmetleri',
  },
  {
    kurum: 'Kocaali PTT',
    telefon: '0264 511 20 80',
    kategori: 'PTT',
    aciklama: 'Posta ve kargo hizmetleri',
  },
  {
    kurum: 'Kocaali Vergi Dairesi',
    telefon: '0264 511 20 90',
    kategori: 'Vergi',
    aciklama: 'Vergi işlemleri',
  },
];

export function getKocaaliTelefonlarByKategori(kategori: string): Telefon[] {
  return KOCAALI_TELEFONLAR.filter(t => t.kategori === kategori);
}

export function getKocaaliTelefonKategorileri(): string[] {
  return Array.from(new Set(KOCAALI_TELEFONLAR.map(t => t.kategori)));
}
