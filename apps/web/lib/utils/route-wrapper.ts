/**
 * Route Wrapper - Guaranteed JSON Error Handling
 * 
 * Wraps API route handlers to ensure:
 * 1. Always returns JSON (never plain text)
 * 2. Catches all errors
 * 3. Provides stack trace in dev mode
 */

import { NextRequest, NextResponse } from 'next/server';

export function withJsonErrorHandling<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      const result = await handler(...args);
      
      // If already a NextResponse, return as is
      if (result instanceof NextResponse) {
        return result;
      }
      
      // Otherwise, wrap in JSON
      return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
      const requestId = crypto.randomUUID();
      const isDev = process.env.NODE_ENV === 'development';
      
      console.error(`[${requestId}] Route error:`, {
        message: error?.message,
        stack: isDev ? error?.stack : undefined,
        code: error?.code,
      });
      
      // Always return JSON, never plain text
      return NextResponse.json(
        {
          success: false,
          error: error?.message || 'Internal Server Error',
          code: error?.code || 'INTERNAL_ERROR',
          requestId,
          ...(isDev && error?.stack ? { stack: error.stack } : {}),
        },
        { status: error?.statusCode || 500 }
      );
    }
  }) as T;
}
