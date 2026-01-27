#!/usr/bin/env tsx
/**
 * Smoke test for /kiralik routing + API
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 pnpm tsx scripts/smoke-kiralik.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const TRIM = 200;

interface Result {
  name: string;
  url: string;
  status: number;
  location?: string | null;
  contentType: string;
  bodyPreview: string;
  jsonParseOk: boolean;
  jsonParseError?: string;
}

const endpoints = [
  { name: '/kiralik', path: '/kiralik', expectJson: false },
  { name: '/tr/kiralik', path: '/tr/kiralik', expectJson: false },
  { name: '/api/listings?type=kiralik', path: '/api/listings?type=kiralik', expectJson: true },
];

async function testEndpoint(entry: { name: string; path: string; expectJson: boolean }): Promise<Result> {
  const url = `${BASE}${entry.path}`;
  const res = await fetch(url, { redirect: 'manual' });
  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');
  let jsonParseOk = false;
  let jsonParseError: string | undefined;

  if (entry.expectJson || isJson) {
    try {
      JSON.parse(text);
      jsonParseOk = true;
    } catch (error: any) {
      jsonParseOk = false;
      jsonParseError = error?.message || 'Unknown parse error';
    }
  }

  return {
    name: entry.name,
    url,
    status: res.status,
    location: res.headers.get('location'),
    contentType,
    bodyPreview: text.slice(0, TRIM).replace(/\s+/g, ' '),
    jsonParseOk,
    jsonParseError,
  };
}

function passFail(result: Result): boolean {
  if (result.name === '/kiralik') {
    return result.status === 200 || (result.status >= 300 && result.status < 400);
  }
  if (result.name === '/tr/kiralik') {
    return result.status === 200;
  }
  if (result.name === '/api/listings?type=kiralik') {
    return result.status === 200 && result.jsonParseOk;
  }
  return false;
}

async function main() {
  const results = await Promise.all(endpoints.map(testEndpoint));
  const lines: string[] = [];

  lines.push('# DEBUG_KIRALIK_SMOKE');
  lines.push('');
  lines.push(`Base URL: ${BASE}`);
  lines.push('');

  for (const result of results) {
    const ok = passFail(result);
    lines.push(`## ${result.name}`);
    lines.push(`- URL: ${result.url}`);
    lines.push(`- Status: ${result.status} ${ok ? '✅' : '❌'}`);
    lines.push(`- Content-Type: ${result.contentType || 'n/a'}`);
    if (result.location) {
      lines.push(`- Location: ${result.location}`);
    }
    if (result.jsonParseError) {
      lines.push(`- JSON parse error: ${result.jsonParseError}`);
    }
    lines.push(`- Body preview: ${result.bodyPreview}`);
    lines.push('');
  }

  const outPath = join(process.cwd(), 'DEBUG_KIRALIK_SMOKE.md');
  writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`Report written to: ${outPath}`);
}

main().catch((error) => {
  console.error('Smoke failed:', error);
  process.exit(1);
});
