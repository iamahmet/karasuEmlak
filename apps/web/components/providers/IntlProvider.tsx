'use client';

import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';

interface IntlProviderProps {
  locale: string;
  messages: Record<string, any>;
  children: ReactNode;
}

export function IntlProvider({ locale, messages, children }: IntlProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={(error) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[IntlProvider] i18n error:', error);
        }
      }}
      getMessageFallback={({ namespace, key }) => {
        const prefix = namespace ? `${namespace}.` : '';
        return `${prefix}${key}`;
      }}
      timeZone="Europe/Istanbul"
      formats={{
        dateTime: {
          short: {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          },
        },
        number: {
          precise: {
            maximumFractionDigits: 5,
          },
        },
      }}
      now={new Date()}
    >
      {children}
    </NextIntlClientProvider>
  );
}

