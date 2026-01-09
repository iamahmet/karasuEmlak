import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListingCard } from '../listings/ListingCard';
import type { Listing } from '@/lib/supabase/queries';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock CardImage
vi.mock('@/components/images', () => ({
  CardImage: ({ alt, className }: { alt: string; className?: string }) => (
    <img alt={alt} className={className} data-testid="card-image" />
  ),
}));

// Mock ComparisonButton
vi.mock('@/components/comparison/ComparisonButton', () => ({
  ComparisonButton: () => <button data-testid="comparison-button">Compare</button>,
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
  coordinates_lat: '40.7128',
  coordinates_lng: '29.2345',
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
    // Check for size (100 m²) or rooms (3+1) - either should be present
    const sizeText = screen.queryByText(/100/i);
    const roomsText = screen.queryByText(/3/i);
    expect(sizeText || roomsText).toBeTruthy();
  });

  it('renders status badge', () => {
    render(<ListingCard listing={mockListing} basePath="" />);
    expect(screen.getByText('Satılık')).toBeInTheDocument();
  });

  it('renders featured badge when listing is featured', () => {
    const featuredListing = { ...mockListing, featured: true };
    render(<ListingCard listing={featuredListing} basePath="" />);
    expect(screen.getByText(/Öne Çıkan/)).toBeInTheDocument();
  });

  it('renders in list view mode', () => {
    render(<ListingCard listing={mockListing} basePath="" viewMode="list" />);
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
  });

  it('renders image when available', () => {
    render(<ListingCard listing={mockListing} basePath="" />);
    expect(screen.getByTestId('card-image')).toBeInTheDocument();
  });

  it('renders placeholder when no image', () => {
    const listingWithoutImage = { ...mockListing, images: [] };
    render(<ListingCard listing={listingWithoutImage} basePath="" />);
    expect(screen.getByText('Görsel yok')).toBeInTheDocument();
  });

  it('renders correct link href', () => {
    render(<ListingCard listing={mockListing} basePath="/tr" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/tr/ilan/test-listing');
  });
});
