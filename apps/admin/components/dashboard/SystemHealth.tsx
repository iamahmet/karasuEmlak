"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  Database,
  Server,
  Shield,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@karasu/lib";

interface HealthCheck {
  name: string;
  status: "healthy" | "warning" | "error";
  message: string;
  icon: React.ComponentType<{ className?: string }>;
  lastChecked?: string;
}

export function SystemHealth() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const supabase = createClient();
      
      const checks: HealthCheck[] = [];

      // Database connection check
      try {
        const { error } = await supabase.from("articles").select("id").limit(1);
        checks.push({
          name: "Veritabanı Bağlantısı",
          status: error ? "error" : "healthy",
          message: error ? "Bağlantı hatası" : "Bağlantı başarılı",
          icon: Database,
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      } catch (error) {
        checks.push({
          name: "Veritabanı Bağlantısı",
          status: "error",
          message: "Bağlantı hatası",
          icon: Database,
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      }

      // API availability check
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        checks.push({
          name: "API Durumu",
          status: data.status === "healthy" ? "healthy" : data.status === "degraded" ? "warning" : "error",
          message: data.status === "healthy" ? "API çalışıyor" : data.status === "degraded" ? "API kısmen çalışıyor" : "API yanıt vermiyor",
          icon: Server,
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      } catch (error) {
        checks.push({
          name: "API Durumu",
          status: "error",
          message: "API kontrol edilemedi",
          icon: Server,
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      }

      // Authentication check
      try {
        const { data: { user: _user } } = await supabase.auth.getUser();
        checks.push({
          name: "Kimlik Doğrulama",
          status: "healthy",
          message: "Auth servisi çalışıyor",
          icon: Shield,
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      } catch (error) {
        checks.push({
          name: "Kimlik Doğrulama",
          status: "warning",
          message: "Auth servisi kontrol edilemedi",
          icon: Shield,
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      }

      setHealthChecks(checks);
    } catch (error) {
      // Health check failed, continue with empty state
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  if (loading) {
    return (
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 skeleton-professional rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallStatus =
    healthChecks.every((c) => c.status === "healthy")
      ? "healthy"
      : healthChecks.some((c) => c.status === "error")
      ? "error"
      : "warning";

  return (
    <Card className="card-professional hover-lift">
      <CardHeader className="pb-4 px-5 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Sistem Sağlığı
          </CardTitle>
          {healthChecks.length > 0 && (
            <Badge
              className={cn(
                "text-[10px] px-2 py-0.5 font-ui flex items-center gap-1",
                overallStatus === "healthy"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : overallStatus === "warning"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              )}
            >
              {overallStatus === "healthy" ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Tüm Sistemler Çalışıyor
                </>
              ) : overallStatus === "warning" ? (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Kısmi Sorunlar
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Kritik Sorunlar
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {healthChecks.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-ui">
              Sistem durumu kontrol edilemedi
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {healthChecks.map((check, index) => {
              const Icon = check.icon;
              const StatusIcon = getStatusIcon(check.status);
              const statusColors = {
                healthy: "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800",
                warning: "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800",
                error: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
              };
              const iconBgColors = {
                healthy: "bg-green-100 dark:bg-green-900/20",
                warning: "bg-yellow-100 dark:bg-yellow-900/20",
                error: "bg-red-100 dark:bg-red-900/20",
              };
              
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all hover-lift",
                    statusColors[check.status]
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("p-2 rounded-lg", iconBgColors[check.status])}>
                      <Icon className={cn("h-5 w-5", check.status === "healthy" ? "text-green-600 dark:text-green-400" : check.status === "warning" ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-ui font-semibold text-foreground mb-1">
                        {check.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-ui truncate">
                        {check.message}
                      </p>
                      {check.lastChecked && (
                        <p className="text-[10px] text-muted-foreground font-ui mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Son kontrol: {check.lastChecked}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {StatusIcon}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

