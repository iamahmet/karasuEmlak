interface ContextualLink {
  href: string;
  label: string;
  description: string;
  intent: 'listing' | 'guide' | 'tool';
}

interface GenerateContextualLinksParams {
  content: string;
  basePath: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

export function generateContextualLinks({ content, basePath }: GenerateContextualLinksParams): ContextualLink[] {
  const contentLower = (content || '').toLowerCase();
  const links: ContextualLink[] = [];

  const pushUnique = (link: ContextualLink) => {
    if (!links.some((existing) => existing.href === link.href)) {
      links.push(link);
    }
  };

  const regionLinks = [
    {
      keyword: 'karasu',
      href: `${basePath}/karasu-satilik-ev`,
      label: 'Karasu Satılık Ev İlanları',
      description: 'Karasu merkez ve sahil bölgelerindeki güncel ilanları keşfedin.',
      intent: 'listing' as const,
    },
    {
      keyword: 'kocaali',
      href: `${basePath}/kocaali-satilik-ev`,
      label: 'Kocaali Satılık Ev İlanları',
      description: 'Kocaali ve çevresinde yatırım fırsatlarını inceleyin.',
      intent: 'listing' as const,
    },
    {
      keyword: 'sakarya',
      href: `${basePath}/sakarya-satilik-ev`,
      label: 'Sakarya Satılık Ev Rehberi',
      description: 'Şehrin öne çıkan mahalleleri ve fiyat trendleri.',
      intent: 'listing' as const,
    },
  ];

  regionLinks.forEach((link) => {
    if (contentLower.includes(link.keyword)) {
      pushUnique(link);
    }
  });

  if (contentLower.includes('deniz') || contentLower.includes('sahil')) {
    pushUnique({
      href: `${basePath}/karasu-denize-yakin-satilik-ev`,
      label: 'Denize Yakın Satılık Evler',
      description: 'Sahil hattındaki yeni projeler ve ikincil pazar ilanları.',
      intent: 'listing',
    });
  }

  if (contentLower.includes('yatırım') || contentLower.includes('yatirim') || contentLower.includes('roi')) {
    pushUnique({
      href: `${basePath}/karasu-yatirimlik-satilik-ev`,
      label: 'Yatırım Amaçlı Gayrimenkuller',
      description: 'Kira getirisi yüksek projeleri karşılaştırın.',
      intent: 'listing',
    });
  }

  // Guide links
  if (contentLower.includes('ev') && (contentLower.includes('al') || contentLower.includes('sat'))) {
    pushUnique({
      href: `${basePath}/rehberler/ev-nasil-alinir`,
      label: 'Ev Nasıl Alınır? | Adım Adım Rehber',
      description: 'Tapu, kredi ve teslim süreçlerinde dikkat edilmesi gerekenler.',
      intent: 'guide',
    });
    pushUnique({
      href: `${basePath}/rehberler/ev-nasil-satilir`,
      label: 'Ev Nasıl Satılır? | Satıcı Rehberi',
      description: 'Doğru fiyatlama ve satış sözleşmesi ipuçları.',
      intent: 'guide',
    });
  }

  if (contentLower.includes('kira') || contentLower.includes('kiralama')) {
    pushUnique({
      href: `${basePath}/rehberler/ev-nasil-kiralanir`,
      label: 'Kiralama Süreci Rehberi',
      description: 'Kira sözleşmesi ve depozito yönetimi.',
      intent: 'guide',
    });
  }

  // Ramadan / Eid seasonal internal linking (content cluster)
  if (contentLower.includes('ramazan') || contentLower.includes('bayram') || contentLower.includes('iftar') || contentLower.includes('sahur')) {
    pushUnique({
      href: `${basePath}/blog/ramazan-2026`,
      label: 'Ramazan 2026 İçerik Merkezi',
      description: 'Ramazan ve bayram dönemine özel Karasu rehberleri ve kontrol listeleri.',
      intent: 'guide',
    });
    if (contentLower.includes('imsak') || contentLower.includes('imsakiye') || contentLower.includes('vakit')) {
      pushUnique({
        href: `${basePath}/karasu/ramazan-imsakiyesi`,
        label: 'Sakarya Karasu Ramazan İmsakiyesi',
        description: 'Karasu için imsak ve iftar vakitleri (gün gün tablo).',
        intent: 'tool',
      });
    }
    if (
      contentLower.includes('iftar') ||
      contentLower.includes('kaç dakika') ||
      contentLower.includes('kac dakika') ||
      contentLower.includes('iftara kaç') ||
      contentLower.includes('iftara kac')
    ) {
      pushUnique({
        href: `${basePath}/karasu/iftara-kac-dakika-kaldi`,
        label: 'Karasu İftara Kaç Dakika Kaldı?',
        description: 'Karasu iftar saatine göre canlı geri sayım.',
        intent: 'tool',
      });
    }
    pushUnique({
      href: `${basePath}/blog/ramazan-2026-karasu-rehberi`,
      label: 'Ramazan 2026 Karasu Rehberi',
      description: 'İftar-sahur planı, sosyal hayat ve yazlık/kiralık planlaması.',
      intent: 'guide',
    });
    pushUnique({
      href: `${basePath}/blog/ramazan-bayrami-2026-karasu-tatil-yazlik-rehberi`,
      label: 'Ramazan Bayramı 2026 Karasu Rehberi',
      description: 'Tatil planı, ulaşım, konaklama ve yazlık rehberi.',
      intent: 'guide',
    });
  }

  if (contentLower.includes('kredi') || contentLower.includes('mortgage')) {
    pushUnique({
      href: `${basePath}/rehberler/kredi-nasil-alinir`,
      label: 'Konut Kredisi Nasıl Alınır?',
      description: 'Başvuru şartları, faiz karşılaştırması ve evrak listesi.',
      intent: 'guide',
    });
    pushUnique({
      href: `${basePath}/kredi-hesaplayici`,
      label: 'Kredi Hesaplayıcı',
      description: 'Taksit ve toplam geri ödeme hesaplamaları.',
      intent: 'tool',
    });
  }

  if (contentLower.includes('tapu') || contentLower.includes('devir')) {
    pushUnique({
      href: `${basePath}/rehberler/tapu-islemleri`,
      label: 'Tapu İşlemleri Rehberi',
      description: 'Satın alma ve satış aşamalarında resmi süreçler.',
      intent: 'guide',
    });
  }

  if (contentLower.includes('mahalle') || contentLower.includes('bölge')) {
    pushUnique({
      href: `${basePath}/karasu-mahalleleri`,
      label: 'Karasu Mahalle Rehberi',
      description: 'Fiyat aralıkları ve yaşam profili karşılaştırmaları.',
      intent: 'guide',
    });
  }

  // Default fallback links
  if (links.length < 3) {
    pushUnique({
      href: `${basePath}/karasu-satilik-ev`,
      label: 'Karasu Satılık Ev',
      description: 'Tüm Karasu satılık ev ilanlarına göz atın.',
      intent: 'listing',
    });
    pushUnique({
      href: `${basePath}/kocaali-satilik-ev`,
      label: 'Kocaali Satılık Ev',
      description: 'Kocaali bölgesindeki güncel ilanlar.',
      intent: 'listing',
    });
    pushUnique({
      href: `${basePath}/rehberler/emlak-yatirim-rehberi`,
      label: 'Emlak Yatırım Rehberi',
      description: 'Bölge bazlı getiri analizleri ve stratejiler.',
      intent: 'guide',
    });
  }

  return links.slice(0, 6);
}

export type { ContextualLink };
