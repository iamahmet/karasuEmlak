#!/usr/bin/env node
/**
 * Environment Variable Whitespace Checker
 * 
 * Checks all environment variables for leading/trailing whitespace
 * Exits with non-zero code if any whitespace is found
 * 
 * Usage: node scripts/check-env.ts
 * 
 * This script should be run before builds to catch whitespace issues early
 */

const CRITICAL_ENV_VARS = [
  'CRON_SECRET',
  'REVALIDATE_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'CLOUDINARY_API_SECRET',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'GITHUB_PERSONAL_ACCESS_TOKEN',
];

function checkEnvVar(key, value) {
  if (value === undefined) {
    return null;
  }

  const hasLeadingWhitespace = value.length > 0 && value !== value.trimStart();
  const hasTrailingWhitespace = value.length > 0 && value !== value.trimEnd();
  const trimmedLength = value.trim().length;
  const originalLength = value.length;

  if (hasLeadingWhitespace || hasTrailingWhitespace) {
    return {
      key,
      hasLeadingWhitespace,
      hasTrailingWhitespace,
      originalLength,
      trimmedLength,
    };
  }

  return null;
}

function maskValue(value) {
  if (value.length <= 8) {
    return '*'.repeat(value.length);
  }
  return `${value.substring(0, 4)}${'*'.repeat(value.length - 8)}${value.substring(value.length - 4)}`;
}

function main() {
  console.log('🔍 Checking environment variables for whitespace issues...\n');

  const issues = [];
  const allEnvVars = Object.keys(process.env);

  // Check critical vars first
  for (const key of CRITICAL_ENV_VARS) {
    const issue = checkEnvVar(key, process.env[key]);
    if (issue) {
      issues.push(issue);
    }
  }

  // Check all other vars
  for (const key of allEnvVars) {
    if (!CRITICAL_ENV_VARS.includes(key)) {
      const issue = checkEnvVar(key, process.env[key]);
      if (issue) {
        issues.push(issue);
      }
    }
  }

  if (issues.length === 0) {
    console.log('✅ No whitespace issues found in environment variables.\n');
    process.exit(0);
  }

  console.error('❌ Found environment variables with whitespace issues:\n');
  
  for (const issue of issues) {
    const value = process.env[issue.key] || '';
    const masked = maskValue(value);
    
    console.error(`  ${issue.key}:`);
    console.error(`    Value (masked): "${masked}"`);
    console.error(`    Original length: ${issue.originalLength}`);
    console.error(`    Trimmed length: ${issue.trimmedLength}`);
    console.error(`    Leading whitespace: ${issue.hasLeadingWhitespace ? '❌ YES' : '✅ No'}`);
    console.error(`    Trailing whitespace: ${issue.hasTrailingWhitespace ? '❌ YES' : '✅ No'}`);
    console.error('');
  }

  console.error('💡 Fix: Remove leading/trailing whitespace from the environment variable values.');
  console.error('   In Vercel: Settings → Environment Variables → Edit → Remove whitespace');
  console.error('   Locally: Check your .env.local file\n');

  process.exit(1);
}

main();
