"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  className?: string;
  showLabel?: boolean;
}

export function ImageUpload({ onUpload, currentImage, className, showLabel = true }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel dosyası seçin");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    setUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      // Upload to Supabase Storage
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        onUpload(data.url);
        toast.success("Görsel yüklendi");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Görsel yüklenemedi");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleRemove = () => {
    setPreview(null);
    onUpload("");
  };

  if (!showLabel) {
    return (
      <button
        type="button"
        {...getRootProps()}
        className={className}
        disabled={uploading}
      >
        <input {...getInputProps()} />
        <ImageIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {preview ? (
        <Card className="card-professional relative group">
          <CardContent className="p-0">
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleRemove}
                  className="h-10 w-10 rounded-full hover-scale micro-bounce"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover-lift",
            isDragActive
              ? "border-design-light bg-design-light/10"
              : "border-[#E7E7E7] dark:border-[#062F28] hover:border-design-light/50",
            uploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-design-light" />
              <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
                Yükleniyor...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-design-light/20 to-design-light/10">
                <Upload className="h-8 w-8 text-design-dark dark:text-design-light" />
              </div>
              <div>
                <p className="text-sm font-ui font-semibold text-design-dark dark:text-white mb-1">
                  {isDragActive ? "Bırakın" : "Görsel Yükleyin"}
                </p>
                <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                  Sürükleyip bırakın veya tıklayın
                </p>
                <p className="text-[10px] text-design-gray dark:text-gray-400 font-ui mt-1">
                  PNG, JPG, GIF, WEBP (Max 5MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

