'use client';

import { useState, useEffect } from 'react';
import { SavedSearchesList } from './SavedSearchesList';
import { PriceAlertForm } from '@/components/alerts/PriceAlertForm';
import { PushNotificationButton } from '@/components/pwa/PushNotificationButton';
import { Bookmark, Bell } from 'lucide-react';

interface SavedSearchesClientProps {
  basePath?: string;
}

export function SavedSearchesClient({ basePath = '' }: SavedSearchesClientProps) {
  const [email, setEmail] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'searches' | 'alerts'>('searches');

  useEffect(() => {
    // Get email from localStorage or user session
    const storedEmail = localStorage.getItem('user-email');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // Try to get from Supabase auth
      // This is a placeholder - you'd need to implement auth check
      const promptEmail = prompt('E-posta adresinizi girin:');
      if (promptEmail) {
        setEmail(promptEmail);
        localStorage.setItem('user-email', promptEmail);
      }
    }
  }, []);

  if (!email) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Kayıtlı aramalarınızı görüntülemek için e-posta adresinizi girin.
        </p>
        <input
          type="email"
          placeholder="E-posta adresiniz"
          className="px-4 py-2 border rounded-lg"
          onBlur={(e) => {
            if (e.target.value) {
              setEmail(e.target.value);
              localStorage.setItem('user-email', e.target.value);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-8 border-b">
        <button
          onClick={() => setActiveTab('searches')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'searches'
              ? 'border-blue-500 text-blue-600 font-semibold'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Kayıtlı Aramalar
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'alerts'
              ? 'border-blue-500 text-blue-600 font-semibold'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          Fiyat Uyarıları
        </button>
      </div>

      {activeTab === 'searches' && (
        <div className="mt-6">
          <SavedSearchesList email={email} />
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="mt-6 space-y-6">
          <div className="max-w-2xl">
            <PriceAlertForm />
          </div>
          <div className="max-w-2xl border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Push Bildirimleri</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yeni ilanlar ve fiyat değişiklikleri için anında bildirim alın
                </p>
              </div>
              <PushNotificationButton email={email} userId={undefined} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
