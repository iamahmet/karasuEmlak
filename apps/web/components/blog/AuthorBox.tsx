'use client';

import Link from 'next/link';
import { ResponsiveImage } from '@/components/images/ResponsiveImage';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { Mail, Linkedin, Instagram } from 'lucide-react';

interface AuthorBoxProps {
  author: {
    id: string;
    slug: string;
    full_name: string;
    title: string;
    bio: string;
    avatar?: { secure_url: string; alt_text?: string } | null;
    social_json?: {
      email?: string;
      linkedin?: string;
      instagram?: string;
      x?: string;
    };
  };
  basePath: string;
  className?: string;
}

export function AuthorBox({ author, basePath, className }: AuthorBoxProps) {
  const avatarUrl = author.avatar?.secure_url
    ? getOptimizedCloudinaryUrl(author.avatar.secure_url, { width: 120, height: 120 })
    : null;

  return (
    <section className={`mt-12 pt-10 border-t-2 border-gray-200 dark:border-gray-700 ${className || ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-6 p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800/50 dark:via-gray-900 dark:to-gray-800/50 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <Link href={`${basePath}/yazarlar/${author.slug}`}>
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-800 shadow-xl hover:shadow-2xl transition-shadow">
                <ResponsiveImage
                  src={avatarUrl}
                  alt={author.avatar?.alt_text || author.full_name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-primary/30 border-2 border-white dark:border-gray-800">
              {author.full_name.charAt(0)}
            </div>
          )}
        </div>

        {/* Author Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Link
              href={`${basePath}/yazarlar/${author.slug}`}
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary transition-colors"
            >
              {author.full_name}
            </Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {author.title}
            </span>
          </div>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {author.bio}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`${basePath}/yazarlar/${author.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              Yazar Profili
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            {(author.social_json?.email ||
              author.social_json?.linkedin ||
              author.social_json?.instagram) && (
              <div className="flex items-center gap-2">
                {author.social_json?.email && (
                  <a
                    href={`mailto:${author.social_json.email}`}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                    aria-label="E-posta"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                )}
                {author.social_json?.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${author.social_json.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {author.social_json?.instagram && (
                  <a
                    href={`https://instagram.com/${author.social_json.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
