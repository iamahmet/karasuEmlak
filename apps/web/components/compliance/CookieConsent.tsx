'use client';

import { useState, useEffect } from 'react';
import { Button, Switch, Label } from '@karasu/ui';
import { X, Settings, Cookie } from 'lucide-react';
import Link from 'next/link';
import { safeJsonParse } from '@/lib/utils/safeJsonParse';

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_CONSENT_VERSION = '1.0';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    } else {
      // Load saved preferences safely
      const saved = safeJsonParse<{ version: string; preferences: CookiePreferences } | null>(consent, null, {
        context: 'cookie-consent',
        dedupeKey: 'cookie-consent',
      });
      if (saved && saved.version === COOKIE_CONSENT_VERSION) {
        setPreferences(saved.preferences);
      } else {
        // Version mismatch or invalid JSON, show banner again
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const consent = {
      version: COOKIE_CONSENT_VERSION,
      preferences: prefs,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
    setShowSettings(false);
    
    // Update GA4 consent based on analytics preference
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
      });
    }

    // Dispatch event for other components to react to consent changes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', {
        detail: prefs,
      }));
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner && !showSettings) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Cookie className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Çerez Kullanımı</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Bu web sitesi, size en iyi deneyimi sunmak için çerezler kullanmaktadır. 
                  KVKK ve GDPR uyumlu olarak çerez tercihlerinizi yönetebilirsiniz.
                </p>
                <Link 
                  href="/cerez-politikasi" 
                  className="text-sm text-primary hover:underline"
                >
                  Çerez Politikası
                </Link>
                {' '}ve{' '}
                <Link 
                  href="/gizlilik-politikasi" 
                  className="text-sm text-primary hover:underline"
                >
                  Gizlilik Politikası
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowBanner(false);
                    setShowSettings(true);
                  }}
                  className="w-full md:w-auto"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Ayarlar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="w-full md:w-auto"
                >
                  Reddet
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="w-full md:w-auto"
                >
                  Kabul Et
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Çerez Ayarları</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowSettings(false);
                    if (!localStorage.getItem(COOKIE_CONSENT_KEY)) {
                      setShowBanner(true);
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6 mb-6">
                {/* Necessary Cookies */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">Zorunlu Çerezler</h3>
                      <p className="text-sm text-muted-foreground">
                        Web sitesinin çalışması için gerekli çerezler
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-muted rounded text-sm font-medium">
                      Her zaman aktif
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">Analitik Çerezler</h3>
                      <p className="text-sm text-muted-foreground">
                        Web sitesi kullanımını analiz etmek için (Google Analytics)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="analytics-cookies"
                        checked={preferences.analytics}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, analytics: checked })
                        }
                      />
                      <Label htmlFor="analytics-cookies" className="cursor-pointer">
                        {preferences.analytics ? 'Aktif' : 'Pasif'}
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">Pazarlama Çerezleri</h3>
                      <p className="text-sm text-muted-foreground">
                        Kişiselleştirilmiş reklamlar için çerezler
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="marketing-cookies"
                        checked={preferences.marketing}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, marketing: checked })
                        }
                      />
                      <Label htmlFor="marketing-cookies" className="cursor-pointer">
                        {preferences.marketing ? 'Aktif' : 'Pasif'}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleRejectAll}
                  className="flex-1"
                >
                  Tümünü Reddet
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAcceptAll}
                  className="flex-1"
                >
                  Tümünü Kabul Et
                </Button>
                <Button
                  onClick={handleSavePreferences}
                  className="flex-1"
                >
                  Tercihleri Kaydet
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Link
                  href="/cerez-politikasi"
                  className="text-sm text-primary hover:underline text-center block"
                >
                  Detaylı Çerez Politikası
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

