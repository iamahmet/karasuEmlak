import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { ResponsiveImage } from '@/components/images/ResponsiveImage';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { Mail, Linkedin, Instagram, ArrowLeft, Calendar, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function generateStaticParams() {
  const { data: authors } = await supabase
    .from('authors')
    .select('slug')
    .eq('is_active', true);

  return (authors || []).map((author) => ({
    slug: author.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { locale } = await params as any;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const { data: author } = await supabase
    .from('authors')
    .select('full_name, title, bio, avatar:media_assets!authors_avatar_media_id_fkey(secure_url)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!author) {
    return {};
  }

  return {
    title: `${author.full_name} - ${author.title} | Karasu Emlak`,
    description: author.bio || `${author.full_name}, ${author.title}. Karasu Emlak blog yazarı.`,
    keywords: [author.full_name, author.title, 'karasu emlak yazarı'],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/yazarlar/${slug}`,
    },
    openGraph: {
      title: `${author.full_name} - ${author.title}`,
      description: author.bio || '',
      images: author.avatar?.secure_url ? [author.avatar.secure_url] : [],
    },
  };
}

async function getAuthor(slug: string) {
  const { data, error } = await supabase
    .from('authors')
    .select(`
      *,
      avatar:media_assets!authors_avatar_media_id_fkey(secure_url, alt_text),
      cover:media_assets!authors_cover_media_id_fkey(secure_url, alt_text)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getAuthorArticles(authorId: string, limit: number = 20) {
  const { data, error } = await supabase
    .from('article_authors')
    .select(`
      article:articles!inner(
        id,
        slug,
        title,
        excerpt,
        published_at,
        views,
        category
      )
    `)
    .eq('author_id', authorId)
    .eq('article.status', 'published')
    .order('article.published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching author articles:', error);
    return [];
  }

  return (data || []).map((item: any) => item.article).filter(Boolean);
}

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale?: string }>;
}) {
  const { slug, locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const author = await getAuthor(slug);

  if (!author) {
    notFound();
  }

  const articles = await getAuthorArticles(author.id);

  // Calculate stats
  const totalArticles = articles.length;
  const totalWords = articles.reduce((sum, article) => {
    const content = article.content || '';
    return sum + content.split(/\s+/).length;
  }, 0);
  const lastArticleDate = articles[0]?.published_at
    ? new Date(articles[0].published_at)
    : null;

  // Generate Person schema
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.full_name,
    jobTitle: author.title,
    url: `${siteConfig.url}${basePath}/yazarlar/${author.slug}`,
    image: author.avatar?.secure_url,
    description: author.bio,
    worksFor: {
      '@type': 'Organization',
      name: 'Karasu Emlak',
      url: siteConfig.url,
    },
    sameAs: [
      author.social_json?.linkedin && `https://linkedin.com/in/${author.social_json.linkedin}`,
      author.social_json?.instagram && `https://instagram.com/${author.social_json.instagram}`,
      author.social_json?.x && `https://x.com/${author.social_json.x}`,
      author.social_json?.email && `mailto:${author.social_json.email}`,
    ].filter(Boolean),
  };

  const coverUrl = author.cover?.secure_url
    ? getOptimizedCloudinaryUrl(author.cover.secure_url, { width: 1200, height: 400 })
    : null;
  const avatarUrl = author.avatar?.secure_url
    ? getOptimizedCloudinaryUrl(author.avatar.secure_url, { width: 200, height: 200 })
    : null;

  return (
    <>
      <StructuredData data={personSchema} />

      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Yazarlar', href: `${basePath}/yazarlar` },
          { label: author.full_name, href: `${basePath}/yazarlar/${author.slug}` },
        ]}
      />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          {coverUrl ? (
            <div className="absolute inset-0 opacity-30">
              <ResponsiveImage
                src={coverUrl}
                alt={author.cover?.alt_text || `${author.full_name} cover`}
                width={1200}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10" />
          )}

          <div className="relative container mx-auto px-4 py-16 lg:py-24">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {avatarUrl ? (
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 flex-shrink-0">
                    <ResponsiveImage
                      src={avatarUrl}
                      alt={author.avatar?.alt_text || author.full_name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl font-bold text-white">
                      {author.full_name.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {author.full_name}
                  </h1>
                  <p className="text-xl text-white/90 mb-4">
                    {author.title}
                  </p>
                  {author.location && (
                    <p className="text-white/70 mb-6">
                      📍 {author.location}
                    </p>
                  )}

                  {/* Social Links */}
                  {(author.social_json?.email ||
                    author.social_json?.linkedin ||
                    author.social_json?.instagram ||
                    author.social_json?.x) && (
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      {author.social_json?.email && (
                        <a
                          href={`mailto:${author.social_json.email}`}
                          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                        >
                          <Mail className="w-5 h-5" />
                          <span className="text-sm">E-posta</span>
                        </a>
                      )}
                      {author.social_json?.linkedin && (
                        <a
                          href={`https://linkedin.com/in/${author.social_json.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                          <span className="text-sm">LinkedIn</span>
                        </a>
                      )}
                      {author.social_json?.instagram && (
                        <a
                          href={`https://instagram.com/${author.social_json.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                        >
                          <Instagram className="w-5 h-5" />
                          <span className="text-sm">Instagram</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Bio */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Hakkında
                </h2>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {author.bio}
                  </p>
                </div>
              </section>

              {/* Specialties */}
              {author.specialties && author.specialties.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Uzmanlık Alanları
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {author.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-lg font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Articles */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Yazıları ({totalArticles})
                </h2>
                {articles.length > 0 ? (
                  <div className="space-y-6">
                    {articles.map((article: any) => (
                      <Link
                        key={article.id}
                        href={`${basePath}/blog/${article.slug}`}
                        className="block bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-lg"
                      >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                          {article.published_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(article.published_at)}
                            </div>
                          )}
                          {article.views > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {article.views} görüntüleme
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-gray-600 dark:text-gray-400">
                      Henüz yayınlanmış yazı bulunmuyor.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Yazar İstatistikleri
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Toplam Yazı
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {totalArticles}
                    </div>
                  </div>
                  {totalWords > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Toplam Kelime
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {totalWords.toLocaleString('tr-TR')}
                      </div>
                    </div>
                  )}
                  {lastArticleDate && (
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Son Yazı
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatDate(lastArticleDate.toISOString())}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`${basePath}/yazarlar`}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Tüm Yazarlar
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
