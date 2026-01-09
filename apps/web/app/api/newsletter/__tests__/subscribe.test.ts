import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../subscribe/route';
import { NextRequest } from 'next/server';

// Mock Supabase
vi.mock('@karasu/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    })),
  })),
}));

// Mock rate limiting
vi.mock('@/lib/security/rate-limit', () => ({
  withRateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 9 }),
}));

describe('POST /api/newsletter/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for missing email', async () => {
    const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/e-posta|E-posta/i);
  });

  it('returns 400 for invalid email', async () => {
    const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Geçerli');
  });

  it('returns 200 for valid subscription', async () => {
    const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        source: 'blog-sidebar',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
