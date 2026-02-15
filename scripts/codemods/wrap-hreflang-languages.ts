#!/usr/bin/env tsx
/**
 * Codemod: Wrap `alternates.languages: { ... }` with `pruneHreflangLanguages(...)`
 * across `apps/web/app/**` so inactive locales are not published in hreflang.
 *
 * Safe-ish transformation:
 * - Only targets `languages:` object literals.
 * - Skips occurrences already wrapped.
 * - Adds missing import: `import { pruneHreflangLanguages } from '@/lib/seo/hreflang';`
 *
 * Run:
 *   pnpm tsx scripts/codemods/wrap-hreflang-languages.ts
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const IMPORT_LINE = "import { pruneHreflangLanguages } from '@/lib/seo/hreflang';";

function listFiles(): string[] {
  const out = execSync("git ls-files -- 'apps/web/app'", { encoding: 'utf8' }).trim();
  if (!out) return [];
  return out
    .split('\n')
    .map((s) => s.trim())
    .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));
}

function isIdentifierChar(ch: string) {
  return /[A-Za-z0-9_$]/.test(ch);
}

function findMatchingBrace(src: string, openIndex: number): number {
  let depth = 0;
  let inS = false;
  let inD = false;
  let inT = false;
  let escape = false;

  for (let i = openIndex; i < src.length; i++) {
    const ch = src[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (inS) {
      if (ch === '\\\\') escape = true;
      else if (ch === "'") inS = false;
      continue;
    }

    if (inD) {
      if (ch === '\\\\') escape = true;
      else if (ch === '"') inD = false;
      continue;
    }

    if (inT) {
      if (ch === '\\\\') escape = true;
      else if (ch === '`') inT = false;
      continue;
    }

    if (ch === "'") {
      inS = true;
      continue;
    }
    if (ch === '"') {
      inD = true;
      continue;
    }
    if (ch === '`') {
      inT = true;
      continue;
    }

    if (ch === '{') {
      depth++;
      continue;
    }
    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
      continue;
    }
  }

  return -1;
}

function wrapLanguagesObjects(src: string): { updated: string; changed: boolean } {
  let out = src;
  let idx = 0;
  let changed = false;

  while (true) {
    const hit = out.indexOf('languages', idx);
    if (hit === -1) break;

    // Ensure it's `languages:` (not part of another identifier).
    const prev = hit > 0 ? out[hit - 1] : '';
    const next = hit + 'languages'.length < out.length ? out[hit + 'languages'.length] : '';
    if ((prev && isIdentifierChar(prev)) || (next && isIdentifierChar(next))) {
      idx = hit + 1;
      continue;
    }

    let j = hit + 'languages'.length;
    while (j < out.length && /\s/.test(out[j])) j++;
    if (out[j] !== ':') {
      idx = hit + 1;
      continue;
    }
    j++;
    while (j < out.length && /\s/.test(out[j])) j++;

    // Already wrapped?
    if (out.slice(j, j + 'pruneHreflangLanguages'.length) === 'pruneHreflangLanguages') {
      idx = j + 1;
      continue;
    }

    if (out[j] !== '{') {
      idx = hit + 1;
      continue;
    }

    const braceStart = j;
    const braceEnd = findMatchingBrace(out, braceStart);
    if (braceEnd === -1) {
      idx = hit + 1;
      continue;
    }

    out =
      out.slice(0, braceStart) +
      'pruneHreflangLanguages(' +
      out.slice(braceStart, braceEnd + 1) +
      ')' +
      out.slice(braceEnd + 1);

    changed = true;
    idx = braceStart + 1;
  }

  return { updated: out, changed };
}

function ensureImport(src: string): { updated: string; changed: boolean } {
  if (src.includes(IMPORT_LINE)) return { updated: src, changed: false };
  if (!src.includes('pruneHreflangLanguages(')) return { updated: src, changed: false };

  const lines = src.split('\n');
  let insertAt = 0;

  // Keep 'use client' directive at top if present.
  if (lines[0]?.trim() === "'use client';" || lines[0]?.trim() === '"use client";') {
    insertAt = 1;
    // Skip immediate blank line after directive
    if (lines[insertAt]?.trim() === '') insertAt++;
  }

  // Insert after initial import block.
  let i = insertAt;
  for (; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === '' || t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) continue;
    if (t.startsWith('import ')) continue;
    break;
  }

  // i is the first non-import statement (or EOF). Insert before it, but after existing imports.
  insertAt = i;
  lines.splice(insertAt, 0, IMPORT_LINE);
  return { updated: lines.join('\n'), changed: true };
}

function main() {
  const files = listFiles();
  let touched = 0;

  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    if (!src.includes('languages')) continue;

    const wrapped = wrapLanguagesObjects(src);
    if (!wrapped.changed) continue;

    const imported = ensureImport(wrapped.updated);
    const final = imported.updated;

    writeFileSync(file, final, 'utf8');
    touched++;
  }

  console.log(`[wrap-hreflang] Updated ${touched} file(s).`);
}

main();
