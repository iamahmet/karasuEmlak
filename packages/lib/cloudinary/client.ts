import { v2 as cloudinary } from 'cloudinary';
import { getEnv } from '@karasu-emlak/config';

/**
 * Cloudinary client configuration
 * Server-side only
 */
export function getCloudinaryClient() {
  const env = getEnv();

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });

  return cloudinary;
}

/**
 * Get Cloudinary cloud name (for client-side URL generation)
 */
export function getCloudinaryCloudName(): string {
  const env = getEnv();
  return env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
}

