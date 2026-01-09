"use client";

import { Card, CardContent } from "@karasu/ui";
import { Users, Shield, UserCheck, UserX, TrendingUp } from "lucide-react";
import { cn } from "@karasu/lib";

interface UserStatsProps {
  totalUsers: number;
  adminUsers: number;
  staffUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export function UserStats({
  totalUsers,
  adminUsers,
  staffUsers,
  activeUsers,
  inactiveUsers,
}: UserStatsProps) {
  const stats = [
    {
      label: "Toplam Kullanıcı",
      value: totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      label: "Admin",
      value: adminUsers,
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      label: "Staff",
      value: staffUsers,
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      label: "Aktif",
      value: activeUsers,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      label: "Pasif",
      value: inactiveUsers,
      icon: UserX,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="card-professional hover-lift transition-all duration-200"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-design-dark dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    stat.bgColor
                  )}
                >
                  <Icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

