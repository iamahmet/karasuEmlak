"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File } from "lucide-react";
import { Button } from "@karasu/ui";
import { Card, CardContent } from "@karasu/ui";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
}

export function FileUpload({
  onUpload,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  },
  maxFiles = 5,
  maxSize = 10,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      setFiles(newFiles);
    },
    [files, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSize * 1024 * 1024,
    maxFiles,
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ errors }) => {
        errors.forEach((error) => {
          if (error.code === "file-too-large") {
            toast.error(`Dosya boyutu ${maxSize}MB'dan küçük olmalı`);
          } else if (error.code === "too-many-files") {
            toast.error(`Maksimum ${maxFiles} dosya yüklenebilir`);
          }
        });
      });
    },
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      await onUpload(files);
      toast.success(`${files.length} file(s) uploaded successfully`);
      setFiles([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-design-light bg-design-light/10 dark:bg-design-light/5"
            : "border-[#E7E7E7] dark:border-[#062F28] hover:border-design-light/50",
          "hover-scale"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-design-gray dark:text-gray-400" />
        <p className="text-sm font-medium text-design-dark dark:text-white mb-1 font-ui">
          {isDragActive ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
          or click to select files
        </p>
        <p className="text-xs text-design-gray dark:text-gray-400 mt-2 font-ui">
          Max {maxFiles} files, {maxSize}MB each
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const preview = isImage ? URL.createObjectURL(file) : null;

            return (
              <Card key={index} className="card-modern">
                <CardContent className="flex items-center gap-3 p-3">
                  {preview ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#E7E7E7] dark:bg-[#062F28] flex-shrink-0">
                      <img
                        src={preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#E7E7E7] dark:bg-[#062F28] flex items-center justify-center flex-shrink-0">
                      <File className="h-6 w-6 text-design-gray dark:text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-design-dark dark:text-white truncate font-ui">
                      {file.name}
                    </p>
                    <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover-scale"
                  >
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full h-9 bg-design-dark hover:bg-design-dark/90 text-white rounded-lg font-ui hover-scale micro-bounce"
          >
            {uploading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} file(s)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

