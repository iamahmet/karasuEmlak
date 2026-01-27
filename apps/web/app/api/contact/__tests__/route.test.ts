import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'test-id' }),
    },
  })),
}));

// Mock Supabase
vi.mock('@karasu/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  })),
}));

// Mock rate limit
vi.mock('@/lib/security/rate-limit', () => ({
  withRateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for missing name', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        subject: 'Test Konu',
        message: 'Test message',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: { path?: string[] }) => e.path?.includes('name'))).toBe(true);
  });

  it('returns 400 for invalid email', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        subject: 'Test Konu',
        message: 'Test message',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: { path?: string[] }) => e.path?.includes('email'))).toBe(true);
  });

  it('returns 200 for valid request', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+905551234567',
        subject: 'Test Konu',
        message: 'Test message',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBeDefined();
  });
});
