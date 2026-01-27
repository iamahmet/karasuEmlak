/**
 * Weather API Route
 * GET /api/services/weather?city=Karasu&country=TR
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWeather, getWeatherForecast } from '@/lib/services/weather';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || 'Karasu';
    const country = searchParams.get('country') || 'TR';
    const type = searchParams.get('type') || 'current'; // 'current' or 'forecast'

    // Check if API key is configured
    if (!process.env.OPENWEATHER_API_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('OPENWEATHER_API_KEY not configured');
      }
      return NextResponse.json({
        success: false,
        error: 'Weather service not configured',
        code: 'SERVICE_NOT_CONFIGURED',
        requestId,
      }, { 
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (type === 'forecast') {
      const forecast = await getWeatherForecast(city, country);
      return NextResponse.json({
        success: true,
        data: forecast,
        requestId,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const weather = await getCurrentWeather(city, country);
    
    if (!weather) {
      return NextResponse.json({
        success: false,
        error: 'Weather data not available',
        code: 'DATA_NOT_AVAILABLE',
        requestId,
      }, { 
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return NextResponse.json({
      success: true,
      data: weather,
      requestId,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(`[${requestId}] Weather API route error:`, error);
    
    // Always return JSON
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to fetch weather data',
      code: error?.code || 'INTERNAL_ERROR',
      requestId,
      ...(process.env.NODE_ENV === 'development' && error?.stack ? { stack: error.stack } : {}),
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
