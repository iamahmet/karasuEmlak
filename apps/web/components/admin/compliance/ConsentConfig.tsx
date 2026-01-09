"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface ConsentConfigProps {
  policies: any[];
}

export function ConsentConfig({ policies: _policies }: ConsentConfigProps) {
  
  const [config, setConfig] = useState({
    bannerEnabled: true,
    bannerText: "We use cookies to enhance your browsing experience...",
    preferenceCenterEnabled: true,
    purposes: {
      necessary: { enabled: true, required: true },
      analytics: { enabled: true, required: false },
      marketing: { enabled: true, required: false },
      personalization: { enabled: true, required: false },
    },
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/compliance/config");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.config) {
          setConfig(data.config);
        }
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/compliance/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save configuration");
      }

      toast.success("Yapılandırma başarıyla kaydedildi!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save configuration");
      console.error("Failed to save config:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Consent Banner Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="bannerEnabled"
              checked={config.bannerEnabled}
              onChange={(e) => setConfig({ ...config, bannerEnabled: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="bannerEnabled">Enable consent banner</Label>
          </div>

          {config.bannerEnabled && (
            <div>
              <Label htmlFor="bannerText">Banner Text</Label>
              <Textarea
                id="bannerText"
                value={config.bannerText}
                onChange={(e) => setConfig({ ...config, bannerText: e.target.value })}
                rows={3}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="preferenceCenterEnabled"
              checked={config.preferenceCenterEnabled}
              onChange={(e) =>
                setConfig({ ...config, preferenceCenterEnabled: e.target.checked })
              }
              className="rounded"
            />
            <Label htmlFor="preferenceCenterEnabled">Enable preference center</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consent Purposes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(config.purposes).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium capitalize">{key}</p>
                <p className="text-sm text-muted-foreground">
                  {value.required ? "Required" : "Optional"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`${key}_enabled`} className="text-sm">
                    Enabled
                  </Label>
                  <input
                    type="checkbox"
                    id={`${key}_enabled`}
                    checked={value.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        purposes: {
                          ...config.purposes,
                          [key]: { ...value, enabled: e.target.checked },
                        },
                      })
                    }
                    disabled={value.required}
                    className="rounded"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}

