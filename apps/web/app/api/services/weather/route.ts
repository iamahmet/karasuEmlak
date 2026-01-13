/**
 * Weather API Route
 * GET /api/services/weather?city=Karasu&country=TR
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWeather, getWeatherForecast } from '@/lib/services/weather';

export async function GET(request: NextRequest) {
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
      }, { status: 503 }); // Service Unavailable
    }

    if (type === 'forecast') {
      const forecast = await getWeatherForecast(city, country);
      return NextResponse.json({
        success: true,
        data: forecast,
      });
    }

    const weather = await getCurrentWeather(city, country);
    
    if (!weather) {
      return NextResponse.json({
        success: false,
        error: 'Weather data not available',
      }, { status: 503 }); // Service Unavailable instead of 404
    }

    return NextResponse.json({
      success: true,
      data: weather,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Weather API route error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch weather data',
    }, { status: 500 });
  }
}
