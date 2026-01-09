/**
 * AI Images Generate API (Admin)
 * Generate images from admin panel
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const generateSchema = z.object({
  type: z.enum(['listing', 'article', 'neighborhood', 'hero', 'custom']),
  prompt: z.string().optional(),
  context: z.object({
    title: z.string().optional(),
    propertyType: z.string().optional(),
    location: z.string().optional(),
    features: z.record(z.any()).optional(),
    status: z.enum(['satilik', 'kiralik']).optional(),
    category: z.string().optional(),
    name: z.string().optional(),
    district: z.string().optional(),
    description: z.string().optional(),
    theme: z.string().optional(),
  }).optional(),
  options: z.object({
    size: z.enum(['1024x1024', '1792x1024', '1024x1792']).optional(),
    quality: z.enum(['standard', 'hd']).optional(),
    style: z.enum(['vivid', 'natural']).optional(),
  }).optional(),
  upload: z.object({
    folder: z.string().optional(),
    entityType: z.enum(['listing', 'article', 'news', 'neighborhood', 'other']).optional(),
    entityId: z.string().optional(),
    alt: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  skipCache: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const body = await req.json();
    const validated = generateSchema.parse(body);

    // Forward to main API
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/ai/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validated),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('AI Image Generation API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
}

