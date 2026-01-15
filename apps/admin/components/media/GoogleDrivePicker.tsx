"use client";

import { useState } from "react";
import { Button } from "@karasu/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@karasu/ui";
import { Cloud, Loader2, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

interface GoogleDrivePickerProps {
  onSelect: (files: Array<{ id: string; name: string; url: string }>) => void;
  onClose?: () => void;
}

export function GoogleDrivePicker({ onSelect, onClose }: GoogleDrivePickerProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Array<{ id: string; name: string }>>([]);

  const handleGoogleDriveAuth = async () => {
    setLoading(true);
    try {
      // Check if Google API is loaded
      if (typeof window === "undefined" || !(window as any).gapi) {
        // Load Google API
        await loadGoogleAPI();
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        toast.error("Google Drive entegrasyonu yapılandırılmamış");
        return;
      }

      // Initialize Google API
      await (window as any).gapi.load("client:auth2", async () => {
        await (window as any).gapi.client.init({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          clientId: clientId,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
          scope: "https://www.googleapis.com/auth/drive.readonly",
        });

        const authInstance = (window as any).gapi.auth2.getAuthInstance();
        const isSignedIn = authInstance.isSignedIn.get();

        if (!isSignedIn) {
          await authInstance.signIn();
        }

        // Open Google Drive Picker
        const picker = new (window as any).google.picker.PickerBuilder()
          .enableFeature((window as any).google.picker.Feature.MULTISELECT_ENABLED)
          .setOAuthToken(authInstance.currentUser.get().getAuthResponse().access_token)
          .addView((window as any).google.picker.ViewId.IMAGES)
          .setCallback((data: any) => {
            if (data.action === (window as any).google.picker.Action.PICKED) {
              const files = data.docs.map((doc: any) => ({
                id: doc.id,
                name: doc.name,
              }));
              setSelectedFiles(files);
            }
          })
          .build();

        picker.setVisible(true);
      });
    } catch (error: any) {
      console.error("Google Drive auth error:", error);
      toast.error("Google Drive bağlantısı başarısız: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Lütfen en az bir dosya seçin");
      return;
    }

    setLoading(true);
    try {
      const authInstance = (window as any).gapi.auth2.getAuthInstance();
      const accessToken = authInstance.currentUser.get().getAuthResponse().access_token;

      const importedFiles = [];

      for (const file of selectedFiles) {
        try {
          const response = await fetch("/api/media/google-drive", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileId: file.id,
              accessToken,
              generateAltText: true,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to import ${file.name}`);
          }

          const result = await response.json();
          if (result.success) {
            importedFiles.push({
              id: file.id,
              name: file.name,
              url: result.data.url,
            });
          }
        } catch (error: any) {
          console.error(`Failed to import ${file.name}:`, error);
          toast.error(`${file.name} içe aktarılamadı`);
        }
      }

      if (importedFiles.length > 0) {
        toast.success(`${importedFiles.length} dosya başarıyla içe aktarıldı`);
        onSelect(importedFiles);
        onClose?.();
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error("İçe aktarma başarısız: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Cloud className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Google Drive'dan İçe Aktar
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Google Drive hesabınızdan görselleri seçin ve otomatik SEO optimizasyonu ile yükleyin
        </p>
        <Button
          onClick={handleGoogleDriveAuth}
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Bağlanıyor...
            </>
          ) : (
            <>
              <Cloud className="h-4 w-4 mr-2" />
              Google Drive'a Bağlan
            </>
          )}
        </Button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Seçilen Dosyalar ({selectedFiles.length})
          </p>
          <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-lg p-3">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded"
              >
                <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedFiles((prev) => prev.filter((f) => f.id !== file.id))
                  }
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={handleImport}
            disabled={loading}
            className="w-full bg-primary"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                İçe Aktarılıyor...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                İçe Aktar ({selectedFiles.length})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Load Google API scripts
 */
function loadGoogleAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).gapi) {
      resolve();
      return;
    }

    // Load gapi script
    const gapiScript = document.createElement("script");
    gapiScript.src = "https://apis.google.com/js/api.js";
    gapiScript.onload = () => {
      // Load picker script
      const pickerScript = document.createElement("script");
      pickerScript.src = "https://apis.google.com/js/picker.js";
      pickerScript.onload = () => resolve();
      pickerScript.onerror = reject;
      document.head.appendChild(pickerScript);
    };
    gapiScript.onerror = reject;
    document.head.appendChild(gapiScript);
  });
}
