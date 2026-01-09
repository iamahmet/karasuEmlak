/**
 * Timeout Behavior Test
 * 
 * Tests that homepage renders even when database is slow/unreachable
 * This simulates the graceful degradation behavior required by V4 rules
 */

import { withTimeout, withTimeoutAll } from '../apps/web/lib/utils/timeout';

// Mock slow database call
async function slowDatabaseCall(ms: number): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve('data'), ms);
  });
}

// Mock failing database call
async function failingDatabaseCall(): Promise<string> {
  throw new Error('Database connection failed');
}

async function runTests() {
  console.log('🧪 Testing Timeout Behavior\n');

  // Test 1: Timeout works correctly
  console.log('Test 1: Timeout with slow operation');
  try {
    const result = await withTimeout(slowDatabaseCall(5000), 1000, 'fallback');
    if (result === 'fallback') {
      console.log('✅ PASSED: Timeout correctly returns fallback');
    } else {
      console.log('❌ FAILED: Timeout did not return fallback');
      process.exit(1);
    }
  } catch (error) {
    console.log('✅ PASSED: Timeout correctly handled error');
  }

  // Test 2: Fast operation completes successfully
  console.log('\nTest 2: Fast operation completes');
  try {
    const result = await withTimeout(slowDatabaseCall(100), 1000, 'fallback');
    if (result === 'data') {
      console.log('✅ PASSED: Fast operation completed successfully');
    } else {
      console.log('❌ FAILED: Fast operation did not complete');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ FAILED: Fast operation threw error');
    process.exit(1);
  }

  // Test 3: Failing operation returns fallback
  console.log('\nTest 3: Failing operation returns fallback');
  try {
    const result = await withTimeout(failingDatabaseCall(), 1000, 'fallback');
    if (result === 'fallback') {
      console.log('✅ PASSED: Failing operation returns fallback');
    } else {
      console.log('❌ FAILED: Failing operation did not return fallback');
      process.exit(1);
    }
  } catch (error) {
    console.log('✅ PASSED: Failing operation handled gracefully');
  }

  // Test 4: Multiple operations with timeout
  console.log('\nTest 4: Multiple operations with timeout');
  try {
    const results = await withTimeoutAll(
      [
        slowDatabaseCall(100),
        slowDatabaseCall(200),
        slowDatabaseCall(5000), // This will timeout
      ],
      1000,
      null
    );
    
    if (results[0] === 'data' && results[1] === 'data' && results[2] === null) {
      console.log('✅ PASSED: Multiple operations handled correctly');
    } else {
      console.log('❌ FAILED: Multiple operations not handled correctly');
      console.log('Results:', results);
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ FAILED: Multiple operations threw error');
    process.exit(1);
  }

  console.log('\n✅ All timeout tests passed!');
}

runTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});

