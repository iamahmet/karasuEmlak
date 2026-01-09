'use client';

import { useState, useEffect } from 'react';
import { Button } from '@karasu/ui';
import { Eye, EyeOff, GripVertical, Settings, Save } from 'lucide-react';
import { createClient } from '@karasu/lib/supabase/client';

interface HomepageSection {
  id: string;
  name: string;
  slug: string;
  is_visible: boolean;
  display_order: number;
  settings?: Record<string, any>;
}

export function HomepageManager() {
  const [sections, setSections] = useState<HomepageSection[]>([
    { id: '1', name: 'Hero Section', slug: 'hero', is_visible: true, display_order: 1 },
    { id: '2', name: 'Stats Section', slug: 'stats', is_visible: true, display_order: 2 },
    { id: '3', name: 'Featured Listings', slug: 'featured-listings', is_visible: true, display_order: 3 },
    { id: '4', name: 'Neighborhoods', slug: 'neighborhoods', is_visible: true, display_order: 4 },
    { id: '5', name: 'Blog & News', slug: 'blog-news', is_visible: true, display_order: 5 },
    { id: '6', name: 'CTA Section', slug: 'cta', is_visible: true, display_order: 6 },
    { id: '7', name: 'Testimonials', slug: 'testimonials', is_visible: true, display_order: 7 },
  ]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleVisibility = (id: string) => {
    setSections(sections.map(section => 
      section.id === id 
        ? { ...section, is_visible: !section.is_visible }
        : section
    ));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
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
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <Save className="h-4 w-4 mr-2" />
          {saved ? 'Kaydedildi!' : loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section.id}
            className="flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-primary transition-colors"
          >
            {/* Drag Handle */}
            <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />

            {/* Section Info */}
            <div className="flex-1">
              <div className="font-semibold text-sm">{section.name}</div>
              <div className="text-xs text-muted-foreground">
                Sıra: {section.display_order}
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
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
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

