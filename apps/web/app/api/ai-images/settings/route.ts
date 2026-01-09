/**
 * AI Image Settings API
 * Manages AI image generation settings (rate limits, defaults, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { withErrorHandling, createSuccessResponse, generateRequestId } from '@/lib/admin/api/error-handler';
import { z } from 'zod';

const settingsSchema = z.object({
  rate_limits: z.object({
    maxRequestsPerHour: z.number().min(1).max(1000),
    maxRequestsPerDay: z.number().min(1).max(10000),
    maxCostPerDay: z.number().min(0).max(1000),
  }).optional(),
  default_options: z.object({
    size: z.enum(['1024x1024', '1792x1024', '1024x1792']),
    quality: z.enum(['standard', 'hd']),
    style: z.enum(['vivid', 'natural']),
  }).optional(),
});

async function handleGet(_request: NextRequest) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('ai_image_settings')
    .select('*')
    .order('setting_key');

  if (error) {
    throw error;
  }

  // Transform to object format
  const settings: Record<string, unknown> = {};
  data?.forEach((setting) => {
    settings[setting.setting_key] = setting.setting_value;
  });

  const requestId = generateRequestId();
  return createSuccessResponse(requestId, { settings });
}

async function handlePost(request: NextRequest) {
  const body = await request.json();
  const validated = settingsSchema.parse(body);

  const supabase = createServiceClient();

  const updates: Array<{ setting_key: string; setting_value: unknown }> = [];

  if (validated.rate_limits) {
    updates.push({
      setting_key: 'rate_limits',
      setting_value: validated.rate_limits,
    });
  }

  if (validated.default_options) {
    updates.push({
      setting_key: 'default_options',
      setting_value: validated.default_options,
    });
  }

  // Upsert settings
  for (const update of updates) {
    const { error } = await supabase
      .from('ai_image_settings')
      .upsert(
        {
          setting_key: update.setting_key,
          setting_value: update.setting_value,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'setting_key',
        }
      );

    if (error) {
      throw error;
    }
  }

  const requestId = generateRequestId();
  return createSuccessResponse(requestId, { 
    message: 'Settings updated successfully',
    settings: validated,
  });
}

export const GET = withErrorHandling(handleGet);
export const POST = withErrorHandling(handlePost);
