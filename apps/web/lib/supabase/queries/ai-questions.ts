import { createServiceClient } from '@karasu/lib/supabase/service';

export interface AIQuestion {
  id: string;
  question: string;
  answer: string;
  location_scope: 'karasu' | 'kocaali' | 'global';
  page_type: 'pillar' | 'cornerstone' | 'blog' | 'neighborhood' | 'comparison';
  related_entity?: string;
  status: 'draft' | 'approved' | 'published';
  generated_by_ai: boolean;
  reviewed_by?: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

/**
 * Get published AI questions by location and page type
 */
export async function getAIQuestions(
  locationScope: 'karasu' | 'kocaali' | 'global',
  pageType?: 'pillar' | 'cornerstone' | 'blog' | 'neighborhood' | 'comparison',
  relatedEntity?: string,
  limit = 10
): Promise<AIQuestion[]> {
  const supabase = createServiceClient();
  
  let query = supabase
    .from('ai_questions')
    .select('*')
    .eq('status', 'published')
    .eq('location_scope', locationScope)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (pageType) {
    query = query.eq('page_type', pageType);
  }

  if (relatedEntity) {
    query = query.eq('related_entity', relatedEntity);
  }

  const { data, error } = await query;

  if (error) {
    // Handle PostgREST schema cache errors gracefully (table might not exist yet)
    if (error.code === 'PGRST205' || error.code === 'PGRST202' || error.message?.includes('schema cache')) {
      console.warn('AI questions table not found in schema cache, returning empty array');
      return [];
    }
    console.error('Error fetching AI questions:', error);
    return [];
  }

  return (data as AIQuestion[]) || [];
}

/**
 * Get AI questions for a specific page
 */
export async function getAIQuestionsForPage(
  pageSlug: string,
  locationScope: 'karasu' | 'kocaali' | 'global',
  pageType: 'pillar' | 'cornerstone' | 'blog' | 'neighborhood' | 'comparison'
): Promise<AIQuestion[]> {
  // First try to get questions specific to this page
  const specificQuestions = await getAIQuestions(locationScope, pageType, pageSlug, 5);
  
  // If not enough, get general questions for this page type
  if (specificQuestions.length < 3) {
    const generalQuestions = await getAIQuestions(locationScope, pageType, undefined, 5 - specificQuestions.length);
    return [...specificQuestions, ...generalQuestions].slice(0, 5);
  }

  return specificQuestions;
}

/**
 * Get AI questions for comparison pages
 */
export async function getComparisonAIQuestions(): Promise<AIQuestion[]> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('ai_questions')
    .select('*')
    .eq('status', 'published')
    .eq('page_type', 'comparison')
    .order('priority', { ascending: false })
    .limit(8);

  if (error) {
    // Handle PostgREST schema cache errors gracefully (table might not exist yet)
    if (error.code === 'PGRST205' || error.code === 'PGRST202' || error.message?.includes('schema cache')) {
      console.warn('AI questions table not found in schema cache, returning empty array');
      return [];
    }
    console.error('Error fetching comparison AI questions:', error);
    return [];
  }

  return (data as AIQuestion[]) || [];
}
