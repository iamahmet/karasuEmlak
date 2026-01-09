/**
 * QR Code API Route
 * GET /api/services/qr-code?data=https://example.com&size=200
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateQRCodeURL, generateListingQRCode } from '@/lib/services/qr-code';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const data = searchParams.get('data');
    const listingSlug = searchParams.get('listingSlug');
    const size = searchParams.get('size');
    const format = searchParams.get('format') || 'png';
    const color = searchParams.get('color') || '000000';
    const bgcolor = searchParams.get('bgcolor') || 'FFFFFF';

    if (listingSlug) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.karasuemlak.net';
      const qrUrl = generateListingQRCode(listingSlug, baseUrl, {
        size: size ? parseInt(size) : 300,
        format: format as 'png' | 'svg' | 'pdf',
        color,
        backgroundColor: bgcolor,
      });
      
      return NextResponse.json({
        success: true,
        data: {
          qrCodeUrl: qrUrl,
          listingSlug,
        },
      });
    }

    if (data) {
      const qrUrl = generateQRCodeURL(data, {
        size: size ? parseInt(size) : 200,
        format: format as 'png' | 'svg' | 'pdf',
        color,
        backgroundColor: bgcolor,
      });
      
      return NextResponse.json({
        success: true,
        data: {
          qrCodeUrl: qrUrl,
          data,
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Missing required parameter (data or listingSlug)',
    }, { status: 400 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('QR Code API route error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to generate QR code',
    }, { status: 500 });
  }
}
