/**
 * Cron Job: Update Pharmacy Data
 * Runs daily at 6 AM to refresh pharmacy data from free APIs
 * 
 * Vercel Cron Configuration:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-pharmacies",
 *     "schedule": "0 6 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOnDutyPharmacies } from '@/lib/services/pharmacy';
import { createServiceClient } from '@/lib/supabase/clients';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET || 'change-me-in-production';

    // In production, require cron secret
    if (
      process.env.NODE_ENV === 'production' &&
      authHeader !== `Bearer ${expectedSecret}` &&
      cronSecret !== expectedSecret
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Cities and districts to update
    const locations = [
      { city: 'Sakarya', district: 'Karasu' },
      { city: 'Sakarya', district: 'Kocaali' },
      // Add more locations as needed
    ];

    const results = [];
    const errors = [];

    for (const location of locations) {
      try {
        // Fetch fresh data from APIs (skip cache)
        const result = await getOnDutyPharmacies(
          location.city,
          location.district,
          false // Skip cache, force API fetch
        );

        if (result.success && result.data.length > 0) {
          // Update last_verified_at for all pharmacies in this location
          const today = new Date().toISOString().split('T')[0];
          
          const { error: updateError } = await supabase
            .from('pharmacies')
            .update({
              last_verified_at: new Date().toISOString(),
            })
            .eq('city', location.city)
            .eq('district', location.district)
            .is('deleted_at', null);

          if (updateError) {
            console.error(`Error updating verification time for ${location.city}/${location.district}:`, updateError);
          }

          results.push({
            city: location.city,
            district: location.district,
            count: result.data.length,
            source: result.source,
          });
        } else {
          results.push({
            city: location.city,
            district: location.district,
            count: 0,
            source: 'no_data',
          });
        }
      } catch (error: any) {
        errors.push({
          city: location.city,
          district: location.district,
          error: error.message || 'Unknown error',
        });
        console.error(`Error updating pharmacies for ${location.city}/${location.district}:`, error);
      }
    }

    // Clean up old cache entries (older than 7 days)
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { error: cleanupError } = await supabase
        .from('pharmacy_api_cache')
        .delete()
        .lt('expires_at', sevenDaysAgo.toISOString());

      if (cleanupError) {
        console.error('Error cleaning up old cache:', cleanupError);
      }
    } catch (error) {
      console.error('Error during cache cleanup:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Pharmacy update cron job completed',
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        totalLocations: locations.length,
        successful: results.filter((r) => r.count > 0).length,
        failed: errors.length,
      },
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        success: false,
      },
      { status: 500 }
    );
  }
}
