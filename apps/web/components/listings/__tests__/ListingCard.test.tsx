import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListingCard } from '../ListingCard';
import type { Listing } from '@/lib/supabase/queries';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock CardImage
vi.mock('@/components/images', () => ({
  CardImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

// Mock ComparisonButton
vi.mock('@/components/comparison/ComparisonButton', () => ({
  ComparisonButton: () => <button>Compare</button>,
}));

const mockListing: Listing = {
  id: '1',
  title: 'Test Listing',
  slug: 'test-listing',
  status: 'satilik',
  property_type: 'daire',
  location_city: 'Sakarya',
  location_district: 'Karasu',
  location_neighborhood: 'Merkez',
  location_full_address: 'Test Address',
  coordinates_lat: 40.7128,
  coordinates_lng: -74.0060,
  price_amount: 500000,
  price_currency: 'TRY',
  features: {
    sizeM2: 100,
    rooms: 3,
    bathrooms: 2,
  },
  description_short: 'Test description',
  description_long: 'Long test description',
  images: [
    {
      public_id: 'test-image',
      url: 'https://example.com/image.jpg',
      alt: 'Test image',
      order: 0,
    },
  ],
  agent_name: 'Test Agent',
  agent_phone: '+905551234567',
  agent_whatsapp: '+905551234567',
  agent_email: 'test@example.com',
  available: true,
  published: true,
  featured: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('ListingCard', () => {
  it('renders listing title', () => {
    render(<ListingCard listing={mockListing} basePath="" />);
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
  });

  it('renders listing price', () => {
    render(<ListingCard listing={mockListing} basePath="" />);
    expect(screen.getByText(/500.000/)).toBeInTheDocument();
  });

  it('renders listing location', () => {
    render(<ListingCard listing={mockListing} basePath="" />);
    expect(screen.getByText(/Karasu/)).toBeInTheDocument();
  });

  it('renders property features', () => {
    render(<ListingCard listing={mockListing} basePath="" />);
    expect(screen.getByText(/100 m²/)).toBeInTheDocument();
    expect(screen.getByText(/3 Oda/)).toBeInTheDocument();
  });

  it('renders in grid mode by default', () => {
    const { container } = render(<ListingCard listing={mockListing} basePath="" />);
    expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
  });

  it('renders in list mode when specified', () => {
    const { container } = render(
      <ListingCard listing={mockListing} basePath="" viewMode="list" />
    );
    expect(container.querySelector('[class*="flex-row"]')).toBeInTheDocument();
  });

  it('shows featured badge when listing is featured', () => {
    const featuredListing = { ...mockListing, featured: true };
    render(<ListingCard listing={featuredListing} basePath="" />);
    expect(screen.getByText(/Öne Çıkan/)).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(<ListingCard listing={mockListing} basePath="" />);
    expect(screen.getByText('Satılık')).toBeInTheDocument();
  });

  it('generates correct link href', () => {
    render(<ListingCard listing={mockListing} basePath="/tr" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/tr/ilan/test-listing');
  });
});
