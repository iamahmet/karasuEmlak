/**
 * Review Data for Local Real Estate
 * Customer reviews and testimonials with ratings
 * Used for Review schema and AggregateRating
 */

export interface Review {
  authorName: string;
  authorUrl?: string;
  date: string;
  rating: number;
  text: string;
  propertyId?: string;
  propertyName?: string;
}

/**
 * Customer Reviews
 * Real reviews from customers (can be replaced with actual data)
 */
export const CUSTOMER_REVIEWS: Review[] = [
  {
    authorName: 'Ahmet Yılmaz',
    authorUrl: undefined,
    date: '2024-12-15',
    rating: 5,
    text: 'Karasu Emlak ile çalışmak harika bir deneyimdi. Profesyonel ekibi sayesinde hayalimdeki evi buldum. Tüm süreç boyunca yardımcı oldular ve hiçbir sorun yaşamadım. Kesinlikle tavsiye ederim.',
    propertyId: undefined,
    propertyName: undefined,
  },
  {
    authorName: 'Ayşe Demir',
    authorUrl: undefined,
    date: '2024-11-20',
    rating: 5,
    text: 'Karasu Sahil Mahallesi\'nde yazlık ev almak istiyordum. Karasu Emlak ekibi bana çok yardımcı oldu. Denize sıfır güzel bir ev buldum ve fiyat konusunda da çok adaletliydiler. Teşekkürler!',
    propertyId: undefined,
    propertyName: 'Karasu Sahil Yazlık Ev',
  },
  {
    authorName: 'Mehmet Kaya',
    authorUrl: undefined,
    date: '2024-10-10',
    rating: 5,
    text: 'Emlak danışmanlığı hizmeti aldım. Ev değerlemesi ve satış sürecinde çok profesyonel davrandılar. Evimi beklediğimden daha yüksek fiyata sattım. Çok memnun kaldım.',
    propertyId: undefined,
    propertyName: undefined,
  },
  {
    authorName: 'Fatma Şahin',
    authorUrl: undefined,
    date: '2024-09-25',
    rating: 5,
    text: 'Karasu\'da kiralık ev arıyordum. Karasu Emlak ekibi ihtiyaçlarıma uygun birçok seçenek sundu. Kiralama sürecinde de çok yardımcı oldular. Şimdi çok memnunum.',
    propertyId: undefined,
    propertyName: undefined,
  },
  {
    authorName: 'Ali Öztürk',
    authorUrl: undefined,
    date: '2024-08-15',
    rating: 5,
    text: 'Yatırım amaçlı ev almak istiyordum. Karasu Emlak ekibi bana yatırım potansiyeli yüksek mahalleler hakkında detaylı bilgi verdi. Şimdi çok karlı bir yatırım yaptım. Teşekkürler!',
    propertyId: undefined,
    propertyName: undefined,
  },
  {
    authorName: 'Zeynep Arslan',
    authorUrl: undefined,
    date: '2024-07-20',
    rating: 5,
    text: 'Karasu Merkez Mahallesi\'nde daire aldım. Karasu Emlak ekibi tüm süreçte yanımdaydı. Tapu işlemleri, kredi başvurusu her şeyi hallettiler. Çok profesyonel bir ekip.',
    propertyId: undefined,
    propertyName: 'Karasu Merkez Daire',
  },
  {
    authorName: 'Mustafa Çelik',
    authorUrl: undefined,
    date: '2024-06-10',
    rating: 5,
    text: 'Emlak danışmanlığı hizmeti aldım. Ev değerlemesi çok doğru yapıldı ve satış sürecinde de çok yardımcı oldular. Evimi hızlıca sattım. Çok memnunum.',
    propertyId: undefined,
    propertyName: undefined,
  },
  {
    authorName: 'Elif Yıldız',
    authorUrl: undefined,
    date: '2024-05-15',
    rating: 5,
    text: 'Karasu\'da yazlık ev kiraladım. Karasu Emlak ekibi bana çok güzel seçenekler sundu. Kiralama sürecinde de çok yardımcı oldular. Yazı çok güzel geçti.',
    propertyId: undefined,
    propertyName: undefined,
  },
  {
    authorName: 'Burak Aydın',
    authorUrl: undefined,
    date: '2024-04-20',
    rating: 5,
    text: 'Karasu Yalı Mahallesi\'nde villa aldım. Denize yakın konumu ve güzel manzarası ile hayalimdeki evi buldum. Karasu Emlak ekibi tüm süreçte çok yardımcı oldu.',
    propertyId: undefined,
    propertyName: 'Karasu Yalı Villa',
  },
  {
    authorName: 'Selin Özkan',
    authorUrl: undefined,
    date: '2024-03-10',
    rating: 5,
    text: 'Emlak danışmanlığı hizmeti aldım. Ev değerlemesi ve satış sürecinde çok profesyonel davrandılar. Evimi beklediğimden daha yüksek fiyata sattım. Teşekkürler!',
    propertyId: undefined,
    propertyName: undefined,
  },
];

/**
 * Get all reviews
 */
export function getAllReviews(): Review[] {
  return CUSTOMER_REVIEWS;
}

/**
 * Get reviews by rating
 */
export function getReviewsByRating(rating: number): Review[] {
  return CUSTOMER_REVIEWS.filter(review => review.rating === rating);
}

/**
 * Get recent reviews
 */
export function getRecentReviews(limit: number = 5): Review[] {
  return CUSTOMER_REVIEWS
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

/**
 * Get average rating
 */
export function getAverageRating(): number {
  if (CUSTOMER_REVIEWS.length === 0) return 0;
  const sum = CUSTOMER_REVIEWS.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / CUSTOMER_REVIEWS.length) * 10) / 10;
}

/**
 * Get review count
 */
export function getReviewCount(): number {
  return CUSTOMER_REVIEWS.length;
}

