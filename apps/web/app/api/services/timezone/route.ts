/**
 * Timezone API Route
 * GET /api/services/timezone?timezone=Europe/Istanbul
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTimezoneInfo, getTurkeyTime, isBusinessHours } from '@/lib/services/timezone';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timezone = searchParams.get('timezone');
    const action = searchParams.get('action'); // 'turkey' or 'business-hours'

    if (action === 'turkey') {
      const result = await getTurkeyTime();
      if (!result) {
        return NextResponse.json({
          success: false,
          error: 'Failed to get Turkey time',
        }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    if (action === 'business-hours') {
      const isOpen = await isBusinessHours();
      return NextResponse.json({
        success: true,
        data: {
          isBusinessHours: isOpen,
          message: isOpen ? 'Şu anda çalışma saatlerindeyiz' : 'Şu anda çalışma saatleri dışındayız',
        },
      });
    }

    const result = await getTimezoneInfo(timezone || 'Europe/Istanbul');
    
    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get timezone info',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Timezone API route error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to get timezone information',
    }, { status: 500 });
  }
}
