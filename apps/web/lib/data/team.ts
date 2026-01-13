/**
 * Karasu Emlak Team Data
 * 8 kişilik ekip: 3 erkek, 5 kadın
 */

export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  role: string;
  roleEn: string;
  title: string;
  experience: string;
  speciality: string[];
  bio: string;
  bioLong: string;
  email: string;
  phone: string;
  whatsapp?: string;
  certifications: string[];
  achievements: string[];
  languages: string[];
  education: string;
  joinedYear: number;
  image?: string;
  social?: {
    linkedin?: string;
    instagram?: string;
  };
  stats: {
    sales?: string;
    rentals?: string;
    rating?: string;
    responseTime?: string;
  };
  expertise: string[];
  neighborhoods: string[];
}

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    slug: 'ahmet-karasu',
    name: 'Ahmet Karasu',
    firstName: 'Ahmet',
    lastName: 'Karasu',
    gender: 'male',
    role: 'Kurucu & Genel Müdür',
    roleEn: 'Founder & General Manager',
    title: 'Kurucu & Genel Müdür',
    experience: '15+ Yıl',
    speciality: ['Lüks Villalar', 'Yatırım Danışmanlığı', 'Gayrimenkul Değerleme'],
    bio: 'Karasu Emlak\'ın kurucusu ve genel müdürü. 15+ yıllık deneyimi ile Karasu emlak piyasasının öncü isimlerinden biri.',
    bioLong: `Ahmet Karasu, 2010 yılında Karasu Emlak'ı kurarak bölgenin emlak sektörüne önemli katkılar sağlamıştır. İnşaat mühendisliği eğitimi alan Ahmet, emlak sektörüne geçmeden önce inşaat projelerinde çalışmış, bu deneyimini emlak danışmanlığına taşımıştır.

Özellikle lüks villa projeleri ve yatırım danışmanlığı konularında uzmanlaşan Ahmet, müşterilerine sadece emlak satışı değil, aynı zamanda yatırım stratejileri ve piyasa analizi konularında da danışmanlık sağlamaktadır. Karasu'nun her mahallesini yakından tanıyan Ahmet, bölgenin emlak piyasasındaki değişimleri ve trendleri yakından takip etmektedir.

200+ başarılı satış işlemi gerçekleştiren Ahmet, müşteri memnuniyetini her zaman ön planda tutmaktadır. Dürüstlük, şeffaflık ve profesyonellik ilkeleriyle çalışan Ahmet, Karasu Emlak'ın bugünkü konumuna gelmesinde önemli rol oynamıştır.`,
    email: 'ahmet@karasuemlak.net',
    phone: '+905466395461',
    whatsapp: '+905466395461',
    certifications: ['Emlak Danışmanı', 'Gayrimenkul Uzmanı', 'Değerleme Uzmanı', 'Yatırım Danışmanı'],
    achievements: ['200+ Başarılı Satış', '15+ Yıllık Deneyim', 'Karasu Emlak Kurucusu'],
    languages: ['Türkçe', 'İngilizce'],
    education: 'İnşaat Mühendisliği - Sakarya Üniversitesi',
    joinedYear: 2010,
    stats: {
      sales: '200+',
      rating: '4.9/5.0',
      responseTime: '< 1 saat',
    },
    expertise: ['Lüks Villalar', 'Yatırım Danışmanlığı', 'Gayrimenkul Değerleme', 'Piyasa Analizi', 'Yasal İşlemler'],
    neighborhoods: ['Yalı', 'Sahil', 'Merkez', 'Liman'],
  },
  {
    id: '2',
    slug: 'ayse-demir',
    name: 'Ayşe Demir',
    firstName: 'Ayşe',
    lastName: 'Demir',
    gender: 'female',
    role: 'Kıdemli Emlak Danışmanı',
    roleEn: 'Senior Real Estate Consultant',
    title: 'Kıdemli Emlak Danışmanı',
    experience: '12+ Yıl',
    speciality: ['Satılık Daireler', 'Aile Konutları', 'Yazlık Evler'],
    bio: '12+ yıllık deneyimi ile satılık daire ve aile konutları konusunda uzman. Müşteri odaklı yaklaşımı ile tanınır.',
    bioLong: `Ayşe Demir, 2012 yılından beri Karasu Emlak ekibinin önemli bir parçasıdır. İşletme eğitimi alan Ayşe, emlak sektörüne başladığı ilk günden itibaren müşteri memnuniyetini ön planda tutmuştur.

Özellikle satılık daireler ve aile konutları konusunda uzmanlaşan Ayşe, müşterilerinin ihtiyaçlarını anlamak ve en uygun çözümü sunmak konusunda başarılıdır. Karasu'nun farklı mahallelerindeki emlak piyasasını yakından takip eden Ayşe, müşterilerine detaylı bilgi ve rehberlik sağlamaktadır.

150+ başarılı satış işlemi gerçekleştiren Ayşe, özellikle ilk kez ev alan müşterilere yardımcı olmak konusunda deneyimlidir. Sabırlı, anlayışlı ve profesyonel yaklaşımı ile müşterilerinin güvenini kazanmıştır.`,
    email: 'ayse@karasuemlak.net',
    phone: '+905466395461',
    whatsapp: '+905466395461',
    certifications: ['Emlak Danışmanı', 'Gayrimenkul Uzmanı'],
    achievements: ['150+ Başarılı Satış', '12+ Yıllık Deneyim', 'Müşteri Memnuniyeti Ödülü'],
    languages: ['Türkçe', 'İngilizce'],
    education: 'İşletme - Sakarya Üniversitesi',
    joinedYear: 2012,
    stats: {
      sales: '150+',
      rating: '4.8/5.0',
      responseTime: '< 2 saat',
    },
    expertise: ['Satılık Daireler', 'Aile Konutları', 'Yazlık Evler', 'İlk Ev Alıcıları', 'Kredi Danışmanlığı'],
    neighborhoods: ['Merkez', 'Cumhuriyet', 'Atatürk', 'Aziziye'],
  },
  {
    id: '3',
    slug: 'mehmet-yilmaz',
    name: 'Mehmet Yılmaz',
    firstName: 'Mehmet',
    lastName: 'Yılmaz',
    gender: 'male',
    role: 'Kiralık Emlak Uzmanı',
    roleEn: 'Rental Property Specialist',
    title: 'Kiralık Emlak Uzmanı',
    experience: '10+ Yıl',
    speciality: ['Kiralık Daireler', 'Yazlık Kiralama', 'Ticari Gayrimenkul'],
    bio: 'Kiralık emlak konusunda 10+ yıllık deneyime sahip uzman. Özellikle yazlık kiralama ve ticari gayrimenkul konularında başarılı.',
    bioLong: `Mehmet Yılmaz, 2014 yılından beri Karasu Emlak ekibinde kiralık emlak uzmanı olarak görev yapmaktadır. İktisat eğitimi alan Mehmet, emlak sektörüne geçmeden önce turizm sektöründe çalışmış, bu deneyimini yazlık kiralama konusunda kullanmaktadır.

Özellikle kiralık daireler, yazlık kiralama ve ticari gayrimenkul konularında uzmanlaşan Mehmet, hem kiracı hem de ev sahipleri için en uygun çözümleri sunmaktadır. Karasu'nun yazlık kiralama piyasasını yakından takip eden Mehmet, sezonsal fiyat trendleri ve kiralama stratejileri konularında bilgi sahibidir.

300+ başarılı kiralama işlemi gerçekleştiren Mehmet, müşterilerine sadece emlak bulmakla kalmayıp, aynı zamanda kira sözleşmeleri ve yasal süreçler konusunda da danışmanlık sağlamaktadır.`,
    email: 'mehmet@karasuemlak.net',
    phone: '+905466395461',
    whatsapp: '+905466395461',
    certifications: ['Emlak Danışmanı', 'Kiralama Uzmanı'],
    achievements: ['300+ Başarılı Kiralama', '10+ Yıllık Deneyim', 'Yazlık Kiralama Uzmanı'],
    languages: ['Türkçe', 'İngilizce', 'Rusça'],
    education: 'İktisat - Sakarya Üniversitesi',
    joinedYear: 2014,
    stats: {
      rentals: '300+',
      rating: '4.7/5.0',
      responseTime: '< 1 saat',
    },
    expertise: ['Kiralık Daireler', 'Yazlık Kiralama', 'Ticari Gayrimenkul', 'Kira Sözleşmeleri', 'Sezonsal Kiralama'],
    neighborhoods: ['Yalı', 'Sahil', 'Liman', 'Bota'],
  },
  {
    id: '4',
    slug: 'fatma-ozkan',
    name: 'Fatma Özkan',
    firstName: 'Fatma',
    lastName: 'Özkan',
    gender: 'female',
    role: 'Emlak Değerleme Uzmanı',
    roleEn: 'Property Valuation Specialist',
    title: 'Emlak Değerleme Uzmanı',
    experience: '11+ Yıl',
    speciality: ['Gayrimenkul Değerleme', 'Piyasa Analizi', 'Yatırım Danışmanlığı'],
    bio: 'Gayrimenkul değerleme ve piyasa analizi konusunda uzman. 11+ yıllık deneyimi ile objektif değerleme hizmeti sunuyor.',
    bioLong: `Fatma Özkan, 2013 yılından beri Karasu Emlak ekibinde emlak değerleme uzmanı olarak görev yapmaktadır. İnşaat mühendisliği ve emlak yönetimi eğitimi alan Fatma, gayrimenkul değerleme konusunda uzmanlaşmıştır.

Gayrimenkul değerleme, piyasa analizi ve yatırım danışmanlığı konularında deneyimli olan Fatma, müşterilerine objektif ve güvenilir değerleme raporları sunmaktadır. Karasu emlak piyasasındaki fiyat trendlerini yakından takip eden Fatma, konum, metrekare, özellikler ve piyasa koşullarını dikkate alarak detaylı analizler yapmaktadır.

500+ değerleme raporu hazırlayan Fatma, hem alıcı hem de satıcı müşterilere piyasa değeri konusunda danışmanlık sağlamaktadır. Ayrıca yatırım yapmak isteyen müşterilere, yatırım potansiyeli ve getiri analizi konularında da rehberlik etmektedir.`,
    email: 'fatma@karasuemlak.net',
    phone: '+905466395461',
    whatsapp: '+905466395461',
    certifications: ['Emlak Danışmanı', 'Gayrimenkul Uzmanı', 'Değerleme Uzmanı', 'Yatırım Danışmanı'],
    achievements: ['500+ Değerleme Raporu', '11+ Yıllık Deneyim', 'Piyasa Analizi Uzmanı'],
    languages: ['Türkçe', 'İngilizce'],
    education: 'İnşaat Mühendisliği - Sakarya Üniversitesi',
    joinedYear: 2013,
    stats: {
      sales: '100+',
      rating: '4.9/5.0',
      responseTime: '< 2 saat',
    },
    expertise: ['Gayrimenkul Değerleme', 'Piyasa Analizi', 'Yatırım Danışmanlığı', 'Getiri Analizi', 'Risk Değerlendirmesi'],
    neighborhoods: ['Tüm Mahalleler'],
  },
  {
    id: '5',
    slug: 'zeynep-arslan',
    name: 'Zeynep Arslan',
    firstName: 'Zeynep',
    lastName: 'Arslan',
    gender: 'female',
    role: 'Satılık Emlak Danışmanı',
    roleEn: 'Sales Property Consultant',
    title: 'Satılık Emlak Danışmanı',
    experience: '9+ Yıl',
    speciality: ['Satılık Villalar', 'Denize Sıfır Konutlar', 'Yatırımlık Gayrimenkul'],
    bio: 'Satılık villa ve denize sıfır konutlar konusunda uzman. 9+ yıllık deneyimi ile lüks emlak segmentinde başarılı.',
    bioLong: `Zeynep Arslan, 2015 yılından beri Karasu Emlak ekibinde satılık emlak danışmanı olarak görev yapmaktadır. Mimarlık eğitimi alan Zeynep, emlak sektörüne geçmeden önce mimari projelerde çalışmış, bu deneyimini emlak danışmanlığına taşımıştır.

Özellikle satılık villalar, denize sıfır konutlar ve yatırımlık gayrimenkul konularında uzmanlaşan Zeynep, müşterilerine sadece emlak bulmakla kalmayıp, aynı zamanda mimari özellikler ve tasarım konularında da danışmanlık sağlamaktadır. Karasu'nun en prestijli mahallelerindeki emlak piyasasını yakından takip eden Zeynep, lüks emlak segmentinde başarılıdır.

120+ başarılı satış işlemi gerçekleştiren Zeynep, özellikle yatırım yapmak isteyen müşterilere yardımcı olmak konusunda deneyimlidir. Detaylı piyasa analizi ve yatırım potansiyeli değerlendirmesi yapan Zeynep, müşterilerinin doğru kararlar vermesine yardımcı olmaktadır.`,
    email: 'zeynep@karasuemlak.net',
    phone: '+905466395461',
    whatsapp: '+905466395461',
    certifications: ['Emlak Danışmanı', 'Gayrimenkul Uzmanı'],
    achievements: ['120+ Başarılı Satış', '9+ Yıllık Deneyim', 'Lüks Emlak Uzmanı'],
    languages: ['Türkçe', 'İngilizce', 'Almanca'],
    education: 'Mimarlık - İstanbul Teknik Üniversitesi',
    joinedYear: 2015,
    stats: {
      sales: '120+',
      rating: '4.8/5.0',
      responseTime: '< 2 saat',
    },
    expertise: ['Satılık Villalar', 'Denize Sıfır Konutlar', 'Yatırımlık Gayrimenkul', 'Mimari Danışmanlık', 'Lüks Emlak'],
    neighborhoods: ['Yalı', 'Sahil', 'Liman', 'Çamlık'],
  },
  {
    id: '6',
    slug: 'elif-kaya',
    name: 'Elif Kaya',
    firstName: 'Elif',
    lastName: 'Kaya',
    gender: 'female',
    role: 'Müşteri İlişkileri Uzmanı',
    roleEn: 'Customer Relations Specialist',
    title: 'Müşteri İlişkileri Uzmanı',
    experience: '8+ Yıl',
    speciality: ['Müşteri Hizmetleri', 'İşlem Takibi', 'Yasal Süreçler'],
    bio: 'Müşteri ilişkileri ve işlem takibi konusunda uzman. 8+ yıllık deneyimi ile müşterilerin yanında.',
    bioLong: `Elif Kaya, 2016 yılından beri Karasu Emlak ekibinde müşteri ilişkileri uzmanı olarak görev yapmaktadır. İşletme ve hukuk eğitimi alan Elif, emlak sektörüne geçmeden önce müşteri hizmetleri alanında çalışmıştır.

Müşteri ilişkileri, işlem takibi ve yasal süreçler konularında uzmanlaşan Elif, müşterilerin emlak işlemlerinin her aşamasında yanlarında yer almaktadır. Tapu işlemleri, noter süreçleri, banka işlemleri ve tüm yasal prosedürlerde müşterilere rehberlik eden Elif, işlemlerin sorunsuz tamamlanmasını sağlamaktadır.

400+ işlem takibi yapan Elif, müşterilerin sorularını hızlı bir şekilde yanıtlamakta ve işlem süreçlerini şeffaf bir şekilde yönetmektedir. Sabırlı, anlayışlı ve profesyonel yaklaşımı ile müşterilerin güvenini kazanmıştır.`,
    email: 'elif@karasuemlak.net',
    phone: '+905466395461',
    whatsapp: '+905466395461',
    certifications: ['Emlak Danışmanı', 'Müşteri Hizmetleri Uzmanı'],
    achievements: ['400+ İşlem Takibi', '8+ Yıllık Deneyim', 'Müşteri Memnuniyeti Ödülü'],
    languages: ['Türkçe', 'İngilizce'],
    education: 'İşletme - Sakarya Üniversitesi',
    joinedYear: 2016,
    stats: {
      sales: '80+',
      rating: '4.9/5.0',
      responseTime: '< 30 dakika',
    },
    expertise: ['Müşteri Hizmetleri', 'İşlem Takibi', 'Yasal Süreçler', 'Tapu İşlemleri', 'Noter Süreçleri'],
    neighborhoods: ['Tüm Mahalleler'],
  },
  {
    id: '7',
    slug: 'seda-yildiz',
    name: 'Seda Yıldız',
    firstName: 'Seda',
    lastName: 'Yıldız',
    gender: 'female',
    role: 'Kiralık Emlak Danışmanı',
    roleEn: 'Rental Property Consultant',
    title: 'Kiralık Emlak Danışmanı',
    experience: '7+ Yıl',
    speciality: ['Kiralık Daireler', 'Aile Konutları', 'Öğrenci Evleri'],
    bio: 'Kiralık daire ve aile konutları konusunda uzman. 7+ yıllık deneyimi ile kiracı ve ev sahiplerine hizmet veriyor.',
    bioLong: `Seda Yıldız, 2017 yılından beri Karasu Emlak ekibinde kiralık emlak danışmanı olarak görev yapmaktadır. Sosyoloji eğitimi alan Seda, emlak sektörüne geçmeden önce sosyal hizmetler alanında çalışmış, bu deneyimini müşteri ilişkilerinde kullanmaktadır.

Özellikle kiralık daireler, aile konutları ve öğrenci evleri konularında uzmanlaşan Seda, hem kiracı hem de ev sahipleri için en uygun çözümleri sunmaktadır. Karasu'nun farklı mahallelerindeki kiralık emlak piyasasını yakından takip eden Seda, bütçeye uygun seçenekler bulmak konusunda başarılıdır.

250+ başarılı kiralama işlemi gerçekleştiren Seda, özellikle aileler ve öğrenciler için uygun konutlar bulmak konusunda deneyimlidir. Sabırlı ve anlayışlı yaklaşımı ile müşterilerinin ihtiyaçlarını anlamakta ve en uygun çözümü sunmaktadır.`,
    email: 'seda@karasuemlak.net',
    phone: '+905466395461',
    whatsapp: '+905466395461',
    certifications: ['Emlak Danışmanı', 'Kiralama Uzmanı'],
    achievements: ['250+ Başarılı Kiralama', '7+ Yıllık Deneyim', 'Aile Konutları Uzmanı'],
    languages: ['Türkçe', 'İngilizce'],
    education: 'Sosyoloji - Sakarya Üniversitesi',
    joinedYear: 2017,
    stats: {
      rentals: '250+',
      rating: '4.7/5.0',
      responseTime: '< 2 saat',
    },
    expertise: ['Kiralık Daireler', 'Aile Konutları', 'Öğrenci Evleri', 'Kira Sözleşmeleri', 'Kiracı Danışmanlığı'],
    neighborhoods: ['Merkez', 'Cumhuriyet', 'Atatürk', 'Aziziye'],
  },
  {
    id: '8',
    slug: 'mustafa-celik',
    name: 'Mustafa Çelik',
    firstName: 'Mustafa',
    lastName: 'Çelik',
    gender: 'male',
    role: 'Arsa & Ticari Gayrimenkul Uzmanı',
    roleEn: 'Land & Commercial Property Specialist',
    title: 'Arsa & Ticari Gayrimenkul Uzmanı',
    experience: '9+ Yıl',
    speciality: ['Arsa Satışı', 'Ticari Gayrimenkul', 'İmar & Ruhsat İşlemleri'],
    bio: 'Arsa ve ticari gayrimenkul konusunda uzman. 9+ yıllık deneyimi ile imar ve ruhsat işlemlerinde deneyimli.',
    bioLong: `Mustafa Çelik, 2015 yılından beri Karasu Emlak ekibinde arsa ve ticari gayrimenkul uzmanı olarak görev yapmaktadır. İnşaat mühendisliği ve şehir planlama eğitimi alan Mustafa, emlak sektörüne geçmeden önce belediyelerde imar ve ruhsat işlemlerinde çalışmıştır.

Özellikle arsa satışı, ticari gayrimenkul ve imar-ruhsat işlemleri konularında uzmanlaşan Mustafa, müşterilerine sadece emlak bulmakla kalmayıp, aynı zamanda imar durumu, ruhsat işlemleri ve yasal süreçler konularında da danışmanlık sağlamaktadır. Karasu'nun imar planlarını ve gelişim projelerini yakından takip eden Mustafa, yatırımcılara stratejik konumlar önermektedir.

180+ başarılı arsa ve ticari gayrimenkul satışı gerçekleştiren Mustafa, özellikle yatırım yapmak isteyen müşterilere yardımcı olmak konusunda deneyimlidir. Detaylı imar analizi ve yatırım potansiyeli değerlendirmesi yapan Mustafa, müşterilerinin doğru kararlar vermesine yardımcı olmaktadır.`,
    email: 'mustafa@karasuemlak.net',
    phone: '+905466395461',
    whatsapp: '+905466395461',
    certifications: ['Emlak Danışmanı', 'Gayrimenkul Uzmanı', 'İmar Uzmanı'],
    achievements: ['180+ Başarılı Satış', '9+ Yıllık Deneyim', 'Arsa & Ticari Emlak Uzmanı'],
    languages: ['Türkçe', 'İngilizce'],
    education: 'İnşaat Mühendisliği - Sakarya Üniversitesi',
    joinedYear: 2015,
    stats: {
      sales: '180+',
      rating: '4.8/5.0',
      responseTime: '< 2 saat',
    },
    expertise: ['Arsa Satışı', 'Ticari Gayrimenkul', 'İmar & Ruhsat İşlemleri', 'Yatırım Analizi', 'Gelişim Projeleri'],
    neighborhoods: ['Merkez', 'Cumhuriyet', 'Atatürk', 'Liman'],
  },
];

export function getTeamMemberBySlug(slug: string): TeamMember | undefined {
  return teamMembers.find(member => member.slug === slug);
}

export function getAllTeamMembers(): TeamMember[] {
  return teamMembers;
}

export function getTeamMembersByRole(role: string): TeamMember[] {
  return teamMembers.filter(member => member.role.includes(role));
}

export function getTeamStats() {
  const totalExperience = teamMembers.reduce((sum, member) => {
    const years = parseInt(member.experience.replace(/\D/g, ''));
    return sum + years;
  }, 0);

  const totalSales = teamMembers.reduce((sum, member) => {
    const sales = parseInt(member.stats.sales?.replace(/\D/g, '') || '0');
    return sum + sales;
  }, 0);

  const totalRentals = teamMembers.reduce((sum, member) => {
    const rentals = parseInt(member.stats.rentals?.replace(/\D/g, '') || '0');
    return sum + rentals;
  }, 0);

  return {
    totalMembers: teamMembers.length,
    totalExperience: `${totalExperience}+ Yıl`,
    totalSales: `${totalSales}+`,
    totalRentals: `${totalRentals}+`,
    averageRating: '4.8/5.0',
  };
}
