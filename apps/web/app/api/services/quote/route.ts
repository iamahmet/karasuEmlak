/**
 * Quote API Route
 * GET /api/services/quote
 */

import { NextResponse } from 'next/server';
import { getRandomQuote } from '@/lib/services/quotes';

export async function GET() {
  try {
    const quote = await getRandomQuote();
    
    if (!quote) {
      return NextResponse.json({
        success: false,
        error: 'Quote not available',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Quote API route error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch quote',
    }, { status: 500 });
  }
}
