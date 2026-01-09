"use client";

import { useEffect, useState } from "react";
import { Home, Key, TrendingUp, Users } from "lucide-react";
import { cn } from "@karasu/lib";

interface StatsSectionProps {
  initialStats?: {
    total: number;
    satilik: number;
    kiralik: number;
  };
}

export function StatsSection({ initialStats }: StatsSectionProps) {
  const [stats, setStats] = useState(initialStats || { total: 0, satilik: 0, kiralik: 0 });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setTimeout(() => setAnimated(true), 100);

    // Fetch real-time stats
    async function fetchStats() {
      try {
        const { fetchWithRetry } = await import('@/lib/utils/api-client');
        const data = await fetchWithRetry('/api/stats/listings');
        if (data.success && data.data) {
          setStats(data.data);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching stats:', error);
        }
      }
    }

    fetchStats();
  }, []);

  const statItems = [
    {
      icon: Home,
      value: stats.total,
      label: "Aktif İlan",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      icon: Key,
      value: stats.satilik,
      label: "Satılık",
      color: "from-[#006AFF] to-[#0052CC]",
      bgColor: "bg-blue-50",
      textColor: "text-[#006AFF]",
    },
    {
      icon: TrendingUp,
      value: stats.kiralik,
      label: "Kiralık",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      icon: Users,
      value: "1000+",
      label: "Mutlu Müşteri",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-white via-gray-50/50 to-white border-y border-gray-200 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse-subtle animation-delay-1s" />
      </div>
      
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {statItems.map((item, index) => (
            <div
              key={index}
              className={cn(
                "group relative p-6 lg:p-8",
                "bg-gradient-to-br from-white via-white to-gray-50/50",
                "border-2 border-gray-200",
                "rounded-2xl",
                "transition-all duration-500 ease-out",
                "hover:border-[#006AFF]/30 hover:shadow-2xl hover:-translate-y-3",
                "hover:shadow-[#006AFF]/10",
                "animate-in fade-in slide-in-from-bottom-4",
                animated && "opacity-100",
                "overflow-hidden"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={cn(
                "inline-flex p-3 rounded-xl mb-4",
                "transition-all duration-300",
                "group-hover:scale-110",
                item.bgColor
              )}>
                <item.icon className={cn("h-6 w-6 stroke-[2]", item.textColor)} />
              </div>

              {/* Value */}
              <div className={cn(
                "text-[36px] lg:text-[42px] font-display font-bold",
                "bg-gradient-to-r bg-clip-text text-transparent",
                "leading-none mb-2",
                "tracking-[-0.025em]",
                item.color
              )}>
                {typeof item.value === 'number' ? item.value.toLocaleString('tr-TR') : item.value}
              </div>

              {/* Label */}
              <div className="text-[15px] font-medium text-gray-600 tracking-[-0.011em]">
                {item.label}
              </div>

              {/* Decorative Element */}
              <div className={cn(
                "absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0",
                "transition-opacity duration-300",
                "group-hover:opacity-20",
                `bg-gradient-to-br ${item.color}`
              )} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

