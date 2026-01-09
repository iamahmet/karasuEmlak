/**
 * Cookie Consent Management
 * Handles user cookie preferences and consent
 */

import type { CookieCategory } from './cookie-types';

export interface CookiePreferences {
  necessary: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number; // When preferences were saved
}

const COOKIE_CONSENT_KEY = 'karasu-emlak-cookie-consent';
const COOKIE_CONSENT_VERSION = '1.0';

/**
 * Default cookie preferences
 */
const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true, // Always enabled
  analytics: false,
  marketing: false,
  functional: true, // Enabled by default for better UX
  timestamp: Date.now(),
};

/**
 * Get stored cookie preferences
 */
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(stored);
    
    // Check version compatibility
    if (parsed.version !== COOKIE_CONSENT_VERSION) {
      // Reset to default if version mismatch
      return DEFAULT_PREFERENCES;
    }

    return {
      necessary: true, // Always true
      analytics: parsed.preferences?.analytics ?? false,
      marketing: parsed.preferences?.marketing ?? false,
      functional: parsed.preferences?.functional ?? true,
      timestamp: parsed.timestamp ?? Date.now(),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save cookie preferences
 */
export function saveCookiePreferences(preferences: Partial<CookiePreferences>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getCookiePreferences();
    const updated: CookiePreferences = {
      necessary: true, // Always true
      analytics: preferences.analytics ?? current.analytics,
      marketing: preferences.marketing ?? current.marketing,
      functional: preferences.functional ?? current.functional,
      timestamp: Date.now(),
    };

    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        version: COOKIE_CONSENT_VERSION,
        preferences: updated,
        timestamp: updated.timestamp,
      })
    );

    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', { detail: updated }));
  } catch (error) {
    console.error('Failed to save cookie preferences:', error);
  }
}

/**
 * Check if user has given consent
 */
export function hasConsent(): boolean {
  const preferences = getCookiePreferences();
  return preferences.timestamp > 0;
}

/**
 * Check if a specific category is allowed
 */
export function isCategoryAllowed(category: CookieCategory): boolean {
  const preferences = getCookiePreferences();
  
  switch (category) {
    case 'necessary':
      return true; // Always allowed
    case 'analytics':
      return preferences.analytics;
    case 'marketing':
      return preferences.marketing;
    case 'functional':
      return preferences.functional;
    default:
      return false;
  }
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
  saveCookiePreferences({
    necessary: true,
    analytics: true,
    marketing: true,
    functional: true,
  });
}

/**
 * Reject all optional cookies
 */
export function rejectOptionalCookies(): void {
  saveCookiePreferences({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });
}

/**
 * Reset cookie preferences
 */
export function resetCookiePreferences(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', { detail: DEFAULT_PREFERENCES }));
  } catch (error) {
    console.error('Failed to reset cookie preferences:', error);
  }
}

