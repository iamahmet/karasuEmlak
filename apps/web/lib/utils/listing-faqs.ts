/**
 * Listing FAQ Generator
 * 
 * Generates SEO-optimized FAQ questions and answers for property listings
 */

export interface FAQ {
  question: string;
  answer: string;
}

interface ListingData {
  title: string;
  property_type: string;
  status: 'satilik' | 'kiralik';
  location_neighborhood?: string;
  location_district?: string;
  price_amount?: number | string;
  size_m2?: number;
  features?: {
    rooms?: number;
    bathrooms?: number;
    buildingAge?: number;
    floor?: number;
    totalFloors?: number;
    balcony?: boolean;
    parking?: boolean;
    elevator?: boolean;
    seaView?: boolean;
    furnished?: boolean;
  };
}

/**
 * Generate SEO-optimized FAQs for a listing
 */
export function generateListingFAQs(listing: ListingData): FAQ[] {
  const faqs: FAQ[] = [];
  const isRental = listing.status === 'kiralik';
  const propertyType = listing.property_type || 'daire';
  const neighborhood = listing.location_neighborhood || 'Karasu';
  const district = listing.location_district || 'Karasu';
  const price = listing.price_amount ? Number(listing.price_amount) : null;
  const size = listing.size_m2 || listing.features?.rooms;

  // FAQ 1: Property Type & Location
  const propertyTypeName = 
    propertyType === 'villa' ? 'villa' :
    propertyType === 'yazlik' ? 'yazlık' :
    propertyType === 'arsa' ? 'arsa' :
    propertyType === 'daire' ? 'daire' :
    'emlak';

  faqs.push({
    question: `${neighborhood} ${district} ${isRental ? 'Kiralık' : 'Satılık'} ${propertyTypeName.charAt(0).toUpperCase() + propertyTypeName.slice(1)} Hakkında Bilgi`,
    answer: `${neighborhood}, ${district} bölgesinde bulunan bu ${isRental ? 'kiralık' : 'satılık'} ${propertyTypeName}, ${district} ilçesinin en popüler mahallelerinden birinde konumlanmıştır. ${neighborhood} mahallesi, ${district} ilçesinin merkezi konumunda olup, ulaşım ve sosyal imkanlar açısından avantajlı bir bölgedir. Bu ${propertyTypeName} için detaylı bilgi almak ve görüntülemek için +90 546 639 54 61 numaralı telefondan bize ulaşabilirsiniz.`
  });

  // FAQ 2: Price & Payment
  if (price) {
    const formattedPrice = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);

    if (isRental) {
      faqs.push({
        question: `${neighborhood} Kiralık ${propertyTypeName.charAt(0).toUpperCase() + propertyTypeName.slice(1)} Kira Fiyatı Ne Kadar?`,
        answer: `Bu ${neighborhood} ${district} kiralık ${propertyTypeName} için aylık kira bedeli ${formattedPrice} olarak belirlenmiştir. Kira bedeli, ${propertyTypeName}ın konumu, büyüklüğü ve özelliklerine göre piyasa değerine uygun olarak belirlenmiştir. Kira sözleşmesi, depozito ve diğer detaylar hakkında bilgi almak için +90 546 639 54 61 numaralı telefondan bizimle iletişime geçebilirsiniz.`
      });
    } else {
      faqs.push({
        question: `${neighborhood} Satılık ${propertyTypeName.charAt(0).toUpperCase() + propertyTypeName.slice(1)} Fiyatı Ne Kadar?`,
        answer: `Bu ${neighborhood} ${district} satılık ${propertyTypeName} için satış fiyatı ${formattedPrice} olarak belirlenmiştir. Fiyat, ${propertyTypeName}ın konumu, büyüklüğü, özellikleri ve piyasa değerine göre belirlenmiştir. Kredi imkanları, ödeme planları ve diğer finansal seçenekler hakkında detaylı bilgi almak için +90 546 639 54 61 numaralı telefondan bizimle iletişime geçebilirsiniz.`
      });
    }
  }

  // FAQ 3: Property Features
  const features = listing.features || {};
  const featureList: string[] = [];
  
  if (features.rooms) featureList.push(`${features.rooms} oda`);
  if (features.bathrooms) featureList.push(`${features.bathrooms} banyo`);
  if (features.balcony) featureList.push('balkon');
  if (features.parking) featureList.push('otopark');
  if (features.elevator) featureList.push('asansör');
  if (features.seaView) featureList.push('deniz manzarası');
  if (features.furnished) featureList.push('eşyalı');
  if (features.buildingAge) featureList.push(`${features.buildingAge} yıllık bina`);
  if (features.floor) featureList.push(`${features.floor}. kat`);

  if (featureList.length > 0) {
    faqs.push({
      question: `${neighborhood} ${isRental ? 'Kiralık' : 'Satılık'} ${propertyTypeName.charAt(0).toUpperCase() + propertyTypeName.slice(1)} Özellikleri Nelerdir?`,
      answer: `Bu ${neighborhood} ${district} ${isRental ? 'kiralık' : 'satılık'} ${propertyTypeName} ${featureList.join(', ')} özelliklerine sahiptir. ${size ? `Toplam ${size} m²` : ''} büyüklüğündeki ${propertyTypeName}, modern yaşam standartlarına uygun olarak tasarlanmıştır. Detaylı özellik listesi ve görsel inceleme için +90 546 639 54 61 numaralı telefondan randevu alabilirsiniz.`
    });
  }

  // FAQ 4: Location & Transportation
  faqs.push({
    question: `${neighborhood} ${district} Bölgesi Ulaşım ve Konum Avantajları Nelerdir?`,
    answer: `${neighborhood} mahallesi, ${district} ilçesinin merkezi konumunda yer almakta olup, şehir merkezine, sahil bölgesine ve önemli noktalara kolay ulaşım imkanı sunmaktadır. Bölge, sosyal tesisler, okullar, sağlık kuruluşları ve alışveriş merkezlerine yakın mesafededir. ${district} ilçesinin gelişen altyapısı ve ulaşım ağı sayesinde, ${neighborhood} mahallesi emlak yatırımları için cazip bir bölgedir. Konum hakkında detaylı bilgi için +90 546 639 54 61 numaralı telefondan bizimle iletişime geçebilirsiniz.`
  });

  // FAQ 5: Viewing & Contact
  faqs.push({
    question: `${neighborhood} ${isRental ? 'Kiralık' : 'Satılık'} ${propertyTypeName.charAt(0).toUpperCase() + propertyTypeName.slice(1)} Görüntülemek İçin Nasıl İletişime Geçebilirim?`,
    answer: `${neighborhood} ${district} ${isRental ? 'kiralık' : 'satılık'} ${propertyTypeName} görüntülemek ve detaylı bilgi almak için +90 546 639 54 61 numaralı telefondan bizimle iletişime geçebilirsiniz. Randevu alarak ${propertyTypeName}ı yerinde inceleyebilir, tüm sorularınızı sorabilir ve ${isRental ? 'kira' : 'satın alma'} süreci hakkında detaylı bilgi alabilirsiniz. Karasu Emlak olarak, size en iyi hizmeti sunmak için buradayız.`
  });

  // FAQ 6: Investment Potential (for sale only)
  if (!isRental && propertyType !== 'arsa') {
    faqs.push({
      question: `${neighborhood} ${district} Satılık ${propertyTypeName.charAt(0).toUpperCase() + propertyTypeName.slice(1)} Yatırım Potansiyeli Nasıl?`,
      answer: `${neighborhood} mahallesi, ${district} ilçesinin gelişen bölgelerinden biri olup, emlak yatırımları için potansiyel sunmaktadır. Bölgenin altyapı gelişimi, turizm potansiyeli ve şehirleşme projeleri, ${propertyTypeName} yatırımlarının değer artış potansiyelini desteklemektedir. Yatırım danışmanlığı ve piyasa analizi için +90 546 639 54 61 numaralı telefondan uzman ekibimizle iletişime geçebilirsiniz.`
    });
  }

  return faqs;
}
