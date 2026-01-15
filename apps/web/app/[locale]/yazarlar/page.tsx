import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import Link from 'next/link';
import { ResponsiveImage } from '@/components/images/ResponsiveImage';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { Button } from '@karasu/ui';
import { ArrowRight, Mail, Linkedin, Instagram } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

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
  try {
    // Log connected project (once per server start)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown';
    if (!(global as any).__authors_logged_project) {
      console.log(`[getAuthors] Connected to Supabase project: ${projectRef}`);
      (global as any).__authors_logged_project = true;
    }
    
    const supabase = await createClient();
    
    // Simple, direct query - no fallbacks
    const { data, error } = await supabase
      .from('authors')
      .select('id, slug, full_name, title, bio, location, is_active, created_at, updated_at, avatar_url, cover_url, specialties')
      .eq('is_active', true)
      .order('full_name', { ascending: true })
      .limit(50);

    if (error) {
      console.error('[getAuthors] Query error:', error.message, error.code);
      return [];
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Return clean data
    return data.map((author: any) => ({
      id: author.id,
      full_name: author.full_name || 'Yazar',
      slug: author.slug || 'unknown',
      title: author.title || '',
      bio: author.bio || '',
      location: author.location || '',
      is_active: author.is_active ?? true,
      created_at: author.created_at,
      updated_at: author.updated_at,
      avatar_url: author.avatar_url || null,
      cover_url: author.cover_url || null,
      specialties: Array.isArray(author.specialties) ? author.specialties : [],
    }));
  } catch (error: any) {
    console.error('[getAuthors] Fatal error:', error?.message);
    return [];
  }
}

export default async function YazarlarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  let locale: string;
  let basePath: string;
  let authors: any[] = [];
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  } catch (error: any) {
    console.error('[YazarlarPage] Error resolving params:', error);
    locale = 'tr';
    basePath = '/tr';
  }

  try {
    authors = await getAuthors();
    console.log('[YazarlarPage] Authors fetched:', authors.length);
  } catch (error: any) {
    console.error('[YazarlarPage] Error fetching authors:', error);
    authors = [];
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Yazarlarımız
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Karasu Emlak blog ekibi. Emlak danışmanları, yatırım analistleri ve yerel rehber uzmanları.
          </p>
        </div>

        {authors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              Henüz yazar eklenmemiş.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Yakında blog yazarlarımız burada görünecek.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {authors.map((author) => {
            const avatarUrl = author.avatar_url 
              ? getOptimizedCloudinaryUrl(author.avatar_url, { width: 400, height: 400 })
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
                        alt={author.full_name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-400">
                        {author.full_name.charAt(0).toUpperCase()}
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

                  {Array.isArray(author.specialties) && author.specialties.length > 0 && (
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
        )}
      </div>
    </>
  );
}
