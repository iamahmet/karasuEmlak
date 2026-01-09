"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Label } from "@karasu/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karasu/ui";
import { CheckCircle2, Loader2 } from "lucide-react";

export function GoogleIntegrationWizard() {
  const [step, _setStep] = useState<"select" | "oauth" | "complete">("select");
  const [service, setService] = useState<"gsc" | "ga4" | "both">("both");
  const [loading, setLoading] = useState(false);

  const handleStartOAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations/google/oauth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service }),
      });

      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("Failed to start OAuth:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Google Services</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "select" && (
          <>
            <div>
              <Label htmlFor="service">Select Service</Label>
              <Select value={service} onValueChange={(value: any) => setService(value)}>
                <SelectTrigger id="service">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gsc">Google Search Console</SelectItem>
                  <SelectItem value="ga4">Google Analytics 4</SelectItem>
                  <SelectItem value="both">Both (GSC + GA4)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted rounded">
              <p className="text-sm">
                <strong>What you'll need:</strong>
              </p>
              <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                <li>Google account with access to GSC/GA4</li>
                <li>OAuth consent screen configured</li>
                <li>Client ID and Client Secret</li>
              </ul>
            </div>

            <Button onClick={handleStartOAuth} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Start OAuth Flow"
              )}
            </Button>
          </>
        )}

        {step === "complete" && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Integration Complete!</p>
            <p className="text-sm text-muted-foreground">
              Your Google services are now connected. Daily sync will start automatically.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

