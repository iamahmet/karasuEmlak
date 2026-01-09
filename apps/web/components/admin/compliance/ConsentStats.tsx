"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Users, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

interface ConsentStatsProps {
  totalConsents: number;
  grantedConsents: number;
  consentRate: number;
}

export function ConsentStats({
  totalConsents,
  grantedConsents,
  consentRate,
}: ConsentStatsProps) {
  const rejectedConsents = totalConsents - grantedConsents;
  const grantedPercentage = totalConsents > 0 ? ((grantedConsents / totalConsents) * 100) : 0;
  const rejectedPercentage = totalConsents > 0 ? ((rejectedConsents / totalConsents) * 100) : 0;

  const stats = [
    {
      label: "Toplam Onay",
      value: totalConsents.toLocaleString("tr-TR"),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Tüm zamanlar",
    },
    {
      label: "Kabul Edilen",
      value: grantedConsents.toLocaleString("tr-TR"),
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: `${grantedPercentage.toFixed(1)}%`,
      trend: "+",
    },
    {
      label: "Reddedilen",
      value: rejectedConsents.toLocaleString("tr-TR"),
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: `${rejectedPercentage.toFixed(1)}%`,
    },
    {
      label: "Onay Oranı",
      value: `${consentRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Kabul oranı",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="card-professional bg-white dark:bg-[#0a3d35] hover-lift animate-slide-up group cursor-pointer relative overflow-hidden"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-design-light/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-3 px-5 pt-5 relative z-10">
              <CardTitle className="text-[10px] md:text-xs font-ui font-bold text-design-gray dark:text-gray-400 uppercase tracking-wider">
                {stat.label}
              </CardTitle>
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-design-light/20 via-design-light/10 to-design-light/5 group-hover:from-design-light/30 group-hover:via-design-light/20 group-hover:to-design-light/10 transition-all duration-300 micro-bounce shadow-sm group-hover:shadow-md">
                <Icon className={`h-4 w-4 ${stat.color} relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`} />
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 relative z-10">
              <div className="flex items-baseline justify-between mb-4">
                <div className="text-3xl md:text-4xl font-display font-bold text-design-dark dark:text-white tracking-tight bg-gradient-to-br from-design-dark to-design-dark/80 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
              </div>
              <p className="text-[10px] md:text-xs text-design-gray dark:text-gray-400 font-ui font-medium">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

