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
  const supabase = await createAnonServerClient();
  return getQAEntriesWithClient(supabase, category, region, limit);
}

/**
 * Get all Q&A entries (service client - admin)
 */
export async function getQAEntriesAdmin(
  category?: string,
  region?: string,
  limit = 100
): Promise<QAEntry[]> {
  const supabase = createServiceClient();
  return getQAEntriesWithClient(supabase, category, region, limit);
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
    // Don't throw - return empty array for graceful degradation
    return [];
  }

  // Safely process data - handle any JSON fields that might be strings
  const safeData = (data || []).map((entry: any) => {
    // If any field is a JSON string, parse it safely
    const safeEntry = { ...entry };
    
    // Check if answer might be a JSON string (unlikely but safe)
    if (typeof safeEntry.answer === 'string' && safeEntry.answer.trim().startsWith('{')) {
      try {
        // Only try to parse if it looks like JSON
        const parsed = JSON.parse(safeEntry.answer);
        // If parsed successfully and it's an object, keep original string
        // (answer should be text, not JSON)
        if (typeof parsed === 'object') {
          // Keep original - answer is probably just text that starts with {
          // Don't parse it
        }
      } catch {
        // Not JSON, keep as is
      }
    }
    
    return safeEntry as QAEntry;
  });

  return safeData;
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
