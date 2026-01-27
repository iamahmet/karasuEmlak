"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { LucideIcon } from "lucide-react";

interface ChartCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, icon: Icon, children, className }: ChartCardProps) {
  return (
    <Card className={`card-modern ${className || ""}`}>
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">{children}</CardContent>
    </Card>
  );
}

