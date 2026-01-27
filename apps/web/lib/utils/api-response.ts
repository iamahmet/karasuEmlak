/**
 * API Response Utilities
 * 
 * Guarantees all API responses are valid JSON with proper error handling.
 */

import { NextResponse } from 'next/server';
import { toSerializable } from '@/lib/serialize/toSerializable';

interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  requestId?: string;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  requestId?: string;
}

/**
 * Create a successful JSON response
 */
export function createSuccessResponse<T = any>(
  data: T,
  requestId?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const serialized = toSerializable(data);
  return NextResponse.json(
    {
      success: true as const,
      data: serialized,
      ...(requestId && { requestId }),
    },
    { status }
  );
}

/**
 * Create an error JSON response
 * Always returns valid JSON, never plain text
 */
export function createErrorResponse(
  requestId: string | undefined,
  code: string,
  message: string,
  details?: any,
  status: number = 500
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error: message,
      code,
      ...(requestId && { requestId }),
      ...(details && process.env.NODE_ENV === 'development' && { details }),
    },
    { status }
  );
}

/**
 * Wrap an API handler with automatic error handling and JSON serialization
 */
export function withJsonResponse<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      const result = await handler(...args);
      
      // If already a NextResponse, return as is
      if (result instanceof NextResponse) {
        return result;
      }
      
      // Otherwise, wrap in success response
      return createSuccessResponse(result);
    } catch (error: any) {
      const requestId = args[0]?.headers?.get('x-request-id') || 
                        crypto.randomUUID();
      
      const errorMessage = error?.message || 'Internal Server Error';
      const errorCode = error?.code || 'INTERNAL_ERROR';
      const statusCode = error?.statusCode || 500;
      
      return createErrorResponse(
        requestId,
        errorCode,
        errorMessage,
        process.env.NODE_ENV === 'development' ? error?.stack : undefined,
        statusCode
      );
    }
  }) as T;
}
