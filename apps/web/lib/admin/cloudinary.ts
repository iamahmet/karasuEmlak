/**
 * Cloudinary admin utilities
 * Handles image upload and management for admin panel
 */

import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: Record<string, unknown>;
  tags?: string[];
}

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
}

/**
 * Initialize Cloudinary with environment variables
 */
export function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload image to Cloudinary
 */
export async function uploadImage(
  file: Buffer | string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  initCloudinary();

  const uploadOptions: Record<string, unknown> = {
    folder: options.folder || 'karasu-emlak',
    resource_type: 'image',
  };

  if (options.publicId) {
    uploadOptions.public_id = options.publicId;
  }

  if (options.transformation) {
    uploadOptions.transformation = options.transformation;
  }

  if (options.tags) {
    uploadOptions.tags = options.tags;
  }

  const result = await cloudinary.uploader.upload(
    typeof file === 'string' ? file : `data:image/png;base64,${file.toString('base64')}`,
    uploadOptions
  );

  return {
    publicId: result.public_id,
    url: result.url,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    resourceType: result.resource_type,
  };
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  initCloudinary();

  const result = await cloudinary.uploader.destroy(publicId);
  return result.result === 'ok';
}

/**
 * Generate optimized image URL
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): string {
  initCloudinary();

  const transformation: Record<string, unknown> = {
    fetch_format: options.format || 'auto',
    quality: options.quality || 'auto',
  };

  if (options.width) {
    transformation.width = options.width;
    transformation.crop = 'fill';
  }

  if (options.height) {
    transformation.height = options.height;
    transformation.crop = 'fill';
  }

  return cloudinary.url(publicId, { transformation });
}
