/**
 * Listing Description Generation Prompt
 * 
 * STRICT RULES:
 * - Factual property description (as if showing in person)
 * - Max 6-10 short paragraphs
 * - NO blog structure (NO H2/H3)
 * - NO conclusion paragraph
 * - NO FAQ
 * - NO marketing clichés
 * - NO "hayalinizdeki", "tatil cenneti", "son yıllarda"
 */

export const LISTING_DESCRIPTION_SYSTEM_PROMPT = `Sen Karasu'da 15 yıldır çalışan profesyonel bir emlak danışmanısın. Müşterilere gayrimenkulü yerinde gösterirken nasıl anlatırsan, öyle yaz.

KURALLAR (KESINLIKLE UYULMALI):
- Sadece gerçek bilgiler, özellikler, konum avantajları
- 6-10 kısa paragraf (her biri 2-4 cümle)
- Blog yapısı YOK (H2, H3, başlıklar YOK)
- Sonuç paragrafı YOK
- FAQ YOK
- Pazarlama klişeleri YOK ("hayalinizdeki", "tatil cenneti", "son yıllarda", "eşsiz fırsat")
- Yerel bilgi sadece kısaca ve ilgiliyse
- Sakin, güvenilir, profesyonel ton
- HTML: Sadece <p> etiketleri kullan

ÖRNEK İYİ AÇIKLAMA:
<p>${3}+1 daire, ${120} m² net alan. Salon ve mutfak açık plan, güney cephe.</p>
<p>${3} yatak odası, ${2} banyo. Ana yatak odası balkonlu, diğer odalar ferah.</p>
<p>Kombi ile ısıtma, PVC doğramalar, izolasyon mevcut.</p>
<p>${'Merkez'} mahallesi, ${'okul'} ve ${'market'} yürüme mesafesinde.</p>
<p>Toplu taşıma durağı 200 metre, ${'sahil'} 500 metre.</p>
<p>Site içinde otopark, asansör, güvenlik var.</p>

ÖRNEK KÖTÜ AÇIKLAMA (YAPMA):
<h2>Hayalinizdeki Tatil Cenneti</h2>
<p>Son yıllarda Karasu emlak piyasası...</p>
<p>Bu eşsiz fırsatı kaçırmayın!</p>
SSS: Sık Sorulan Sorular...`;

export const LISTING_DESCRIPTION_USER_PROMPT = (listing: {
  title: string;
  property_type: string;
  status: 'satilik' | 'kiralik';
  location_neighborhood: string;
  location_district: string;
  price_amount?: number;
  features: {
    rooms?: number;
    bathrooms?: number;
    sizeM2?: number;
    floor?: number;
    buildingAge?: number;
    heating?: string;
    furnished?: boolean;
    balcony?: boolean;
    parking?: boolean;
    elevator?: boolean;
    seaView?: boolean;
  };
}) => {
  const propertyTypeLabel = listing.property_type === 'daire' ? 'Daire' 
    : listing.property_type === 'villa' ? 'Villa'
    : listing.property_type === 'yazlik' ? 'Yazlık'
    : listing.property_type === 'arsa' ? 'Arsa'
    : 'Gayrimenkul';

  const statusLabel = listing.status === 'satilik' ? 'satılık' : 'kiralık';

  return `Aşağıdaki ${statusLabel} ${propertyTypeLabel.toLowerCase()} için profesyonel bir açıklama yaz:

BAŞLIK: ${listing.title}
TİP: ${propertyTypeLabel}
DURUM: ${statusLabel}
KONUM: ${listing.location_neighborhood}, ${listing.location_district}
FİYAT: ${listing.price_amount ? `₺${listing.price_amount.toLocaleString('tr-TR')}` : 'Belirtilmemiş'}

ÖZELLİKLER:
${listing.features.rooms ? `- Oda: ${listing.features.rooms}+1` : ''}
${listing.features.bathrooms ? `- Banyo: ${listing.features.bathrooms}` : ''}
${listing.features.sizeM2 ? `- Alan: ${listing.features.sizeM2} m²` : ''}
${listing.features.floor ? `- Kat: ${listing.features.floor}` : ''}
${listing.features.buildingAge ? `- Bina Yaşı: ${listing.features.buildingAge} yıl` : ''}
${listing.features.heating ? `- Isıtma: ${listing.features.heating}` : ''}
${listing.features.furnished ? `- Eşyalı: ${listing.features.furnished ? 'Evet' : 'Hayır'}` : ''}
${listing.features.balcony ? `- Balkon: Var` : ''}
${listing.features.parking ? `- Otopark: Var` : ''}
${listing.features.elevator ? `- Asansör: Var` : ''}
${listing.features.seaView ? `- Deniz Manzarası: Var` : ''}

YAZIM KURALLARI:
1. Sadece <p> etiketleri kullan (H2, H3, liste YOK)
2. 6-10 kısa paragraf (her biri 2-4 cümle)
3. Özellikleri, konumu, kullanılabilirliği anlat
4. Mahalle bilgisi sadece kısaca ve ilgiliyse
5. Sonuç paragrafı YOK
6. FAQ YOK
7. Pazarlama klişeleri YOK
8. Sakin, profesyonel, güvenilir ton

Sadece HTML formatında açıklama döndür, başka açıklama yapma.`;
};
