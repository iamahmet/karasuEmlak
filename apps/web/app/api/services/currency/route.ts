/**
 * Currency Exchange API Route
 * GET /api/services/currency?from=TRY&to=USD
 * GET /api/services/currency?base=TRY (all rates)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRate, getAllRates, convertCurrency } from '@/lib/services/currency';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from') || 'TRY';
    const to = searchParams.get('to');
    const base = searchParams.get('base');
    const amount = searchParams.get('amount');

    // If amount provided, convert currency
    if (amount && to) {
      const converted = await convertCurrency(parseFloat(amount), from, to);
      if (converted === null) {
        return NextResponse.json({
          success: false,
          error: 'Currency conversion failed',
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: {
          from,
          to,
          amount: parseFloat(amount),
          converted,
        },
      });
    }

    // If base provided, get all rates
    if (base) {
      const rates = await getAllRates(base);
      if (!rates) {
        return NextResponse.json({
          success: false,
          error: 'Currency rates not available',
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: rates,
      });
    }

    // Get single exchange rate
    if (to) {
      const rate = await getExchangeRate(from, to);
      if (!rate) {
        return NextResponse.json({
          success: false,
          error: 'Exchange rate not available',
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: rate,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Missing required parameters',
    }, { status: 400 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Currency API route error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch currency data',
    }, { status: 500 });
  }
}
