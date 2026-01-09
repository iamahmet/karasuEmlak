/**
 * QR Code Generator API Service
 * Uses QR Server API (free, no API key required)
 * Alternative: QRCode API (free tier: 1000 requests/month)
 */

import { fetchWithRetry } from '@/lib/utils/api-client';

export interface QRCodeOptions {
  size?: number; // 100-1000, default 200
  format?: 'png' | 'svg' | 'pdf';
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'; // Low, Medium, Quartile, High
  margin?: number;
  color?: string; // Hex color
  backgroundColor?: string; // Hex color
}

/**
 * Generate QR code URL
 */
export function generateQRCodeURL(
  data: string,
  options: QRCodeOptions = {}
): string {
  const {
    size = 200,
    format = 'png',
    errorCorrection = 'M',
    margin = 1,
    color = '000000',
    backgroundColor = 'FFFFFF',
  } = options;

  // Use QR Server API (free, no API key)
  const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data,
    format,
    ecc: errorCorrection,
    margin: margin.toString(),
    color,
    bgcolor: backgroundColor,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate QR code for listing share
 */
export function generateListingQRCode(
  listingSlug: string,
  baseUrl: string = 'https://www.karasuemlak.net',
  options: QRCodeOptions = {}
): string {
  const listingUrl = `${baseUrl}/ilan/${listingSlug}`;
  return generateQRCodeURL(listingUrl, {
    size: 300,
    format: 'png',
    errorCorrection: 'H', // High error correction for print
    ...options,
  });
}

/**
 * Generate QR code for contact info
 */
export function generateContactQRCode(
  phone: string,
  options: QRCodeOptions = {}
): string {
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;
  return generateQRCodeURL(whatsappUrl, {
    size: 200,
    format: 'png',
    ...options,
  });
}
