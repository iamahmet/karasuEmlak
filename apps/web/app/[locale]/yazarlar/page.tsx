import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ResponsiveImage } from '@/components/images/ResponsiveImage';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { Button } from '@karasu/ui';
import { ArrowRight, Mail, Linkedin, Instagram } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Yazarlar | Karasu Emlak Blog Ekibi',
    description: 'Karasu Emlak blog yazarları. Emlak danışmanları, yatırım analistleri ve yerel rehber uzmanları. Karasu, Kocaali ve Sapanca bölgelerinde deneyimli ekibimiz.',
    keywords: ['karasu emlak yazarlar', 'emlak danışmanları', 'yatırım analistleri', 'sakarya emlak uzmanları'],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/yazarlar`,
    },
  };
}

async function getAuthors() {
  const { data, error } = await supabase
    .from('authors')
    .select(`
      *,
      avatar:media_assets!authors_avatar_media_id_fkey(secure_url, alt_text),
      cover:media_assets!authors_cover_media_id_fkey(secure_url, alt_text)
    `)
    .eq('is_active', true)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching authors:', error);
    return [];
  }

  return data || [];
}

export default async function YazarlarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const authors = await getAuthors();

  // Generate ItemList schema for authors
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Karasu Emlak Yazarları',
    description: 'Karasu Emlak blog yazarları listesi',
    itemListElement: authors.map((author, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Person',
        name: author.full_name,
        jobTitle: author.title,
        url: `${siteConfig.url}${basePath}/yazarlar/${author.slug}`,
        image: author.avatar?.secure_url,
        worksFor: {
          '@type': 'Organization',
          name: 'Karasu Emlak',
          url: siteConfig.url,
        },
      },
    })),
  };

  // Generate Person schemas for each author
  const personSchemas = authors.map((author) => ({
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
    ].filter(Boolean),
  }));

  return (
    <>
      <StructuredData data={itemListSchema} />
      {personSchemas.map((schema, index) => (
        <StructuredData key={index} data={schema} />
      ))}

      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Yazarlar', href: `${basePath}/yazarlar` },
        ]}
      />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Yazarlarımız
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Karasu Emlak blog ekibi. Emlak danışmanları, yatırım analistleri ve yerel rehber uzmanları.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {authors.map((author) => {
            const avatarUrl = author.avatar?.secure_url
              ? getOptimizedCloudinaryUrl(author.avatar.secure_url, { width: 400, height: 400 })
              : null;

            return (
              <Link
                key={author.id}
                href={`${basePath}/yazarlar/${author.slug}`}
                className="group block bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center">
                  {avatarUrl ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-gray-200 dark:border-gray-800 group-hover:border-primary transition-colors">
                      <ResponsiveImage
                        src={avatarUrl}
                        alt={author.avatar?.alt_text || author.full_name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-400">
                        {author.full_name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                    {author.full_name}
                  </h2>
                  <p className="text-sm text-primary font-medium mb-3">
                    {author.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {author.bio}
                  </p>

                  {author.specialties && author.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {author.specialties.slice(0, 3).map((specialty: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center text-primary font-semibold text-sm">
                    Yazarın yazıları
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
