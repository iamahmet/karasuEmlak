'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from '@karasu/ui';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import Link from 'next/link';
import { toast } from 'sonner';

interface Author {
  id?: string;
  slug: string;
  full_name: string;
  title?: string;
  bio?: string;
  location?: string;
  specialties: string[];
  languages: string[];
  social_json: {
    email?: string;
    linkedin?: string;
    instagram?: string;
    x?: string;
  };
  is_active: boolean;
  avatar_media_id?: string | null;
  cover_media_id?: string | null;
}

interface AuthorEditorProps {
  authorId?: string;
  locale?: string;
}

export function AuthorEditor({ authorId, locale = 'tr' }: AuthorEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!authorId);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Author>({
    slug: '',
    full_name: '',
    title: '',
    bio: '',
    location: '',
    specialties: [],
    languages: ['tr'],
    social_json: {},
    is_active: true,
    avatar_media_id: null,
    cover_media_id: null,
  });

  useEffect(() => {
    if (authorId) {
      fetchAuthor();
    }
  }, [authorId]);

  async function fetchAuthor() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/authors/${authorId}`);
      if (!response.ok) throw new Error('Yazar yüklenemedi');

      const data = await response.json();
      setFormData(data.author);
    } catch (error: any) {
      console.error('Error fetching author:', error);
      toast.error('Yazar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      // Generate slug from full_name if not provided
      if (!formData.slug && formData.full_name) {
        formData.slug = formData.full_name
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      const url = authorId ? `/api/admin/authors/${authorId}` : '/api/admin/authors';
      const method = authorId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kayıt başarısız');
      }

      const data = await response.json();
      toast.success(authorId ? 'Yazar güncellendi' : 'Yazar oluşturuldu');
      router.push(`/${locale}/yazarlar`);
    } catch (error: any) {
      console.error('Error saving author:', error);
      toast.error(error.message || 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  }

  function handleFieldChange(field: keyof Author, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSocialChange(key: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      social_json: { ...prev.social_json, [key]: value },
    }));
  }

  function handleSpecialtyAdd(specialty: string) {
    if (specialty.trim() && !formData.specialties.includes(specialty.trim())) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, specialty.trim()],
      }));
    }
  }

  function handleSpecialtyRemove(index: number) {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${locale}/yazarlar`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Link>
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {authorId ? 'Yazar Düzenle' : 'Yeni Yazar'}
          </h2>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tam Ad *</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => handleFieldChange('full_name', e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                required
              />
            </div>

            <div>
              <Label>Slug *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => handleFieldChange('slug', e.target.value)}
                placeholder="ahmet-yilmaz"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL'de görünecek kısa adres (otomatik oluşturulur)
              </p>
            </div>

            <div>
              <Label>Ünvan</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Örn: Emlak Danışmanı, Yatırım Uzmanı"
              />
            </div>

            <div>
              <Label>Konum</Label>
              <Input
                value={formData.location || ''}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                placeholder="Örn: Karasu, Sakarya"
              />
            </div>

            <div>
              <Label>Biyografi</Label>
              <Textarea
                value={formData.bio || ''}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                placeholder="Yazar hakkında kısa bilgi..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Uzmanlık ve Sosyal Medya */}
        <Card>
          <CardHeader>
            <CardTitle>Uzmanlık ve Sosyal Medya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Uzmanlık Alanları</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {formData.specialties.map((spec, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => handleSpecialtyRemove(index)}
                      className="hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <Input
                placeholder="Uzmanlık ekle (Enter)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSpecialtyAdd(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>

            <div>
              <Label>E-posta</Label>
              <Input
                type="email"
                value={formData.social_json?.email || ''}
                onChange={(e) => handleSocialChange('email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <Label>LinkedIn</Label>
              <Input
                value={formData.social_json?.linkedin || ''}
                onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                placeholder="linkedin.com/in/username"
              />
            </div>

            <div>
              <Label>Instagram</Label>
              <Input
                value={formData.social_json?.instagram || ''}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                placeholder="@username"
              />
            </div>

            <div>
              <Label>X (Twitter)</Label>
              <Input
                value={formData.social_json?.x || ''}
                onChange={(e) => handleSocialChange('x', e.target.value)}
                placeholder="@username"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleFieldChange('is_active', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Aktif (Yayında görünsün)
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
