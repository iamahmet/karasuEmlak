'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@karasu/ui';
import { fetchWithRetry } from '@/lib/utils/api-client';

interface BusinessHoursWidgetProps {
  className?: string;
}

export function BusinessHoursWidget({ className = '' }: BusinessHoursWidgetProps) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [timeInfo, setTimeInfo] = useState<{
    time: string;
    date: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusinessHours() {
      try {
        setLoading(true);
        
        // Get business hours status
        const hoursData = await fetchWithRetry<{ 
          success: boolean; 
          data?: { isBusinessHours: boolean; message: string } 
        }>('/api/services/timezone?action=business-hours');

        // Get current time
        const timeData = await fetchWithRetry<{ 
          success: boolean; 
          data?: { time: string; date: string } 
        }>('/api/services/timezone?action=turkey');

        if (hoursData.success && hoursData.data) {
          setIsOpen((hoursData.data as any)?.isBusinessHours || false);
        }

        if (timeData.success && timeData.data) {
          setTimeInfo({
            time: (timeData.data as any)?.time || '',
            date: (timeData.data as any)?.date || '',
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Business hours fetch error:', error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchBusinessHours();
    
    // Update every minute
    const interval = setInterval(fetchBusinessHours, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOpen ? 'bg-green-100' : 'bg-gray-100'}`}>
            {isOpen ? (
              <CheckCircle2 className={`h-5 w-5 ${isOpen ? 'text-green-600' : 'text-gray-600'}`} />
            ) : (
              <XCircle className="h-5 w-5 text-gray-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{isOpen ? 'Açık' : 'Kapalı'}</span>
            </div>
            {timeInfo && (
              <div className="text-xs text-muted-foreground mt-1">
                {timeInfo.date} • {timeInfo.time}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              Çalışma Saatleri: Pazartesi - Cuma, 09:00 - 18:00
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
