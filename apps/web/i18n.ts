import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from request, fallback to default if invalid
  let locale = await requestLocale;

  // Validate locale - if invalid or not in supported locales, use default
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Load messages for the locale with error handling
  let messages = {};
  try {
    const messagesModule = await import(`./messages/${locale}.json`);
    messages = messagesModule.default || {};
  } catch (error: any) {
    console.error(`[i18n] Failed to load messages for locale "${locale}":`, error?.message);
    // Fallback to default locale messages
    try {
      const fallbackModule = await import(`./messages/${routing.defaultLocale}.json`);
      messages = fallbackModule.default || {};
    } catch (fallbackError: any) {
      console.error(`[i18n] Failed to load fallback messages:`, fallbackError?.message);
      messages = {};
    }
  }

  return { locale, messages };
});

