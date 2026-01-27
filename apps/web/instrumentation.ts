import 'server-only';

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  try {
    const { registerFatalHandlers } = await import('@/lib/server/fatal-handlers');
    registerFatalHandlers();
  } catch (error) {
    // Never throw from instrumentation
    console.warn('[instrumentation] Failed to register fatal handlers:', error);
  }
}
