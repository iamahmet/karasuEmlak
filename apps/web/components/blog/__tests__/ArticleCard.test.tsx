import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ArticleCard } from '../ArticleCard';
import type { Article } from '@/lib/supabase/queries/articles';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock CardImage and ExternalImage
vi.mock('@/components/images', () => ({
  CardImage: ({ alt }: { alt: string }) => <img alt={alt} data-testid="card-image" />,
  ExternalImage: ({ alt }: { alt: string }) => <img alt={alt} data-testid="external-image" />,
}));

// Mock reading time calculation
vi.mock('@/lib/utils/reading-time', () => ({
  calculateReadingTime: () => 5,
}));

// Mock free image fallback
vi.mock('@/lib/images/free-image-fallback', () => ({
  isValidCloudinaryId: (id: string | null) => id?.startsWith('karasu/') || false,
  getFreeImageForArticle: vi.fn().mockResolvedValue('https://example.com/fallback.jpg'),
}));

const mockArticle: Article = {
  id: '1',
  title: 'Test Article',
  slug: 'test-article',
  excerpt: 'Test excerpt',
  content: 'Test content',
  author: 'Test Author',
  featured_image: 'karasu/test-image',
  published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  category: 'emlak',
  tags: ['test', 'karasu'],
  seo_title: 'Test SEO Title',
  seo_description: 'Test SEO Description',
  view_count: 0,
};

describe('ArticleCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders article title', () => {
    render(<ArticleCard article={mockArticle} basePath="" />);
    expect(screen.getByText('Test Article')).toBeInTheDocument();
  });

  it('renders article excerpt', () => {
    render(<ArticleCard article={mockArticle} basePath="" />);
    expect(screen.getByText('Test excerpt')).toBeInTheDocument();
  });

  it('renders author name', () => {
    render(<ArticleCard article={mockArticle} basePath="" />);
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('generates correct link href', () => {
    render(<ArticleCard article={mockArticle} basePath="/tr" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/tr/blog/test-article');
  });

  it('displays reading time', async () => {
    render(<ArticleCard article={mockArticle} basePath="" />);
    await waitFor(() => {
      expect(screen.getByText(/5 dk/)).toBeInTheDocument();
    });
  });

  it('renders Cloudinary image when featured_image exists', () => {
    render(<ArticleCard article={mockArticle} basePath="" />);
    expect(screen.getByTestId('card-image')).toBeInTheDocument();
  });

  it('renders fallback image when featured_image is missing', async () => {
    const articleWithoutImage = { ...mockArticle, featured_image: null };
    render(<ArticleCard article={articleWithoutImage} basePath="" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('external-image')).toBeInTheDocument();
    });
  });
});
