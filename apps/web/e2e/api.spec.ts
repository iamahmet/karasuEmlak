import { test, expect } from '@playwright/test';

/**
 * API Endpoints Tests
 * 
 * Ensures all API routes return valid JSON
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('API Endpoints', () => {
  test('GET /api/health should return JSON', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.status()).toBe(200);
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    
    const body = await response.json();
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('timestamp');
  });

  test('GET /api/listings should return JSON', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/listings?limit=1`);
    expect(response.status()).toBe(200);
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    
    const body = await response.json();
    expect(body).toHaveProperty('success');
    if (body.success) {
      expect(body).toHaveProperty('data');
    }
  });

  test('GET /api/articles should return JSON', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/articles?limit=1`);
    expect(response.status()).toBe(200);
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    
    const body = await response.json();
    expect(body).toHaveProperty('success');
  });

  test('GET /api/news should return JSON', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/news?limit=1`);
    expect(response.status()).toBe(200);
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    
    const body = await response.json();
    expect(body).toHaveProperty('success');
  });

  test('GET /api/faq should return JSON', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/faq`);
    expect(response.status()).toBe(200);
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    
    const body = await response.json();
    expect(body).toHaveProperty('success');
  });

  test('GET /api/services/weather should return JSON', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/services/weather?city=Karasu`);
    
    // May return 503 if API key not configured, but should still be JSON
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    
    const body = await response.json();
    expect(body).toHaveProperty('success');
  });

  test('error responses should be JSON', async ({ request }) => {
    // Test a non-existent endpoint
    const response = await request.get(`${BASE_URL}/api/nonexistent-endpoint-12345`);
    
    // Should return JSON even for errors
    const contentType = response.headers()['content-type'];
    if (contentType) {
      expect(contentType).toContain('application/json');
    }
  });
});
