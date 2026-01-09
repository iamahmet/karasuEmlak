"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  Upload,
  File,
  X,
  CheckCircle2,
  Loader2,
  ImagePlus,
} from "lucide-react";
import { cn } from "@karasu/lib";
import { toast } from "sonner";
// import { useDropzone } from "react-dropzone";

interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface AdvancedUploadProps {
  onUploadComplete?: () => void;
  locale?: string;
}

export function AdvancedUpload({ onUploadComplete }: AdvancedUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  // Simple dropzone implementation without external dependency
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    onDrop(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    onDrop(selectedFiles);
  };

  const getRootProps = () => ({
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  });

  const getInputProps = () => ({
    type: "file",
    multiple: true,
    accept: "image/*,application/pdf,video/*",
    onChange: handleFileSelect,
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
    const supabase = createClient();

    for (const fileItem of files) {
      if (fileItem.status === "success") continue;

      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: "uploading", progress: 0 } : f
          )
        );

        // Generate unique filename
        const fileExt = fileItem.file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `media/${fileName}`;

        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from("media")
          .upload(filePath, fileItem.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);

        // Save to media table
        const { error: dbError } = await supabase.from("media").insert({
          name: fileItem.file.name,
          url: urlData.publicUrl,
          type: fileItem.file.type,
          size: fileItem.file.size,
          mime_type: fileItem.file.type,
        });

        if (dbError) {
          throw dbError;
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: "success", progress: 100 } : f
          )
        );
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
    const successCount = files.filter((f) => f.status === "success").length;
    if (successCount > 0) {
      toast.success(`${successCount} dosya başarıyla yüklendi`);
      onUploadComplete?.();
    }
  };

  const pendingFiles = files.filter((f) => f.status === "pending");
  const uploadingFiles = files.filter((f) => f.status === "uploading");
  const successFiles = files.filter((f) => f.status === "success");
  const errorFiles = files.filter((f) => f.status === "error");

  return (
    <Card className="card-professional">
      <CardHeader className="pb-4 px-5 pt-5">
        <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
          <Upload className="h-5 w-5 text-design-light" />
          Gelişmiş Dosya Yükleme
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
            isDragActive
              ? "border-design-light bg-design-light/10"
              : "border-[#E7E7E7] dark:border-[#062F28] hover:border-design-light/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-design-light/20 to-design-light/10 flex items-center justify-center">
              <ImagePlus className="h-8 w-8 text-design-light" />
            </div>
            <div>
              <p className="text-sm font-semibold text-design-dark dark:text-white font-ui mb-1">
                {isDragActive ? "Dosyaları buraya bırakın" : "Dosyaları sürükleyin veya tıklayın"}
              </p>
              <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                PNG, JPG, GIF, WEBP, PDF, MP4 desteklenir
              </p>
            </div>
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-design-gray dark:text-gray-400 font-ui">
                Seçilen Dosyalar ({files.length})
              </p>
              <div className="flex gap-2 text-xs">
                {pendingFiles.length > 0 && (
                  <span className="text-blue-600">Bekliyor: {pendingFiles.length}</span>
                )}
                {uploadingFiles.length > 0 && (
                  <span className="text-orange-600">Yükleniyor: {uploadingFiles.length}</span>
                )}
                {successFiles.length > 0 && (
                  <span className="text-green-600">Başarılı: {successFiles.length}</span>
                )}
                {errorFiles.length > 0 && (
                  <span className="text-red-600">Hata: {errorFiles.length}</span>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-modern">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                    fileItem.status === "success" && "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/20",
                    fileItem.status === "error" && "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20",
                    fileItem.status === "uploading" && "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/20",
                    fileItem.status === "pending" && "bg-white dark:bg-[#0a3d35] border-[#E7E7E7] dark:border-[#062F28]"
                  )}
                >
                  {fileItem.preview ? (
                    <img
                      src={fileItem.preview}
                      alt={fileItem.file.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#E7E7E7] dark:bg-[#062F28] flex items-center justify-center">
                      <File className="h-6 w-6 text-design-gray dark:text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-design-dark dark:text-white truncate font-ui">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                      {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {fileItem.status === "uploading" && (
                      <div className="mt-2 h-1 w-full bg-[#E7E7E7] dark:bg-[#062F28] rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-300 absolute top-0 left-0"
                          style={{ width: `${fileItem.progress}%` }}
                          role="progressbar"
                          aria-valuenow={fileItem.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${fileItem.file.name} yükleniyor: ${fileItem.progress}%`}
                        />
                      </div>
                    )}
                    {fileItem.error && (
                      <p className="text-xs text-red-600 mt-1 font-ui">{fileItem.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {fileItem.status === "success" && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {fileItem.status === "error" && (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                    {fileItem.status === "uploading" && (
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
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
          <div className="flex gap-2 pt-2 border-t border-[#E7E7E7] dark:border-[#062F28]">
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
              className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Yükle ({pendingFiles.length})
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

