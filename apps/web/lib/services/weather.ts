/**
 * Weather API Service
 * Uses OpenWeatherMap API (free tier: 60 calls/minute, 1,000,000 calls/month)
 * Alternative: WeatherAPI.com (free tier: 1M calls/month)
 */

import { fetchWithRetry } from '@/lib/utils/api-client';

export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  location: string;
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  condition: string;
  icon: string;
}

/**
 * Get current weather for a location
 */
export async function getCurrentWeather(
  city: string,
  country: string = 'TR'
): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('OPENWEATHER_API_KEY not configured');
    }
    return null;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},${country}&appid=${apiKey}&units=metric&lang=tr`;
    
    const data = await fetchWithRetry<{
      main: { temp: number; feels_like: number; humidity: number };
      weather: Array<{ main: string; description: string; icon: string }>;
      wind: { speed: number };
      name: string;
    }>(url);

    if (!data.success || !data.data) {
      return null;
    }

    const weather = data.data.weather[0];
    const main = data.data.main;

    return {
      temperature: Math.round(main.temp),
      condition: weather.main,
      description: weather.description,
      icon: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
      humidity: main.humidity,
      windSpeed: Math.round(data.data.wind.speed * 3.6), // m/s to km/h
      feelsLike: Math.round(main.feels_like),
      location: data.data.name,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Weather API error:', error);
    }
    return null;
  }
}

/**
 * Get 5-day weather forecast
 */
export async function getWeatherForecast(
  city: string,
  country: string = 'TR'
): Promise<WeatherForecast[]> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},${country}&appid=${apiKey}&units=metric&lang=tr`;
    
    const data = await fetchWithRetry<{
      list: Array<{
        dt: number;
        main: { temp_min: number; temp_max: number };
        weather: Array<{ main: string; icon: string }>;
      }>;
    }>(url);

    if (!data.success || !data.data) {
      return [];
    }

    // Group by day and get min/max temps
    const dailyForecasts = new Map<string, WeatherForecast>();

    data.data.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];

      if (!dailyForecasts.has(dateKey)) {
        dailyForecasts.set(dateKey, {
          date: dateKey,
          temperature: {
            min: Math.round(item.main.temp_min),
            max: Math.round(item.main.temp_max),
          },
          condition: item.weather[0].main,
          icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
        });
      } else {
        const existing = dailyForecasts.get(dateKey)!;
        existing.temperature.min = Math.min(existing.temperature.min, Math.round(item.main.temp_min));
        existing.temperature.max = Math.max(existing.temperature.max, Math.round(item.main.temp_max));
      }
    });

    return Array.from(dailyForecasts.values()).slice(0, 5);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Weather forecast API error:', error);
    }
    return [];
  }
}
