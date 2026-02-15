import 'server-only';

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  // Dev-only: help locate opaque JSON.parse crashes that bubble up without stack context.
  // Keep the wrapper extremely small to avoid interfering with Next.js internals.
  if (process.env.NODE_ENV === 'development') {
    const g = globalThis as any;
    if (!g.__karasuJsonParseWrapped) {
      g.__karasuJsonParseWrapped = true;
      const orig = JSON.parse;
      JSON.parse = function (text: any, reviver?: any) {
        try {
          return (orig as any)(text, reviver);
        } catch (err) {
          if (!g.__karasuJsonParseFirstError) {
            const s = typeof text === 'string' ? text : String(text);
            g.__karasuJsonParseFirstError = true;
            console.error('[debug] JSON.parse failed', {
              message: (err as any)?.message,
              length: s.length,
              preview: s.slice(0, 300),
              tail: s.length > 150 ? s.slice(-150) : '',
              stack: new Error().stack,
            });
          }
          throw err;
        }
      } as any;
    }
  }

  try {
    const { registerFatalHandlers } = await import('@/lib/server/fatal-handlers');
    registerFatalHandlers();
  } catch (error) {
    // Never throw from instrumentation
    console.warn('[instrumentation] Failed to register fatal handlers:', error);
  }
}
