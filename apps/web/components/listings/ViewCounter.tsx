"use client";

import { useEffect, useState } from 'react';
import { Eye, TrendingUp, Clock, Users } from 'lucide-react';
import { Skeleton } from '@karasu/ui';
import { cn } from '@karasu/lib';

interface ViewCounterProps {
  propertyId: string;
  className?: string;
}

export function ViewCounter({ propertyId, className }: ViewCounterProps) {
  const [views, setViews] = useState(0);
  const [todayViews, setTodayViews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from API
    // For now, use mock data with realistic numbers
    const baseViews = parseInt(propertyId.substring(0, 4), 16) % 500;
    const mockViews = 50 + baseViews;
    const mockTodayViews = Math.floor(mockViews * 0.05) + 2;
    const mockUniqueVisitors = Math.floor(mockViews * 0.7);

    setTimeout(() => {
      setViews(mockViews);
      setTodayViews(mockTodayViews);
      setUniqueVisitors(mockUniqueVisitors);
      setIsLoading(false);
    }, 500);

    // Track this view
    const viewedKey = `viewed_${propertyId}`;
    if (!sessionStorage.getItem(viewedKey)) {
      sessionStorage.setItem(viewedKey, 'true');
      // In production, call API to increment view count
    }
  }, [propertyId]);

  if (isLoading) {
    return (
      <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-4", className)}>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center p-3 bg-gray-50 rounded-xl">
              <Skeleton className="h-4 w-4 mx-auto mb-2" />
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-4", className)}>
      <div className="grid grid-cols-3 gap-3">
        {/* Total Views */}
        <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Eye className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-900">{views}</div>
          <div className="text-xs text-blue-700">Görüntülenme</div>
        </div>

        {/* Today Views */}
        <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-xl font-bold text-green-900">{todayViews}</div>
          <div className="text-xs text-green-700">Bugün</div>
        </div>

        {/* Unique Visitors */}
        <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-900">{uniqueVisitors}</div>
          <div className="text-xs text-purple-700">Ziyaretçi</div>
        </div>
      </div>

      {/* Popularity Indicator */}
      {views > 100 && (
        <div className="mt-3 flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
          <TrendingUp className="h-4 w-4 text-orange-600" />
          <span className="text-xs font-semibold text-orange-700">Popüler İlan! 🔥</span>
        </div>
      )}
    </div>
  );
}

export default ViewCounter;

