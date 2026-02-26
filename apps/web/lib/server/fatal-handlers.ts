import 'server-only';

declare global {
   
  var __fatalHandlersRegistered: boolean | undefined;
}

export function registerFatalHandlers() {
  if (global.__fatalHandlersRegistered) {
    return;
  }

  global.__fatalHandlersRegistered = true;

  process.on('uncaughtException', (error) => {
    console.error('[FATAL uncaughtException]', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[FATAL unhandledRejection]', {
      reason: reason instanceof Error ? {
        message: reason.message,
        stack: reason.stack,
        name: reason.name,
      } : reason,
    });
  });

  // NOTE: JSON.parse override removed - it was causing infinite loops
  // with Next.js internal manifest parsing
}
