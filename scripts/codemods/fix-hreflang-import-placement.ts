/**
 * Fix broken imports introduced by an automated codemod:
 *
 * Some files ended up with this invalid syntax:
 *   import {
 *   import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
 *     Foo,
 *   } from '...';
 *
 * This script moves `pruneHreflangLanguages` import above the `{ ... }` import.
 *
 * Usage:
 *   pnpm tsx scripts/codemods/fix-hreflang-import-placement.ts
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, 'apps', 'web', 'app');

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      yield* walk(full);
      continue;
    }
    if (!ent.isFile()) continue;
    if (!full.endsWith('.ts') && !full.endsWith('.tsx')) continue;
    yield full;
  }
}

function normalizeAndFix(src: string): { out: string; changed: boolean } {
  const re =
    /(^\s*import\s*{\s*$\n)\s*import\s*{\s*pruneHreflangLanguages\s*}\s*from\s*['"]@\/lib\/seo\/hreflang['"];\s*\n/gm;

  let out = src.replace(
    re,
    `import { pruneHreflangLanguages } from '@/lib/seo/hreflang';\n$1`
  );

  // De-duplicate the import if it exists more than once after rewriting.
  const importLine = `import { pruneHreflangLanguages } from '@/lib/seo/hreflang';`;
  let seen = false;
  out = out
    .split('\n')
    .filter((line) => {
      if (line.trim() !== importLine) return true;
      if (seen) return false;
      seen = true;
      return true;
    })
    .join('\n');

  return { out, changed: out !== src };
}

async function main() {
  const changed: string[] = [];
  for await (const file of walk(TARGET_DIR)) {
    const src = await fs.readFile(file, 'utf8');
    const { out, changed: didChange } = normalizeAndFix(src);
    if (!didChange) continue;
    await fs.writeFile(file, out, 'utf8');
    changed.push(path.relative(ROOT, file));
  }

  // eslint-disable-next-line no-console
  console.log(`[fix-hreflang-import-placement] updated ${changed.length} files`);
  if (changed.length > 0) {
    // eslint-disable-next-line no-console
    console.log(changed.join('\n'));
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

