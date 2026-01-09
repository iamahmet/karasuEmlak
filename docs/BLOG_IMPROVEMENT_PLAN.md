# Blog Gelistirme Plani - Karasu Emlak

Bu dokuman, karasuemlak.net uretim sitesinin analizi ve mevcut kod tabaninin karsilastirmasi sonucunda hazirlanan kapsamli bir iyilestirme planidir.

---

## 1. MEVCUT DURUM ANALIZI

### 1.1 Uretim Sitesi (karasuemlak.net) Ozellikleri

**Haberler Sayfasi:**
- Gradient hero section ile baslik
- 3 sutunlu responsive grid (mobilde 1)
- Her kartta: tarih, baslik, onizleme metni, "Emlak Etkisi" badge'i, konum etiketleri
- Kaynak atfi ile dis link butonu
- Staggered animasyonlar
- Yatirim odakli icerik cercevelemesi

**Blog Detay Sayfasi:**
- Breadcrumb navigasyon
- Yazar ve okuma suresi metadata
- Temiz tipografi ile okunabilir icerik
- Ilgili icerik grid sistemi
- Skeleton placeholder'lar
- CTA footer (telefon, email)
- Schema.org yapilandirilmis veri

### 1.2 Mevcut Kod Tabani Guclu Yonleri

- **48 blog bileseni** - Kapsamli mimari
- **ISR ile SSR** - Performans optimizasyonu
- **Coklu structured data** - SEO destegi
- **Cloudinary entegrasyonu** - Gorsel optimizasyonu
- **Fallback mekanizmalari** - Guvenilirlik
- **i18n destegi** - Coklu dil
- **Okuma ilerleme cubugu** - UX
- **Klavye kisayollari** - Erisebilirlik

---

## 2. IYILESTIRME ALANLARI

### 2.1 TASARIM & UI/UX

#### 2.1.1 Blog Listing Sayfasi

**Sorun:** Kart tasarimi cok basit ve sikici gorunuyor.

**Cozum:**
```
Dosya: apps/web/components/blog/ArticleCard.tsx

Gelistirmeler:
1. Hover efektleri daha belirgin olmali
2. Gradient overlay'ler eklenmeli
3. Kategori badge'i daha premium gorunmeli
4. "Emlak Etkisi" veya "Okunma Suresi" badge'i eklenmeli
5. Yazar avatari eklenmeli
6. Sosyal paylasim ikonlari (hover'da gorunur)
```

**Ornek Kod Degisikligi:**
```tsx
// ArticleCard.tsx - Premium tasarim
<article className="group relative h-full bg-white rounded-2xl border border-gray-100
  overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30
  transition-all duration-500 hover:-translate-y-2 flex flex-col">

  {/* Premium Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent
    to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />

  {/* Gorsel Alani - Daha yuksek */}
  <div className="relative h-52 sm:h-56 overflow-hidden">
    {/* Gorsel */}

    {/* Okuma Suresi Badge - Sol ust */}
    <div className="absolute top-4 left-4 z-10">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5
        bg-black/70 backdrop-blur-md text-white rounded-full text-xs font-medium">
        <Clock className="w-3.5 h-3.5" />
        {readingTime} dk okuma
      </span>
    </div>

    {/* Kategori Badge - Sag ust */}
    <div className="absolute top-4 right-4 z-10">
      <span className="px-4 py-1.5 bg-primary text-white rounded-full
        text-xs font-bold uppercase tracking-wide shadow-lg">
        {category}
      </span>
    </div>

    {/* Alt Gradient */}
    <div className="absolute bottom-0 left-0 right-0 h-24
      bg-gradient-to-t from-black/60 to-transparent" />
  </div>
</article>
```

#### 2.1.2 Hero Section Iyilestirmesi

**Sorun:** BlogPageHero cok genel ve sikici.

**Dosya:** `apps/web/components/blog/BlogPageHero.tsx`

**Gelistirmeler:**
```tsx
// Animasyonlu gradient arka plan
<section className="relative overflow-hidden bg-gradient-to-br
  from-slate-900 via-slate-800 to-primary/90 py-20 md:py-28">

  {/* Animasyonlu parcaciklar veya grid pattern */}
  <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

  {/* Parlayan orb efektleri */}
  <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30
    rounded-full blur-3xl animate-pulse" />
  <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500/20
    rounded-full blur-3xl animate-pulse delay-1000" />

  <div className="container relative z-10">
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white
      tracking-tight leading-tight">
      Emlak <span className="text-primary-300">Blogu</span>
    </h1>
    <p className="text-xl md:text-2xl text-white/80 mt-6 max-w-2xl">
      Karasu emlak piyasasi, yatirim firsatlari ve uzman gorusleri
    </p>

    {/* Istatistik kutulari */}
    <div className="flex flex-wrap gap-6 mt-10">
      <StatBox icon={FileText} value="150+" label="Blog Yazisi" />
      <StatBox icon={Eye} value="50K+" label="Okuyucu" />
      <StatBox icon={Star} value="4.9" label="Puan" />
    </div>
  </div>
</section>
```

#### 2.1.3 Sidebar Iyilestirmesi

**Dosya:** `apps/web/components/blog/BlogSidebar.tsx`

**Eklenecek Ozellikler:**
1. **Yazar Profil Karti** - En ust kisimda
2. **Populer Etiketler Bulutu** - Tag cloud
3. **Newsletter Kayit Formu** - Email capture
4. **Son Yorumlar** - Engagement gosterimi
5. **Sosyal Medya Linkleri** - Follow CTA

```tsx
// Yazar Profil Karti Bileseni
function AuthorProfileCard() {
  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5
      rounded-2xl p-6 border border-primary/20">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/20
          flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Karasu Emlak</h3>
          <p className="text-sm text-gray-600">Emlak Uzmani</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-700 leading-relaxed">
        10+ yillik deneyim ile Karasu bolgesinde guvenilir emlak danismanligi.
      </p>
      <div className="flex gap-3 mt-4">
        <SocialIcon platform="instagram" />
        <SocialIcon platform="facebook" />
        <SocialIcon platform="whatsapp" />
      </div>
    </div>
  );
}
```

---

### 2.2 ICERIK KALITESI

#### 2.2.1 Icerik Zenginlestirme Sistemi

**Yeni Dosya:** `apps/web/lib/content/enrichment.ts`

```typescript
interface ContentEnrichment {
  // Otomatik ic linkler
  internalLinks: Array<{
    keyword: string;
    targetUrl: string;
    context: string;
  }>;

  // Ilgili ilanlar
  relatedListings: Array<{
    id: string;
    title: string;
    price: number;
    thumbnail: string;
  }>;

  // Anahtar kelime vurgulamalari
  highlightedTerms: string[];

  // Icerik icinde CTA'lar
  inContentCTAs: Array<{
    position: 'after_intro' | 'mid_content' | 'before_conclusion';
    type: 'listing_search' | 'contact' | 'newsletter';
    text: string;
  }>;
}

export async function enrichArticleContent(
  content: string,
  category: string
): Promise<string> {
  // 1. Anahtar kelimeleri linkle
  content = addInternalLinks(content);

  // 2. CTA blokları ekle
  content = insertCTABlocks(content, category);

  // 3. Ilgili ilan kartlari ekle
  content = insertRelatedListings(content, category);

  return content;
}
```

#### 2.2.2 Dinamik Icerik Bloklari

**Yeni Bilesen:** `apps/web/components/blog/content-blocks/`

```
content-blocks/
├── PropertyHighlight.tsx    # Ilan vurgulama
├── PriceComparison.tsx      # Fiyat karsilastirma tablosu
├── AreaGuide.tsx            # Mahalle rehberi kutusu
├── InvestmentTip.tsx        # Yatirim ipucu kutusu
├── ExpertQuote.tsx          # Uzman gorusu kutusu
├── FAQ.tsx                  # Sik sorulan sorular
├── Calculator.tsx           # Kredi/aidat hesaplayici
└── Map.tsx                  # Interaktif harita
```

**Ornek - PropertyHighlight:**
```tsx
interface PropertyHighlightProps {
  listingId: string;
  variant: 'compact' | 'detailed';
}

export function PropertyHighlight({ listingId, variant }: PropertyHighlightProps) {
  const { data: listing } = useListing(listingId);

  if (!listing) return <PropertyHighlightSkeleton />;

  return (
    <div className="my-8 p-6 bg-gradient-to-r from-primary/5 to-transparent
      rounded-2xl border-l-4 border-primary">
      <div className="flex gap-6">
        <div className="w-48 h-32 rounded-xl overflow-hidden">
          <img src={listing.thumbnail} alt={listing.title} />
        </div>
        <div className="flex-1">
          <span className="text-xs font-bold text-primary uppercase">One Cikan Ilan</span>
          <h4 className="text-xl font-bold mt-1">{listing.title}</h4>
          <p className="text-2xl font-black text-primary mt-2">
            {formatPrice(listing.price)}
          </p>
          <Link href={`/ilan/${listing.slug}`}>
            <Button className="mt-4">Ilani Incele</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

### 2.3 SEO & PERFORMANS

#### 2.3.1 Gelismis Schema.org Yapilandirmasi

**Dosya:** `apps/web/lib/seo/blog-structured-data.ts`

**Eklenecek Schemalar:**
```typescript
// 1. HowTo Schema (Rehber yazilar icin)
export function generateHowToSchema(article: Article) {
  if (!article.category?.includes('Rehber')) return null;

  const steps = extractStepsFromContent(article.content);

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.title,
    description: article.excerpt,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description,
      image: step.image,
    })),
    totalTime: `PT${article.readingTime}M`,
  };
}

// 2. Review Schema (Inceleme yazilar icin)
export function generateReviewSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Place',
      name: extractLocationFromTitle(article.title),
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Karasu',
        addressRegion: 'Sakarya',
        addressCountry: 'TR',
      },
    },
    author: {
      '@type': 'Organization',
      name: 'Karasu Emlak',
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: article.rating || 4.5,
      bestRating: 5,
    },
  };
}

// 3. LocalBusiness entegrasyonu
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Karasu Emlak',
    image: 'https://karasuemlak.com/logo.png',
    telephone: '+905551234567',
    email: 'info@karasuemlak.net',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Merkez Mahallesi',
      addressLocality: 'Karasu',
      addressRegion: 'Sakarya',
      postalCode: '54500',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.1167,
      longitude: 30.6833,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      reviewCount: 127,
    },
  };
}
```

#### 2.3.2 Core Web Vitals Optimizasyonu

**Dosya:** `apps/web/app/[locale]/blog/page.tsx`

```typescript
// 1. Lazy loading ile performans
const ArticleCard = dynamic(
  () => import('@/components/blog/ArticleCard'),
  {
    loading: () => <ArticleCardSkeleton />,
    ssr: true
  }
);

// 2. Intersection Observer ile goruntu yukleme
function LazyArticleGrid({ articles }) {
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 6, articles.length));
        }
      },
      { rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [articles.length]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.slice(0, visibleCount).map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      {visibleCount < articles.length && (
        <div ref={loadMoreRef} className="h-20" />
      )}
    </>
  );
}

// 3. Image optimization hints
export const metadata = {
  other: {
    'link': [
      { rel: 'preconnect', href: 'https://res.cloudinary.com' },
      { rel: 'dns-prefetch', href: 'https://res.cloudinary.com' },
    ],
  },
};
```

---

### 2.4 ETKILESIM & ENGAGEMENT

#### 2.4.1 Yorum Sistemi Gelistirmesi

**Dosya:** `apps/web/components/blog/CommentsSection.tsx`

```typescript
interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
  likes: number;
  replies: Comment[];
  isVerifiedBuyer: boolean;
}

export function CommentsSection({ articleId }: { articleId: string }) {
  const { comments, addComment, likeComment } = useComments(articleId);

  return (
    <section className="mt-16 pt-12 border-t border-gray-200">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">
          Yorumlar ({comments.length})
        </h2>
        <Button variant="outline" size="sm">
          En Yeniler
        </Button>
      </div>

      {/* Yorum Formu */}
      <CommentForm onSubmit={addComment} />

      {/* Yorum Listesi */}
      <div className="space-y-6 mt-8">
        {comments.map(comment => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onLike={() => likeComment(comment.id)}
            onReply={(text) => addComment(text, comment.id)}
          />
        ))}
      </div>
    </section>
  );
}
```

#### 2.4.2 Sosyal Paylasim Entegrasyonu

**Yeni Bilesen:** `apps/web/components/blog/SocialShare.tsx`

```tsx
export function SocialShare({ article, variant = 'floating' }) {
  const shareUrl = `https://karasuemlak.com/blog/${article.slug}`;
  const shareText = article.title;

  const platforms = [
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      color: 'bg-green-500',
    },
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'bg-blue-600',
    },
    {
      name: 'Twitter',
      icon: <TwitterIcon />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: 'bg-sky-500',
    },
    {
      name: 'LinkedIn',
      icon: <LinkedInIcon />,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      color: 'bg-blue-700',
    },
    {
      name: 'Kopyala',
      icon: <LinkIcon />,
      action: () => copyToClipboard(shareUrl),
      color: 'bg-gray-700',
    },
  ];

  if (variant === 'floating') {
    return (
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50
        hidden lg:flex flex-col gap-3">
        {platforms.map(platform => (
          <ShareButton key={platform.name} {...platform} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">Paylas:</span>
      {platforms.map(platform => (
        <ShareButton key={platform.name} {...platform} size="sm" />
      ))}
    </div>
  );
}
```

#### 2.4.3 Okuma Ilerlemesi ve Etkileimler

**Bilesen:** `apps/web/components/blog/ReadingEngagement.tsx`

```tsx
export function ReadingEngagement({ articleId }) {
  const { progress, timeSpent, hasReachedEnd } = useReadingProgress();
  const { bookmarked, toggleBookmark } = useBookmark(articleId);
  const { liked, likeCount, toggleLike } = useLike(articleId);

  return (
    <>
      {/* Ust ilerleme cubugu */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-600
            transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating aksiyonlar */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <FloatingButton
          icon={bookmarked ? <BookmarkSolid /> : <BookmarkOutline />}
          onClick={toggleBookmark}
          active={bookmarked}
          tooltip="Kaydet"
        />
        <FloatingButton
          icon={<Heart />}
          onClick={toggleLike}
          active={liked}
          count={likeCount}
          tooltip="Begen"
        />
        <FloatingButton
          icon={<Share />}
          onClick={openShareModal}
          tooltip="Paylas"
        />
      </div>

      {/* Okuma tamamlandi popup */}
      {hasReachedEnd && (
        <ReadingCompletePopup
          articleId={articleId}
          timeSpent={timeSpent}
        />
      )}
    </>
  );
}
```

---

### 2.5 BACKEND & API

#### 2.5.1 Blog API Gelistirmeleri

**Dosya:** `apps/web/app/api/articles/route.ts`

```typescript
// Yeni endpoint'ler ekle
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'trending':
      return getTrendingArticles(searchParams);
    case 'recommended':
      return getRecommendedArticles(searchParams);
    case 'related':
      return getRelatedArticles(searchParams);
    case 'search':
      return searchArticles(searchParams);
    default:
      return getArticlesList(searchParams);
  }
}

// Trending makaleler - son 7 gunde en cok okunanlar
async function getTrendingArticles(params: URLSearchParams) {
  const limit = parseInt(params.get('limit') || '6');

  const { data } = await supabase
    .from('articles')
    .select('*, article_views(view_count)')
    .eq('status', 'published')
    .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('views', { ascending: false })
    .limit(limit);

  return NextResponse.json({ articles: data });
}

// Kisisellestirilmis oneriler
async function getRecommendedArticles(params: URLSearchParams) {
  const userId = params.get('userId');
  const currentArticleId = params.get('currentArticle');

  // Kullanici okuma gecmisine dayali oneriler
  const readHistory = await getUserReadHistory(userId);
  const preferredCategories = analyzePreferences(readHistory);

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .in('category', preferredCategories)
    .neq('id', currentArticleId)
    .order('published_at', { ascending: false })
    .limit(6);

  return NextResponse.json({ articles: data });
}
```

#### 2.5.2 Analitik Entegrasyonu

**Yeni Dosya:** `apps/web/lib/analytics/blog-analytics.ts`

```typescript
interface BlogAnalyticsEvent {
  type: 'page_view' | 'read_complete' | 'share' | 'bookmark' | 'comment' | 'like';
  articleId: string;
  articleSlug: string;
  category?: string;
  readingTime?: number;
  scrollDepth?: number;
  referrer?: string;
  device?: string;
}

export class BlogAnalytics {
  private static instance: BlogAnalytics;
  private queue: BlogAnalyticsEvent[] = [];

  static getInstance() {
    if (!this.instance) {
      this.instance = new BlogAnalytics();
    }
    return this.instance;
  }

  track(event: BlogAnalyticsEvent) {
    this.queue.push({
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
    });

    // Batch gonder
    if (this.queue.length >= 5) {
      this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    await fetch('/api/analytics/blog', {
      method: 'POST',
      body: JSON.stringify({ events }),
    });
  }

  // Okuma derinligi takibi
  trackScrollDepth(articleId: string, depth: number) {
    const milestones = [25, 50, 75, 100];
    const milestone = milestones.find(m => depth >= m && !this.trackedMilestones.has(m));

    if (milestone) {
      this.trackedMilestones.add(milestone);
      this.track({
        type: 'scroll_depth',
        articleId,
        scrollDepth: milestone,
      });
    }
  }
}
```

---

### 2.6 YENI OZELLIKLER

#### 2.6.1 Blog Serileri

Birbiriyle baglantili yazilari seri olarak gruplama.

**Veritabani:**
```sql
-- articles tablosuna ekle
ALTER TABLE articles ADD COLUMN series_id UUID REFERENCES article_series(id);
ALTER TABLE articles ADD COLUMN series_order INT;

-- Yeni tablo
CREATE TABLE article_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  cover_image VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Bilesen:**
```tsx
// apps/web/components/blog/ArticleSeries.tsx
export function ArticleSeries({ seriesId, currentArticleId }) {
  const { series, articles } = useSeries(seriesId);

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10
      rounded-2xl p-6 my-8 border border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-6 h-6 text-primary" />
        <div>
          <span className="text-xs font-bold text-primary uppercase">Yazi Serisi</span>
          <h3 className="text-lg font-bold">{series.title}</h3>
        </div>
      </div>

      <div className="space-y-2">
        {articles.map((article, index) => (
          <SeriesItem
            key={article.id}
            article={article}
            order={index + 1}
            isCurrent={article.id === currentArticleId}
          />
        ))}
      </div>
    </div>
  );
}
```

#### 2.6.2 Interaktif Icerik Ogeler

**Dosya:** `apps/web/components/blog/interactive/`

```tsx
// 1. Anket/Poll
export function BlogPoll({ question, options, articleId }) {
  const [voted, setVoted] = useState(false);
  const [results, setResults] = useState(null);

  const handleVote = async (optionId) => {
    const res = await fetch('/api/polls/vote', {
      method: 'POST',
      body: JSON.stringify({ articleId, optionId }),
    });
    setResults(await res.json());
    setVoted(true);
  };

  return (
    <div className="my-8 p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
      <h4 className="text-lg font-bold mb-4">{question}</h4>
      {!voted ? (
        <div className="space-y-3">
          {options.map(option => (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              className="w-full p-4 text-left rounded-xl border-2 border-gray-200
                hover:border-primary hover:bg-primary/5 transition-all"
            >
              {option.text}
            </button>
          ))}
        </div>
      ) : (
        <PollResults results={results} />
      )}
    </div>
  );
}

// 2. Bilgi Karti (Expandable)
export function InfoCard({ title, content, icon }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="my-6 rounded-2xl border-2 border-blue-200 bg-blue-50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-bold">{title}</span>
        </div>
        <ChevronDown className={cn(
          "transition-transform",
          expanded && "rotate-180"
        )} />
      </button>
      {expanded && (
        <div className="px-4 pb-4 text-sm text-gray-700">
          {content}
        </div>
      )}
    </div>
  );
}

// 3. Karsilastirma Tablosu
export function ComparisonTable({ items, criteria }) {
  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-4 text-left">Kriter</th>
            {items.map(item => (
              <th key={item.id} className="p-4 text-center">{item.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {criteria.map(criterion => (
            <tr key={criterion.id} className="border-b">
              <td className="p-4 font-medium">{criterion.name}</td>
              {items.map(item => (
                <td key={item.id} className="p-4 text-center">
                  <RatingDisplay value={item.ratings[criterion.id]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### 2.6.3 Sesli Makale (Text-to-Speech)

```tsx
// apps/web/components/blog/AudioPlayer.tsx
export function ArticleAudioPlayer({ content, title }) {
  const { isPlaying, progress, toggle, seek } = useAudioPlayer(content);

  return (
    <div className="sticky top-20 z-40 mx-auto max-w-4xl px-4">
      <div className="bg-white rounded-full shadow-lg border border-gray-200
        p-2 flex items-center gap-4">
        <button
          onClick={toggle}
          className="w-12 h-12 rounded-full bg-primary text-white
            flex items-center justify-center hover:bg-primary-600 transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <div className="flex-1">
          <div className="text-sm font-medium truncate">{title}</div>
          <div className="h-1 bg-gray-200 rounded-full mt-1">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => seek(-10)}>
            <Rewind className="w-5 h-5" />
          </button>
          <button onClick={() => seek(10)}>
            <FastForward className="w-5 h-5" />
          </button>
          <SpeedSelector />
        </div>
      </div>
    </div>
  );
}
```

---

## 3. UYGULAMA ONCELIK SIRASI

### Faz 1: Temel Iyilestirmeler (1-2 Hafta)
1. ArticleCard tasarim guncellemesi
2. BlogPageHero yenileme
3. Sidebar iyilestirmeleri
4. Core Web Vitals optimizasyonu

### Faz 2: Icerik & SEO (2-3 Hafta)
1. Icerik zenginlestirme sistemi
2. Gelismis Schema.org yapilandirmasi
3. Dinamik icerik bloklari
4. Internal linking otomasyonu

### Faz 3: Etkilesim (2-3 Hafta)
1. Yorum sistemi gelistirmesi
2. Sosyal paylasim entegrasyonu
3. Okuma ilerlemesi ve etkiselimler
4. Newsletter optimizasyonu

### Faz 4: Gelismis Ozellikler (3-4 Hafta)
1. Blog serileri
2. Interaktif icerik ogeleri
3. Kisisellestirilmis oneriler
4. Analitik dashboard

---

## 4. BASARI METRIKLERI

### 4.1 Teknik Metrikler
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTI (Time to Interactive):** < 3.8s

### 4.2 Kullanici Metrikleri
- **Ortalama Oturum Suresi:** +30%
- **Sayfa/Oturum:** +25%
- **Hemen Cikma Orani:** -20%
- **Geri Donen Ziyaretci:** +40%

### 4.3 Is Metrikleri
- **Organik Trafik:** +50%
- **Blog'dan Ilan Goruntuleme:** +35%
- **Newsletter Kayit:** +60%
- **Sosyal Paylasim:** +100%

---

## 5. TEKNIK NOTLAR

### 5.1 Performans Onerileri

```typescript
// next.config.js optimizasyonlari
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@karasu/ui'],
  },
};
```

### 5.2 Cache Stratejisi

```typescript
// ISR ayarlari
export const revalidate = 3600; // 1 saat

// API cache
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

### 5.3 Error Handling

```typescript
// Global error boundary
export function BlogErrorBoundary({ error, reset }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Bir hata olustu</h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <Button onClick={reset}>Tekrar Dene</Button>
      </div>
    </div>
  );
}
```

---

## 6. SONUC

Bu dokuman, karasuemlak.net blog sayfalarini analiz ederek mevcut sistemin nasil gelistirilebilecegini detayli olarak aciklamaktadir. Onerilen iyilestirmeler:

1. **Tasarim:** Premium, modern ve kullanici dostu arayuz
2. **Icerik:** Zenginlestirilmis, SEO uyumlu ve etkilesimli
3. **Performans:** Hizli yukleme ve Core Web Vitals uyumu
4. **Etkilesim:** Sosyal paylasim, yorumlar ve kisisellestirilmis oneriler
5. **Analitik:** Detayli kullanici davranisi takibi

Bu plan uygulandiginda, blog sayfasi hem karasuemlak.net seviyesine ulasacak hem de onu asacaktir.
