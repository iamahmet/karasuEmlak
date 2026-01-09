import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock Supabase
vi.mock('@karasu/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
    })),
  })),
}));

// Mock rate limiting
vi.mock('@/lib/security/rate-limit', () => ({
  withRateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 2 }),
}));

// Mock generateSlug
vi.mock('@/lib/utils', () => ({
  generateSlug: vi.fn((text: string) => text.toLowerCase().replace(/\s+/g, '-')),
}));

describe('POST /api/listings/create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for missing required fields', async () => {
    const request = new NextRequest('http://localhost/api/listings/create', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Listing',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('returns 200 for valid listing data', async () => {
    const request = new NextRequest('http://localhost/api/listings/create', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Listing',
        status: 'satilik',
        property_type: 'daire',
        location_neighborhood: 'Merkez',
        location_city: 'Sakarya',
        location_district: 'Karasu',
        price_amount: 500000,
        price_currency: 'TRY',
      }),
    });

    const response = await POST(request);
    
    // Should return 200 or 201
    expect([200, 201]).toContain(response.status);
  });
});
