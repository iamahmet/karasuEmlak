import { Metadata } from 'next';
import { ArticlesEditor } from '@/components/articles/ArticlesEditor';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  // Try to fetch article title for metadata
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('articles')
      .select('title')
      .eq('id', id)
      .single();
    
    if (data) {
      return {
        title: `${data.title} - Düzenle | Karasu Emlak Admin`,
        description: 'Makaleyi düzenleyin',
      };
    }
  } catch (error) {
    // Ignore errors, use default metadata
  }
  
  return {
    title: 'Makale Düzenle | Karasu Emlak Admin',
    description: 'Makaleyi düzenleyin',
  };
}

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Redirect to locale-aware route
  redirect(`/tr/articles/${id}`);
}
