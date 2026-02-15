import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import deprecation from 'eslint-plugin-deprecation';

export default [
  {
    ignores: [
      '**/.next/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/.vercel/**',
      '**/.tmp/**',
      '.tmp/**',
      '**/coverage/**',
      // Supabase migrations are SQL; linting them is noise.
      'supabase/**',
    ],
    plugins: {
      deprecation,
    },
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  // Pragmatic overrides for this codebase: keep core Next/React quality rules,
  // but avoid blocking on pervasive TypeScript lint debt.
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-require-imports': 'off',
      // App Router projects in this repo don't use /pages.
      '@next/next/no-html-link-for-pages': 'off',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      // These additional react-hooks rules are too strict for the current codebase.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/immutability': 'off',
      // Optional plugins referenced by some presets may not be installed everywhere.
      'deprecation/deprecation': 'off',
      // React Compiler related lint rule (false positives in existing code).
      'react-hooks/preserve-manual-memoization': 'off',
      'prefer-const': 'warn',
    },
  },
];
