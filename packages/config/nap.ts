/**
 * NAP (Name, Address, Phone) data
 * Consistent business information across the site
 */

export const napData = {
  name: 'Karasu Emlak',
  legalName: 'Karasu Emlak Danışmanlık Ltd. Şti.',
  address: {
    street: 'Merkez Mahallesi, Atatürk Caddesi No:123',
    city: 'Karasu',
    province: 'Sakarya',
    postalCode: '54500',
    country: 'Türkiye',
    full: 'Merkez Mahallesi, Atatürk Caddesi No:123, 54500 Karasu / Sakarya',
  },
  contact: {
    phone: '+905325933854',
    phoneFormatted: '+90 532 593 38 54',
    whatsapp: '+905325933854',
    whatsappFormatted: '+90 532 593 38 54',
    email: 'info@karasuemlak.net',
    website: 'https://www.karasuemlak.net',
  },
  social: {
    facebook: 'https://facebook.com/karasuemlak',
    instagram: 'https://instagram.com/karasuemlak',
    twitter: 'https://twitter.com/karasuemlak',
    linkedin: 'https://linkedin.com/company/karasuemlak',
  },
  businessHours: {
    weekdays: '09:00 - 18:00',
    saturday: '09:00 - 14:00',
    sunday: 'Kapalı',
  },
} as const;

