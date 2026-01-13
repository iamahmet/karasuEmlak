/**
 * Q&A Repository
 * 
 * Single source of truth for all Q&A database operations.
 * 
 * Client Type Declaration:
 * - anon: Public reads (all entries visible)
 * - service: Admin operations (all data)
 */

import { createAnonServerClient, createServiceClient } from '@/lib/supabase/clients';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface QAEntry {
  id: string;
  question: string;
  answer: string;
  category: 'genel' | 'satilik' | 'kiralik' | 'hukuki' | 'finansman' | 'kiralama';
  priority: number; // 0 = low, 1 = medium, 2 = high
  region?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all Q&A entries (anon client - public read)
 * 
 * Note: This function is used in server components, so it uses createAnonServerClient()
 * which properly handles cookies and server-side rendering.
 */
export async function getQAEntries(
  category?: string,
  region?: string,
  limit = 100
): Promise<QAEntry[]> {
  try {
    const supabase = await createAnonServerClient();
    return await getQAEntriesWithClient(supabase, category, region, limit);
  } catch (error) {
    console.error('[qa.ts] Error in getQAEntries:', error);
    // Return empty array on any error to prevent page crashes
    return [];
  }
}

/**
 * Get all Q&A entries (service client - admin)
 */
export async function getQAEntriesAdmin(
  category?: string,
  region?: string,
  limit = 100
): Promise<QAEntry[]> {
  try {
    const supabase = createServiceClient();
    return await getQAEntriesWithClient(supabase, category, region, limit);
  } catch (error) {
    console.error('[qa.ts] Error in getQAEntriesAdmin:', error);
    // Return empty array on any error to prevent page crashes
    return [];
  }
}

/**
 * Internal: Get Q&A entries with specified client
 */
async function getQAEntriesWithClient(
  supabase: SupabaseClient,
  category?: string,
  region?: string,
  limit = 100
): Promise<QAEntry[]> {
  try {
    let query = supabase
      .from('qa_entries')
      .select('*')
      .order('priority', { ascending: false, nullsFirst: false })
      .order('category', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    if (region) {
      query = query.eq('region', region);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[qa.ts] Error fetching Q&A entries:', error);
      console.error('[qa.ts] Error code:', error.code);
      console.error('[qa.ts] Error message:', error.message);
      console.error('[qa.ts] Error details:', error.details);
      // Don't throw - return empty array for graceful degradation
      return [];
    }

    if (!data) {
      console.warn('[qa.ts] No data returned from query (null/undefined)');
      return [];
    }

    // Safely process data - handle any JSON fields that might be strings
    const safeData = (data || [])
      .filter((entry: any) => {
        // Filter out invalid entries
        return entry && 
               entry.id && 
               entry.question && 
               entry.answer && 
               entry.category;
      })
      .map((entry: any) => {
        // Normalize priority to number if it's a string
        let priority = 0;
        if (typeof entry.priority === 'number') {
          priority = entry.priority;
        } else if (typeof entry.priority === 'string') {
          // Handle string priorities: 'high' = 2, 'medium' = 1, 'low' = 0
          if (entry.priority === 'high') priority = 2;
          else if (entry.priority === 'medium') priority = 1;
          else if (entry.priority === 'low') priority = 0;
        }

        const safeEntry: QAEntry = {
          id: String(entry.id),
          question: String(entry.question || ''),
          answer: String(entry.answer || ''),
          category: entry.category as QAEntry['category'],
          priority: priority,
          region: entry.region ? String(entry.region) : undefined,
          created_at: entry.created_at ? String(entry.created_at) : new Date().toISOString(),
          updated_at: entry.updated_at ? String(entry.updated_at) : new Date().toISOString(),
        };
        
        return safeEntry;
      });

    return safeData;
  } catch (err) {
    console.error('[qa.ts] Unexpected error in getQAEntriesWithClient:', err);
    return [];
  }
}

/**
 * Create Q&A entry (service client only)
 */
export async function createQAEntry(entry: Omit<QAEntry, 'id' | 'created_at' | 'updated_at'>): Promise<QAEntry> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('qa_entries')
    .insert(entry)
    .select()
    .single();

  if (error) {
    console.error('[qa.ts] Error creating Q&A entry:', error);
    throw new Error(`Failed to create Q&A entry: ${error.message}`);
  }

  return data as QAEntry;
}

/**
 * Update Q&A entry (service client only)
 */
export async function updateQAEntry(id: string, updates: Partial<QAEntry>): Promise<QAEntry> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('qa_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[qa.ts] Error updating Q&A entry:', error);
    throw new Error(`Failed to update Q&A entry: ${error.message}`);
  }

  return data as QAEntry;
}

/**
 * Delete Q&A entry (service client only)
 */
export async function deleteQAEntry(id: string): Promise<void> {
  const supabase = createServiceClient();
  
  const { error } = await supabase
    .from('qa_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[qa.ts] Error deleting Q&A entry:', error);
    throw new Error(`Failed to delete Q&A entry: ${error.message}`);
  }
}
