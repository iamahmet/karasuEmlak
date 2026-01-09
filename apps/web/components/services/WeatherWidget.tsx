'use client';

import { useEffect, useState } from 'react';
import { Cloud, Droplets, Wind, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { LoadingState } from '@/components/ui/LoadingState';
import { fetchWithRetry } from '@/lib/utils/api-client';

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  location: string;
}

interface WeatherWidgetProps {
  city?: string;
  country?: string;
  className?: string;
}

export function WeatherWidget({ 
  city = 'Karasu', 
  country = 'TR',
  className = '' 
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        const response = await fetchWithRetry<WeatherData>(
          `/api/services/weather?city=${encodeURIComponent(city)}&country=${country}`
        );

        if (response.success && response.data) {
          setWeather(response.data);
        } else {
          setError('Hava durumu bilgisi alınamadı');
        }
      } catch (err) {
        setError('Hava durumu yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [city, country]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <LoadingState variant="skeleton" skeletonCount={3} />
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return null; // Fail silently
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Hava Durumu - {weather.location}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {weather.icon && (
              <img 
                src={weather.icon} 
                alt={weather.condition}
                className="w-16 h-16"
              />
            )}
            <div>
              <div className="text-3xl font-bold">{weather.temperature}°C</div>
              <div className="text-sm text-muted-foreground capitalize">
                {weather.description}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Hissedilen</div>
              <div className="text-sm font-semibold">{weather.feelsLike}°C</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Nem</div>
              <div className="text-sm font-semibold">%{weather.humidity}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Rüzgar</div>
              <div className="text-sm font-semibold">{weather.windSpeed} km/h</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
