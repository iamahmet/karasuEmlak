import 'server-only';

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  // Dev-only JSON.parse wrapper disabled - was interfering with Next.js RSC payload parsing.
  // Re-enable only when debugging specific JSON parse failures.

  try {
    const { registerFatalHandlers } = await import('@/lib/server/fatal-handlers');
    registerFatalHandlers();
  } catch (error) {
    // Never throw from instrumentation
    console.warn('[instrumentation] Failed to register fatal handlers:', error);
  }
}
