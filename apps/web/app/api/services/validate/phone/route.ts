/**
 * Phone Validation API Route
 * GET /api/services/validate/phone?phone=+905466395461&countryCode=TR
 */

import { NextRequest, NextResponse } from 'next/server';
import { validatePhone, formatTurkishPhone } from '@/lib/services/phone-validation';
import { withRateLimit } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limiting: 20 requests per minute per IP
  const rateLimitResult = await withRateLimit(request, {
    identifier: 'validate-phone',
    limit: 20,
    window: '1 m',
  });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');
    const countryCode = searchParams.get('countryCode');
    const format = searchParams.get('format'); // 'turkish' or null

    if (!phone) {
      return NextResponse.json({
        success: false,
        error: 'Missing phone parameter',
      }, { status: 400 });
    }

    const result = await validatePhone(phone, countryCode || undefined);
    
    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Phone validation failed',
      }, { status: 500 });
    }

    // Format Turkish phone if requested
    if (format === 'turkish' && result.countryCode === 'TR') {
      result.phone = formatTurkishPhone(result.phone);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Phone validation API route error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to validate phone',
    }, { status: 500 });
  }
}
