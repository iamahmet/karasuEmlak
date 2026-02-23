/**
 * Refresh prayer times from imsakiyem.com API
 * Used by programmatic page refresh and cron jobs
 */

import { createServiceClient } from "./supabase/service";

type ApiResponse = {
  success: boolean;
  data: Array<{
    district_id: {
      _id: string;
      name: string;
      state_id?: { _id: string; name: string; country_id?: string };
      country_id?: { _id: string; name: string };
    };
    date: string;
    times: {
      imsak: string;
      gunes: string;
      ogle: string;
      ikindi: string;
      aksam: string;
      yatsi: string;
    };
    updated_at?: string;
  }>;
};

export async function refreshPrayerTimes(params?: {
  year?: number;
  districtId?: number;
}): Promise<{ success: boolean; rowsUpserted?: number; error?: string }> {
  const year = params?.year ?? new Date().getFullYear();
  const districtId = params?.districtId ?? 9803; // Karasu

  const url = `https://ezanvakti.imsakiyem.com/api/prayer-times/${districtId}/yearly?year=${year}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "KarasuEmlak/1.0" },
    });
    if (!res.ok) {
      return {
        success: false,
        error: `API hatası: ${res.status} ${res.statusText}`,
      };
    }

    const json = (await res.json()) as ApiResponse;
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      return { success: false, error: "Beklenmeyen API yanıtı" };
    }

    const rows = json.data.map((d) => {
      const date = new Date(d.date).toISOString().slice(0, 10);
      const state = d.district_id?.state_id;
      const country = d.district_id?.country_id;

      return {
        district_id: Number(d.district_id?._id || districtId),
        district_name: d.district_id?.name || null,
        state_id: state?._id ? Number(state._id) : null,
        state_name: state?.name || null,
        country_id: country?._id ? Number(country._id) : null,
        country_name: country?.name || null,
        date,
        imsak: d.times.imsak,
        gunes: d.times.gunes,
        ogle: d.times.ogle,
        ikindi: d.times.ikindi,
        aksam: d.times.aksam,
        yatsi: d.times.yatsi,
        source: "imsakiyem_diyanet",
        fetched_at: new Date().toISOString(),
        updated_at: d.updated_at || new Date().toISOString(),
      };
    });

    const supabase = createServiceClient();
    const chunkSize = 250;
    let upserted = 0;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase
        .from("prayer_times")
        .upsert(chunk, { onConflict: "district_id,date" });

      if (error) {
        return {
          success: false,
          error: `Upsert hatası: ${error.message}`,
        };
      }
      upserted += chunk.length;
    }

    return { success: true, rowsUpserted: upserted };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Bilinmeyen hata",
    };
  }
}
