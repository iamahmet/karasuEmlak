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
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Admin",
      value: adminUsers,
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Staff",
      value: staffUsers,
      icon: UserCheck,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Aktif",
      value: activeUsers,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Pasif",
      value: inactiveUsers,
      icon: UserX,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
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
                  <p className="text-xs text-muted-foreground font-ui mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
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

