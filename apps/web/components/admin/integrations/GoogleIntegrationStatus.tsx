"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { toast } from "sonner";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";

interface GoogleIntegrationStatusProps {
  accounts: any[];
}

export function GoogleIntegrationStatus({ accounts }: GoogleIntegrationStatusProps) {
  
  const gscAccount = accounts.find((a) => a.service_type === "gsc");
  const ga4Account = accounts.find((a) => a.service_type === "ga4");

  const handleSync = async (serviceType: string) => {
    try {
      toast.loading(`${serviceType.toUpperCase()} senkronizasyonu başlatılıyor...`);
      
      const response = await fetch(`/api/integrations/google/sync/${serviceType}`, {
        method: "POST",
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`${serviceType.toUpperCase()} senkronizasyonu başlatıldı!`);
      } else {
        toast.error(data.error || "Senkronizasyon başlatılamadı");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Senkronizasyon başarısız";
      toast.error(errorMessage);
      console.error("Failed to sync:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* GSC Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Google Search Console</span>
            {gscAccount ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gscAccount ? (
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-muted-foreground">Status: Connected</p>
                <p className="text-muted-foreground">
                  Last sync: {gscAccount.last_sync_at ? new Date(gscAccount.last_sync_at).toLocaleString() : "Never"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync("gsc")}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not connected</p>
          )}
        </CardContent>
      </Card>

      {/* GA4 Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Google Analytics 4</span>
            {ga4Account ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ga4Account ? (
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-muted-foreground">Status: Connected</p>
                <p className="text-muted-foreground">
                  Last sync: {ga4Account.last_sync_at ? new Date(ga4Account.last_sync_at).toLocaleString() : "Never"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync("ga4")}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not connected</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

