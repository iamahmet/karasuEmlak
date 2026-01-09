/**
 * Email Validation API Route
 * GET /api/services/validate/email?email=test@example.com
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateEmail } from '@/lib/services/email-validation';
import { withRateLimit } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limiting: 20 requests per minute per IP
  const rateLimitResult = await withRateLimit(request, {
    identifier: 'validate-email',
    limit: 20,
    window: '1 m',
  });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Missing email parameter',
      }, { status: 400 });
    }

    const result = await validateEmail(email);
    
    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Email validation failed',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Email validation API route error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to validate email',
    }, { status: 500 });
  }
}
