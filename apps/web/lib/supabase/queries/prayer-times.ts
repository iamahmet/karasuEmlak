import { createServiceClient } from '@karasu/lib/supabase/service';

export type PrayerTimesRow = {
  district_id: number;
  district_name: string | null;
  date: string; // YYYY-MM-DD
  imsak: string; // HH:MM:SS or HH:MM
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
  source: string;
  fetched_at: string;
  updated_at: string;
};

export async function getPrayerTimesByDate(params: {
  districtId: number;
  date: string; // YYYY-MM-DD
}): Promise<PrayerTimesRow | null> {
  const supabase = createServiceClient();
  const { districtId, date } = params;

  const { data, error } = await supabase
    .from('prayer_times')
    .select('district_id,district_name,date,imsak,gunes,ogle,ikindi,aksam,yatsi,source,fetched_at,updated_at')
    .eq('district_id', districtId)
    .eq('date', date)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('[prayer_times] getPrayerTimesByDate error:', error);
    }
    return null;
  }

  return data as PrayerTimesRow;
}

export async function getPrayerTimesRange(params: {
  districtId: number;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  limit?: number;
}): Promise<PrayerTimesRow[]> {
  const supabase = createServiceClient();
  const { districtId, from, to, limit = 400 } = params;

  const { data, error } = await supabase
    .from('prayer_times')
    .select('district_id,district_name,date,imsak,gunes,ogle,ikindi,aksam,yatsi,source,fetched_at,updated_at')
    .eq('district_id', districtId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('[prayer_times] getPrayerTimesRange error:', error);
    return [];
  }

  return (data as PrayerTimesRow[]) || [];
}

