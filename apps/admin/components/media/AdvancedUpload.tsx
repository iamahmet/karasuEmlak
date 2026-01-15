"use client";

import React, { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { DialogDescription } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  Upload,
  File,
  X,
  CheckCircle2,
  Loader2,
  ImagePlus,
  Cloud,
  Sparkles,
  Home,
  Zap,
} from "lucide-react";
import { cn } from "@karasu/lib";
import { toast } from "sonner";
import { GoogleDrivePicker } from "./GoogleDrivePicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@karasu/ui";
// import { useDropzone } from "react-dropzone";

interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  seoData?: {
    url: string;
    altText: string;
    filename: string;
    width?: number;
    height?: number;
  };
}

interface AdvancedUploadProps {
  onUploadComplete?: () => void;
  locale?: string;
}

export function AdvancedUpload({ onUploadComplete }: AdvancedUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [googleDriveOpen, setGoogleDriveOpen] = useState(false);
  const [createListingsDialogOpen, setCreateListingsDialogOpen] = useState(false);
  const [creatingListings, setCreatingListings] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  // File input ref for programmatic click
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Simple dropzone implementation without external dependency
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set inactive if we're leaving the dropzone area
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      // Filter only images
      const imageFiles = droppedFiles.filter(file => file.type.startsWith("image/"));
      if (imageFiles.length > 0) {
        onDrop(imageFiles);
      } else {
        toast.error("Lütfen sadece görsel dosyaları yükleyin");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      onDrop(selectedFiles);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const getRootProps = () => ({
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onClick: handleDropzoneClick,
  });

  const isDragActive = dragActive;

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error("Lütfen en az bir dosya seçin");
      return;
    }

    setUploading(true);

    for (const fileItem of files) {
      if (fileItem.status === "success") continue;

      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: "uploading", progress: 50 } : f
          )
        );

        // Use enhanced upload API with SEO optimization
        const formData = new FormData();
        formData.append("file", fileItem.file);
        formData.append("generateAltText", "true");

        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: Yükleme başarısız`;
          throw new Error(errorMessage);
        }

        const result = await response.json();

        if (!result.success) {
          const errorMessage = result.message || result.error || "Yükleme başarısız";
          throw new Error(errorMessage);
        }

        // Check if result has data property (from createSuccessResponse)
        const uploadData = result.data || result;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: "success",
                  progress: 100,
                  seoData: uploadData,
                }
              : f
          )
        );

        toast.success(`${fileItem.file.name} yüklendi ve SEO optimize edildi`);
      } catch (error: any) {
        // Upload failed, update file status
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: "error", error: error.message || "Yükleme başarısız" }
              : f
          )
        );
        toast.error(`${fileItem.file.name} yüklenemedi: ${error.message}`);
      }
    }

    setUploading(false);
    
    // Check success count from current state
    const currentFiles = files;
    const successCount = currentFiles.filter((f) => f.status === "success").length;
    const errorCount = currentFiles.filter((f) => f.status === "error").length;
    
    if (successCount > 0) {
      toast.success(`${successCount} dosya başarıyla yüklendi ve SEO optimize edildi`);
      // Only call onUploadComplete if all files succeeded
      if (errorCount === 0) {
        onUploadComplete?.();
      }
    } else if (errorCount > 0) {
      toast.error(`${errorCount} dosya yüklenemedi`);
    }
  };

  const handleCreateListings = async () => {
    setCreatingListings(true);
    try {
      const response = await fetch("/api/listings/create-from-images", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "İlanlar oluşturulamadı");
      }

      const data = result.data || result;
      toast.success(
        `${data.created} ilan başarıyla oluşturuldu! ${data.skipped > 0 ? `(${data.skipped} atlandı)` : ""}`
      );
      setCreateListingsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "İlanlar oluşturulamadı");
    } finally {
      setCreatingListings(false);
    }
  };

  const pendingFiles = files.filter((f) => f.status === "pending");
  const uploadingFiles = files.filter((f) => f.status === "uploading");
  const successFiles = files.filter((f) => f.status === "success");
  const errorFiles = files.filter((f) => f.status === "error");

  return (
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Gelişmiş Dosya Yükleme
            <Badge variant="outline" className="ml-auto text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              SEO Otomatik
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Drive Import Button */}
          <Button
            variant="outline"
            onClick={() => setGoogleDriveOpen(true)}
            className="w-full"
          >
            <Cloud className="h-4 w-4 mr-2" />
            Google Drive'dan İçe Aktar
          </Button>

          {/* Google Drive Picker Dialog */}
          <Dialog open={googleDriveOpen} onOpenChange={setGoogleDriveOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-foreground">Google Drive'dan İçe Aktar</DialogTitle>
                <DialogDescription>
                  Google Drive hesabınızdan görselleri seçin ve otomatik SEO optimizasyonu ile yükleyin
                </DialogDescription>
              </DialogHeader>
              <GoogleDrivePicker
                onSelect={(importedFiles) => {
                  toast.success(`${importedFiles.length} dosya başarıyla içe aktarıldı`);
                  setGoogleDriveOpen(false);
                  onUploadComplete?.();
                }}
                onClose={() => setGoogleDriveOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">veya</span>
            </div>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
              isDragActive
                ? "border-primary bg-primary/10 scale-[1.02]"
                : "border-border hover:border-primary/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Dosya seç"
              title="Dosya seç"
            />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ImagePlus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragActive ? "Dosyaları buraya bırakın" : "Dosyaları sürükleyin veya tıklayın"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, WEBP desteklenir • Otomatik SEO optimizasyonu
              </p>
            </div>
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Seçilen Dosyalar ({files.length})
                </p>
                <div className="flex gap-2 text-xs">
                  {pendingFiles.length > 0 && (
                    <Badge variant="secondary" className="h-5 text-[10px]">
                      Bekliyor: {pendingFiles.length}
                    </Badge>
                  )}
                  {uploadingFiles.length > 0 && (
                    <Badge variant="default" className="h-5 text-[10px] bg-primary">
                      Yükleniyor: {uploadingFiles.length}
                    </Badge>
                  )}
                  {successFiles.length > 0 && (
                    <Badge variant="default" className="h-5 text-[10px] bg-primary">
                      Başarılı: {successFiles.length}
                    </Badge>
                  )}
                  {errorFiles.length > 0 && (
                    <Badge variant="error" className="h-5 text-[10px]">
                      Hata: {errorFiles.length}
                    </Badge>
                  )}
                </div>
              </div>

            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-modern">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    fileItem.status === "success" && "bg-primary/10 border-primary/20",
                    fileItem.status === "error" && "bg-destructive/10 border-destructive/20",
                    fileItem.status === "uploading" && "bg-primary/5 border-primary/10",
                    fileItem.status === "pending" && "bg-card border-border"
                  )}
                >
                  {fileItem.preview ? (
                    <img
                      src={fileItem.preview}
                      alt={fileItem.file.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <File className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {fileItem.seoData?.filename || fileItem.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                      {fileItem.seoData?.width && fileItem.seoData?.height && (
                        <span className="ml-2">
                          • {fileItem.seoData.width} × {fileItem.seoData.height}px
                        </span>
                      )}
                    </p>
                    {fileItem.seoData?.altText && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Alt: {fileItem.seoData.altText}
                      </p>
                    )}
                    {fileItem.status === "uploading" && (
                      <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-primary transition-all duration-300 absolute top-0 left-0"
                          style={{ width: `${fileItem.progress}%` }}
                          role="progressbar"
                          aria-valuenow={fileItem.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${fileItem.file.name} yükleniyor: ${fileItem.progress}%`}
                          aria-valuetext={`${fileItem.progress}% tamamlandı`}
                        />
                      </div>
                    )}
                    {fileItem.status === "success" && fileItem.seoData && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] h-5">
                          <Sparkles className="h-3 w-3 mr-1" />
                          SEO Optimize
                        </Badge>
                      </div>
                    )}
                    {fileItem.error && (
                      <p className="text-xs text-red-600 mt-1 font-ui">{fileItem.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {fileItem.status === "success" && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                    {fileItem.status === "error" && (
                      <X className="h-5 w-5 text-destructive" />
                    )}
                    {fileItem.status === "uploading" && (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileItem.id)}
                      className="h-8 w-8 p-0"
                      disabled={fileItem.status === "uploading"}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {files.length > 0 && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setFiles([])}
              disabled={uploading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Temizle
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={uploading || pendingFiles.length === 0}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  SEO ile Yükle ({pendingFiles.length})
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Create Listings Dialog */}
      <Dialog open={createListingsDialogOpen} onOpenChange={setCreateListingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Otomatik İlan Oluştur
            </DialogTitle>
            <DialogDescription>
              Yüklenen görsellerden klasör yapısına göre otomatik olarak SEO uyumlu ilanlar oluşturmak ister misiniz?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Zap className="h-4 w-4 text-primary" />
                Otomatik İşlemler:
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Klasör yapısından bilgi çıkarılır (mahalle, fiyat, oda sayısı)</li>
                <li>AI ile SEO uyumlu başlık ve açıklamalar oluşturulur</li>
                <li>Görseller ilanlara otomatik bağlanır</li>
                <li>Tüm alanlar doldurulur (fiyat, özellikler, konum)</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCreateListingsDialogOpen(false)}
                disabled={creatingListings}
                className="flex-1"
              >
                Hayır
              </Button>
              <Button
                onClick={handleCreateListings}
                disabled={creatingListings}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {creatingListings ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Home className="h-4 w-4 mr-2" />
                    Evet, Oluştur
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

