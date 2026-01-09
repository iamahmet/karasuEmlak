"use client";

import { useEffect, useState } from "react";
import { Eye, Heart, MessageCircle, TrendingUp, Clock } from "lucide-react";
import { cn } from "@karasu/lib";

interface Activity {
  id: string;
  type: 'view' | 'favorite' | 'inquiry' | 'listing';
  text: string;
  time: string;
  location?: string;
}

export function RecentActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Simulated real-time activities
  const sampleActivities: Activity[] = [
    { id: '1', type: 'view', text: 'Sahil Mahallesi\'nde 3+1 daire', time: '2 dakika önce', location: 'Karasu' },
    { id: '2', type: 'favorite', text: 'Merkez\'de satılık villa favorilere eklendi', time: '5 dakika önce', location: 'Karasu' },
    { id: '3', type: 'inquiry', text: 'Liman Mahallesi için bilgi talebi', time: '8 dakika önce', location: 'Karasu' },
    { id: '4', type: 'listing', text: 'Yeni ilan: Çamlık\'ta 2+1 daire', time: '12 dakika önce', location: 'Karasu' },
    { id: '5', type: 'view', text: 'Kocaali\'de arsa görüntülendi', time: '15 dakika önce', location: 'Kocaali' },
  ];

  useEffect(() => {
    setActivities(sampleActivities);
    
    // Rotate activities every 3 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sampleActivities.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'view': return Eye;
      case 'favorite': return Heart;
      case 'inquiry': return MessageCircle;
      case 'listing': return TrendingUp;
      default: return Eye;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'view': return 'text-blue-600 bg-blue-50';
      case 'favorite': return 'text-red-600 bg-red-50';
      case 'inquiry': return 'text-green-600 bg-green-50';
      case 'listing': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (activities.length === 0) return null;

  const currentActivity = activities[currentIndex];
  const Icon = getIcon(currentActivity.type);

  return (
    <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
      <div
        className={cn(
          "bg-white rounded-xl shadow-xl border-2 border-gray-200",
          "p-4 max-w-sm",
          "transition-all duration-500",
          "animate-in slide-in-from-left-4 fade-in"
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg flex-shrink-0",
            getColor(currentActivity.type)
          )}>
            <Icon className="h-4 w-4 stroke-[2]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-gray-900 mb-1 tracking-[-0.01em]">
              {currentActivity.text}
            </p>
            <div className="flex items-center gap-2 text-[12px] text-gray-500">
              <Clock className="h-3 w-3 stroke-[2]" />
              <span>{currentActivity.time}</span>
              {currentActivity.location && (
                <>
                  <span>•</span>
                  <span>{currentActivity.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-3 flex gap-1">
          {activities.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                index === currentIndex ? "bg-[#006AFF]" : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

