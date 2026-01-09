/**
 * Social Proof Widget Component
 * Shows recent activity, views, and sold properties
 * Creates FOMO (Fear of Missing Out) effect
 */

'use client';

import { useState, useEffect } from 'react';
import { Eye, Clock, CheckCircle } from 'lucide-react';

interface SocialProofWidgetProps {
  propertyId?: string;
  propertySlug?: string;
  propertyType?: string;
  showRecentViews?: boolean;
  showSoldProperties?: boolean;
  showActivityFeed?: boolean;
}

interface Activity {
  type: 'view' | 'sold' | 'new';
  propertyTitle: string;
  propertySlug: string;
  propertyType: string;
  timestamp: Date;
  location?: string;
}

export default function SocialProofWidget({
  propertyId,
  propertySlug,
  propertyType,
  showRecentViews = true,
  showSoldProperties = true,
  showActivityFeed = true,
}: SocialProofWidgetProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [viewCount, setViewCount] = useState<number>(0);
  const [recentViewers, setRecentViewers] = useState<number>(0);

  useEffect(() => {
    // Simulate activity (in production, this would come from analytics API)
    const generateActivities = (): Activity[] => {
      const mockActivities: Activity[] = [];

      // Recent views
      if (showRecentViews) {
        const sampleProperties = [
          { title: 'Denize Sıfır Villa', slug: 'denize-sifir-villa', type: 'villa', location: 'Merkez' },
          { title: 'Modern Daire', slug: 'modern-daire', type: 'daire', location: 'Sahil' },
          { title: 'Yazlık Ev', slug: 'yazlik-ev', type: 'yazlik', location: 'Kıyı' },
        ];

        sampleProperties.forEach((property) => {
          mockActivities.push({
            type: 'view',
            propertyTitle: property.title,
            propertySlug: property.slug,
            propertyType: property.type,
            timestamp: new Date(Date.now() - Math.random() * 3600000), // Last hour
            location: property.location,
          });
        });
      }

      // Sold properties
      if (showSoldProperties) {
        const soldProperties = [
          { title: 'Lüks Villa', slug: 'luks-villa', type: 'villa', location: 'Merkez' },
          { title: 'Bahçeli Ev', slug: 'bahceli-ev', type: 'ev', location: 'Sahil' },
        ];

        soldProperties.forEach((property) => {
          mockActivities.push({
            type: 'sold',
            propertyTitle: property.title,
            propertySlug: property.slug,
            propertyType: property.type,
            timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Last week
            location: property.location,
          });
        });
      }

      // Sort by timestamp
      mockActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return mockActivities.slice(0, 5);
    };

    const activities = generateActivities();
    setActivities(activities);

    // Update view count (simulated)
    if (propertyId) {
      // In production, get from analytics API
      setViewCount(Math.floor(Math.random() * 50) + 10);
      setRecentViewers(Math.floor(Math.random() * 10) + 1);
    }

    // Refresh activities every 30 seconds
    const interval = setInterval(() => {
      const newActivities = generateActivities();
      setActivities(newActivities);
    }, 30000);

    return () => clearInterval(interval);
  }, [propertyId, showRecentViews, showSoldProperties]);

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
    return `${Math.floor(seconds / 86400)} gün önce`;
  };

  if (!showActivityFeed && !propertyId) return null;

  return (
    <div className="space-y-4">
      {/* View Count (if property page) */}
      {propertyId && viewCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Eye className="w-5 h-5" />
            <div>
              <p className="font-semibold">{viewCount} kişi bu ilanı inceledi</p>
              {recentViewers > 0 && (
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Son 1 saatte {recentViewers} kişi görüntüledi
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity Feed */}
      {showActivityFeed && activities.length > 0 && (
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Son Aktiviteler
          </h4>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 text-sm animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {activity.type === 'sold' ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p>
                    {activity.type === 'sold' ? (
                      <>
                        <span className="font-medium">{activity.propertyTitle}</span> satıldı
                      </>
                    ) : (
                      <>
                        <span className="font-medium">{activity.propertyTitle}</span> görüntülendi
                      </>
                    )}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {activity.location && `${activity.location} • `}
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

