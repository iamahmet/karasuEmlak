'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input, Badge } from '@karasu/ui';
import { Edit, Trash2, Search, User, Mail, Linkedin, Instagram, X as XIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Cloudinary URL helper - use direct URL for admin panel
function getOptimizedCloudinaryUrl(url: string, options?: { width?: number; height?: number }) {
  if (!url) return null;
  if (!url.includes('cloudinary.com')) return url;
  
  const parts = url.split('/');
  const uploadIndex = parts.findIndex(p => p === 'upload');
  if (uploadIndex === -1) return url;
  
  const transformations: string[] = [];
  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  transformations.push('c_fill', 'f_auto', 'q_auto');
  
  parts.splice(uploadIndex + 1, 0, transformations.join(','));
  return parts.join('/');
}

// Simple image component for admin panel
function ResponsiveImage({ src, alt, width, height, className }: { src: string; alt: string; width: number; height: number; className?: string }) {
  return <img src={src} alt={alt} width={width} height={height} className={className} />;
}

interface Author {
  id: string;
  slug: string;
  full_name: string;
  title: string;
  bio: string;
  location: string;
  specialties: string[];
  languages: string[];
  social_json: {
    email?: string;
    linkedin?: string;
    instagram?: string;
    x?: string;
  };
  is_active: boolean;
  avatar?: { secure_url: string; alt_text?: string } | null;
  cover?: { secure_url: string; alt_text?: string } | null;
  created_at: string;
  updated_at: string;
}

export function AuthorsManagement() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAuthors();
  }, [filterActive]);

  async function fetchAuthors() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterActive !== null) {
        params.append('is_active', filterActive.toString());
      }

      const response = await fetch(`/api/admin/authors?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch authors');

      const data = await response.json();
      setAuthors(data.authors || []);
    } catch (error) {
      console.error('Error fetching authors:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu yazarı silmek istediğinizden emin misiniz? (Pasif hale getirilecek)')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/authors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete author');

      await fetchAuthors();
    } catch (error) {
      console.error('Error deleting author:', error);
      alert('Yazar silinirken hata oluştu');
    }
  }

  const filteredAuthors = authors.filter((author) => {
    const matchesSearch =
      author.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.slug.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Yazar ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterActive === null ? 'default' : 'outline'}
              onClick={() => setFilterActive(null)}
            >
              Tümü
            </Button>
            <Button
              variant={filterActive === true ? 'default' : 'outline'}
              onClick={() => setFilterActive(true)}
            >
              Aktif
            </Button>
            <Button
              variant={filterActive === false ? 'default' : 'outline'}
              onClick={() => setFilterActive(false)}
            >
              Pasif
            </Button>
          </div>
        </div>
      </Card>

      {/* Authors Grid */}
      {filteredAuthors.length === 0 ? (
        <Card className="p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz yazar eklenmemiş'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthors.map((author) => {
            const avatarUrl = author.avatar?.secure_url
              ? getOptimizedCloudinaryUrl(author.avatar.secure_url, { width: 200, height: 200 })
              : null;

            return (
              <Card key={author.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  {avatarUrl ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-700">
                      <ResponsiveImage
                        src={avatarUrl}
                        alt={author.avatar?.alt_text || author.full_name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-primary">
                        {author.full_name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {author.full_name}
                    </h3>
                    <p className="text-sm text-primary font-medium mb-1">
                      {author.title}
                    </p>
                    {author.location && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        📍 {author.location}
                      </p>
                    )}
                  </div>
                </div>

                {author.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {author.bio}
                  </p>
                )}

                {author.specialties && author.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {author.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Social Links */}
                {(author.social_json?.email ||
                  author.social_json?.linkedin ||
                  author.social_json?.instagram ||
                  author.social_json?.x) && (
                  <div className="flex gap-2 mb-4">
                    {author.social_json?.email && (
                      <a
                        href={`mailto:${author.social_json.email}`}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                        title="E-posta"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {author.social_json?.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${author.social_json.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {author.social_json?.instagram && (
                      <a
                        href={`https://instagram.com/${author.social_json.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {author.social_json?.x && (
                      <a
                        href={`https://x.com/${author.social_json.x}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                        title="X (Twitter)"
                      >
                        <XIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Badge variant={author.is_active ? 'default' : 'secondary'}>
                    {author.is_active ? 'Aktif' : 'Pasif'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/yazarlar/${author.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(author.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
