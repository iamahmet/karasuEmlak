import { createServiceClient } from '@karasu/lib/supabase/service';

export interface QAEntry {
  id: string;
  question: string;
  answer: string;
  category: 'bilgi' | 'karsilastirma' | 'karar_verme' | 'risk' | 'yatirim';
  priority: 'high' | 'medium' | 'low';
  region: 'karasu' | 'kocaali';
  created_at: string;
  updated_at: string;
}

/**
 * Get Q&A entries by region
 */
export async function getQAEntries(region: 'karasu' | 'kocaali', priority?: 'high' | 'medium' | 'low'): Promise<QAEntry[]> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for getQAEntries:', error.message);
    return [];
  }
  
  let query = supabase
    .from('qa_entries')
    .select('*')
    .eq('region', region)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  if (priority) {
    query = query.eq('priority', priority);
  }

  const { data, error } = await query;

  if (error) {
    // Handle PostgREST schema cache errors gracefully (table might not exist yet)
    if (error.code === 'PGRST205' || error.code === 'PGRST202' || error.message?.includes('schema cache')) {
      console.warn('QA entries table not found in schema cache, returning empty array');
      return [];
    }
    console.error('Error fetching Q&A entries:', error);
    return [];
  }

  return (data as QAEntry[]) || [];
}

/**
 * Get Q&A entries by category
 */
export async function getQAEntriesByCategory(
  region: 'karasu' | 'kocaali',
  category: 'bilgi' | 'karsilastirma' | 'karar_verme' | 'risk' | 'yatirim'
): Promise<QAEntry[]> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for getQAEntriesByCategory:', error.message);
    return [];
  }
  
  const { data, error } = await supabase
    .from('qa_entries')
    .select('*')
    .eq('region', region)
    .eq('category', category)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    // Handle PostgREST schema cache errors gracefully (table might not exist yet)
    if (error.code === 'PGRST205' || error.code === 'PGRST202' || error.message?.includes('schema cache')) {
      console.warn('QA entries table not found in schema cache, returning empty array');
      return [];
    }
    console.error('Error fetching Q&A entries by category:', error);
    return [];
  }

  return (data as QAEntry[]) || [];
}

/**
 * Get high-priority Q&A entries (for pillar pages)
 */
export async function getHighPriorityQAEntries(region: 'karasu' | 'kocaali'): Promise<QAEntry[]> {
  return getQAEntries(region, 'high');
}
