'use client';

import { useState, useEffect } from 'react';
import { Button } from '@karasu/ui';
import { Eye, EyeOff, GripVertical, Settings, Save } from 'lucide-react';

interface HomepageSection {
  id: string;
  name: string;
  slug: string;
  is_visible: boolean;
  display_order: number;
  settings?: Record<string, unknown>;
}

const DEFAULT_SECTIONS: HomepageSection[] = [
  { id: 'hero', name: 'Hero Section', slug: 'hero', is_visible: true, display_order: 1, settings: {} },
  { id: 'stats', name: 'Stats Section', slug: 'stats', is_visible: true, display_order: 2, settings: {} },
  { id: 'featured-listings', name: 'Featured Listings', slug: 'featured-listings', is_visible: true, display_order: 3, settings: {} },
  { id: 'neighborhoods', name: 'Neighborhoods', slug: 'neighborhoods', is_visible: true, display_order: 4, settings: {} },
  { id: 'blog-news', name: 'Blog & News', slug: 'blog-news', is_visible: true, display_order: 5, settings: {} },
  { id: 'cta', name: 'CTA Section', slug: 'cta', is_visible: true, display_order: 6, settings: {} },
  { id: 'testimonials', name: 'Testimonials', slug: 'testimonials', is_visible: true, display_order: 7, settings: {} },
];

function normalizeSections(input: HomepageSection[]): HomepageSection[] {
  return [...input]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((section, index) => ({
      ...section,
      id: section.id || section.slug,
      display_order: index + 1,
      settings:
        section.settings && typeof section.settings === 'object' && !Array.isArray(section.settings)
          ? section.settings
          : {},
    }));
}

function serializeSettings(settings?: Record<string, unknown>) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return '{}';
  }

  try {
    return JSON.stringify(settings, null, 2);
  } catch {
    return '{}';
  }
}

export function HomepageManager() {
  const [sections, setSections] = useState<HomepageSection[]>(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(false); // save state
  const [initialLoading, setInitialLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingSettings, setEditingSettings] = useState('{}');
  const [settingsEditorError, setSettingsEditorError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchSections = async () => {
      try {
        setInitialLoading(true);
        setErrorMessage(null);

        const response = await fetch('/api/admin/homepage-sections', {
          cache: 'no-store',
        });
        const result = await response.json();

        if (!active) return;

        if (response.ok && result?.success && Array.isArray(result.sections)) {
          setSections(
            normalizeSections(
              result.sections.map((section: Partial<HomepageSection>) => ({
                id: section.id || section.slug || crypto.randomUUID?.() || String(Math.random()),
                name: section.name || section.slug || 'Bölüm',
                slug: section.slug || '',
                is_visible: Boolean(section.is_visible),
                display_order: typeof section.display_order === 'number' ? section.display_order : 999,
                settings: section.settings,
              })).filter((section: HomepageSection) => section.slug)
            )
          );
          return;
        }

        setErrorMessage(result?.error || 'Ana sayfa bölümleri yüklenemedi');
        setSections(DEFAULT_SECTIONS);
      } catch (error) {
        console.error('Error loading homepage sections:', error);
        if (active) {
          setErrorMessage('Ana sayfa bölümleri yüklenemedi');
          setSections(DEFAULT_SECTIONS);
        }
      } finally {
        if (active) {
          setInitialLoading(false);
        }
      }
    };

    fetchSections();

    return () => {
      active = false;
    };
  }, []);

  const toggleVisibility = (id: string) => {
    setSaved(false);
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, is_visible: !section.is_visible } : section
      )
    );
  };

  const reorderSections = (fromId: string, toId: string) => {
    if (fromId === toId) return;

    setSaved(false);
    setSections((prev) => {
      const ordered = normalizeSections(prev);
      const fromIndex = ordered.findIndex((section) => section.id === fromId);
      const toIndex = ordered.findIndex((section) => section.id === toId);

      if (fromIndex < 0 || toIndex < 0) return prev;

      const next = [...ordered];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);

      return normalizeSections(next);
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/admin/homepage-sections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: sections.map(({ slug, name, is_visible, display_order, settings }) => ({
            slug,
            name,
            is_visible,
            display_order,
            settings: settings || {},
          })),
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Kaydetme başarısız');
      }

      if (Array.isArray(result.sections)) {
        setSections(
          normalizeSections(
            result.sections.map((section: Partial<HomepageSection>) => ({
              id: section.id || section.slug || '',
              name: section.name || section.slug || 'Bölüm',
              slug: section.slug || '',
              is_visible: Boolean(section.is_visible),
              display_order: typeof section.display_order === 'number' ? section.display_order : 999,
              settings: section.settings,
            })).filter((section: HomepageSection) => section.slug)
          )
        );
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Kaydetme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const openSettingsEditor = (section: HomepageSection) => {
    if (editingSectionId === section.id) {
      setEditingSectionId(null);
      setSettingsEditorError(null);
      return;
    }

    setEditingSectionId(section.id);
    setEditingName(section.name);
    setEditingSettings(serializeSettings(section.settings));
    setSettingsEditorError(null);
  };

  const applySectionSettings = () => {
    if (!editingSectionId) return;

    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setSettingsEditorError('Bölüm adı boş olamaz');
      return;
    }

    let parsedSettings: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(editingSettings.trim() || '{}');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('JSON nesne olmalı');
      }
      parsedSettings = parsed as Record<string, unknown>;
    } catch (error) {
      console.error('Invalid section settings JSON:', error);
      setSettingsEditorError('Ayarlar JSON formatında geçerli bir nesne olmalı');
      return;
    }

    setSections((prev) =>
      prev.map((section) =>
        section.id === editingSectionId
          ? {
              ...section,
              name: trimmedName,
              settings: parsedSettings,
            }
          : section
      )
    );
    setSaved(false);
    setSettingsEditorError(null);
    setEditingSectionId(null);
  };

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
        <div>
          <h3 className="font-semibold text-sm">Ana Sayfa Düzeni</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Bölümleri sürükleyerek sıralayın, görünürlüğünü ayarlayın
          </p>
          {errorMessage ? (
            <p className="text-xs text-red-600 mt-2">{errorMessage}</p>
          ) : null}
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading || initialLoading}
          className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <Save className="h-4 w-4 mr-2" />
          {saved ? 'Kaydedildi!' : loading ? 'Kaydediliyor...' : initialLoading ? 'Yükleniyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="space-y-2">
            <div
              draggable
              onDragStart={() => setDraggingId(section.id)}
              onDragEnd={() => setDraggingId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingId) {
                  reorderSections(draggingId, section.id);
                }
                setDraggingId(null);
              }}
              className={`flex items-center gap-4 p-4 bg-white border-2 rounded-lg transition-colors ${
                draggingId === section.id
                  ? 'border-primary/60 opacity-70'
                  : 'border-gray-200 hover:border-primary'
              }`}
            >
              {/* Drag Handle */}
              <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />

              {/* Section Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{section.name}</div>
                <div className="text-xs text-muted-foreground">
                  Sıra: {section.display_order} · Slug: <code>{section.slug}</code>
                </div>
              </div>

              {/* Visibility Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleVisibility(section.id)}
                className={section.is_visible ? 'text-green-600' : 'text-gray-400'}
              >
                {section.is_visible ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Görünür
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Gizli
                  </>
                )}
              </Button>

              {/* Settings Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openSettingsEditor(section)}
                title="Bölüm ayarlarını düzenle"
                aria-expanded={editingSectionId === section.id}
                aria-controls={`homepage-section-settings-${section.id}`}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {editingSectionId === section.id ? (
              <div
                id={`homepage-section-settings-${section.id}`}
                className="rounded-lg border border-gray-200 bg-white p-4 space-y-3"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Bölüm Adı
                  </label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Bölüm adı"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Bölüm Ayarları (JSON)
                  </label>
                  <textarea
                    value={editingSettings}
                    onChange={(e) => setEditingSettings(e.target.value)}
                    rows={8}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-mono leading-5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder='{"title":"Öne Çıkan İlanlar","limit":6}'
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Örnek: <code>{'{"title":"Başlık","subtitle":"Açıklama","limit":6}'}</code>
                  </p>
                </div>

                {settingsEditorError ? (
                  <p className="text-xs text-red-600">{settingsEditorError}</p>
                ) : null}

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingSectionId(null);
                      setSettingsEditorError(null);
                    }}
                  >
                    Vazgeç
                  </Button>
                  <Button type="button" onClick={applySectionSettings}>
                    Ayarları Uygula
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Preview Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-sm text-blue-900 mb-2">
          💡 İpucu
        </h4>
        <p className="text-sm text-blue-700">
          Değişiklikler kaydedildikten sonra ana sayfada otomatik olarak yansıyacaktır. 
          Bölümleri gizlemek yerine sıralamayı değiştirmeyi tercih edin.
        </p>
      </div>
    </div>
  );
}
