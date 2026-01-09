/**
 * Currency Exchange API Service
 * Uses ExchangeRate-API (free tier: 1,500 requests/month)
 * Alternative: CurrencyAPI (free tier: 300 requests/month)
 * Alternative: Fixer.io (free tier: 100 requests/month)
 */

import { fetchWithRetry } from '@/lib/utils/api-client';

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
}

export interface CurrencyRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

/**
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(
  from: string = 'TRY',
  to: string = 'USD'
): Promise<ExchangeRate | null> {
  // Use ExchangeRate-API (free, no API key required)
  try {
    const url = `https://api.exchangerate-api.com/v4/latest/${from}`;
    
    const data = await fetchWithRetry<{
      base: string;
      rates: Record<string, number>;
      date: string;
    }>(url);

    if (!data.success || !data.data) {
      return null;
    }

    const rate = data.data.rates[to];
    if (!rate) {
      return null;
    }

    return {
      from,
      to,
      rate,
      timestamp: Date.now(),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Currency API error:', error);
    }
    return null;
  }
}

/**
 * Get all exchange rates for a base currency
 */
export async function getAllRates(
  base: string = 'TRY'
): Promise<CurrencyRates | null> {
  try {
    const url = `https://api.exchangerate-api.com/v4/latest/${base}`;
    
    const data = await fetchWithRetry<{
      base: string;
      rates: Record<string, number>;
      date: string;
    }>(url);

    if (!data.success || !data.data) {
      return null;
    }

    return {
      base: data.data.base,
      rates: data.data.rates,
      timestamp: Date.now(),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Currency rates API error:', error);
    }
    return null;
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  from: string = 'TRY',
  to: string = 'USD'
): Promise<number | null> {
  const rate = await getExchangeRate(from, to);
  if (!rate) {
    return null;
  }

  return amount * rate.rate;
}
