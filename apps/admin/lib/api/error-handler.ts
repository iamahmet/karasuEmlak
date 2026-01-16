/**
 * Standardized API Error Handler
 * Provides request correlation, safe error formatting, and observability
 */

import { NextRequest, NextResponse } from "next/server";

export interface APIError {
  success: false;
  requestId: string;
  code: string;
  message: string;
  details?: unknown;
  stack?: string; // Only in development
}

export interface APISuccess<T = unknown> {
  success: true;
  requestId: string;
  data: T;
}

export type APIResponse<T = unknown> = APISuccess<T> | APIError;

/**
 * Generate a unique request ID for correlation
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get request ID from request headers or generate a new one
 */
export function getRequestId(request: NextRequest): string {
  const existingId = request.headers.get("x-request-id");
  return existingId || generateRequestId();
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  requestId: string,
  code: string,
  message: string,
  details?: unknown,
  statusCode: number = 500
): NextResponse<APIError> {
  const isDev = process.env.NODE_ENV === "development";
  
  const error: APIError = {
    success: false,
    requestId,
    code,
    message,
    ...(details ? { details } : {}),
    ...(isDev ? { stack: new Error().stack } : {}),
  };

  return NextResponse.json(error, {
    status: statusCode,
    headers: {
      "x-request-id": requestId,
      "Content-Type": "application/json",
    },
  });
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  requestId: string,
  data: T,
  statusCode: number = 200
): NextResponse<APISuccess<T>> {
  return NextResponse.json(
    {
      success: true,
      requestId,
      data,
    },
    {
      status: statusCode,
      headers: {
        "x-request-id": requestId,
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Wrap API handler with error handling and observability
 * Supports both Request and NextRequest types
 */
export function withErrorHandling<T extends NextResponse, TContext = unknown>(
  handler: (request: NextRequest, context?: TContext) => Promise<T>
) {
  return async (request: NextRequest, context?: TContext): Promise<NextResponse> => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    const method = request.method;
    const url = request.url;

    try {
      console.log(`[${requestId}] ${method} ${url} - START`);

      const result = await handler(request, context);

      const duration = Date.now() - startTime;
      console.log(`[${requestId}] ${method} ${url} - SUCCESS (${duration}ms)`);

      // Result is already a NextResponse (from createSuccessResponse/createErrorResponse)
      // Add request ID header if not present
      const headers = new Headers(result.headers);
      if (!headers.has("x-request-id")) {
        headers.set("x-request-id", requestId);
      }
      return new NextResponse(result.body, {
        status: result.status,
        statusText: result.statusText,
        headers,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[${requestId}] ${method} ${url} - ERROR (${duration}ms):`, {
        message: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });

      // Determine error code and status
      let code = "INTERNAL_ERROR";
      let statusCode = 500;
      let message = error.message || "Internal server error";

      // PostgREST schema cache staleness (PGRST205, PGRST202)
      if (error.code === "PGRST205" || error.code === "PGRST202") {
        code = "POSTGREST_SCHEMA_STALE";
        statusCode = 503; // Service Unavailable - indicates temporary issue
        message = "PostgREST schema cache is stale. See: docs/POSTGREST_CACHE_RUNBOOK.md";
        
        // Log with actionable steps
        console.error(`[${requestId}] ⚠️  PostgREST schema cache stale (${error.code})`);
        console.error(`[${requestId}] 💡 Quick fix: POST /api/admin/reload-postgrest`);
        console.error(`[${requestId}] 💡 Or run: pnpm supabase:reload-postgrest`);
      } else if (error.code === "PGRST116" || error.code === "42P01") {
        // Table doesn't exist (different from cache stale)
        code = "TABLE_NOT_FOUND";
        statusCode = 404;
        message = "Requested database table does not exist. Run: pnpm db:verify to check schema";
        
        // Log with actionable steps
        console.error(`[${requestId}] ❌ Table not found (${error.code})`);
        console.error(`[${requestId}] 💡 Check: pnpm db:verify`);
        console.error(`[${requestId}] 💡 Apply migrations: pnpm db:migrate`);
      } else if (error.message?.includes("schema cache") || error.message?.includes("schema_cache")) {
        code = "POSTGREST_SCHEMA_STALE";
        statusCode = 503;
        message = "PostgREST schema cache is stale. See: docs/POSTGREST_CACHE_RUNBOOK.md";
        
        // Log with actionable steps
        console.error(`[${requestId}] ⚠️  PostgREST schema cache stale (message match)`);
        console.error(`[${requestId}] 💡 Quick fix: POST /api/admin/reload-postgrest`);
      } else if (error.message?.includes("permission denied") || error.message?.includes("unauthorized")) {
        code = "UNAUTHORIZED";
        statusCode = 401;
      } else if (error.message?.includes("forbidden")) {
        code = "FORBIDDEN";
        statusCode = 403;
      } else if (error.name === "ValidationError" || error.name === "ZodError") {
        code = "VALIDATION_ERROR";
        statusCode = 400;
      }

      // For schema cache staleness, return clear error (not empty data)
      // This allows UI to show helpful message and suggest running reload script
      if (code === "POSTGREST_SCHEMA_STALE") {
        console.warn(`[${requestId}] PostgREST schema cache is stale. Suggest running: pnpm supabase:reload-postgrest`);
        return createErrorResponse(
          requestId,
          code,
          message,
          {
            suggestion: "Run: pnpm supabase:reload-postgrest",
            documentation: "See scripts/supabase/POSTGREST_CACHE.md",
          },
          statusCode
        );
      }

      // For table not found (not cache issue), return empty data gracefully
      if (code === "TABLE_NOT_FOUND") {
        console.warn(`[${requestId}] Table not found: ${message}`);
        return createErrorResponse(requestId, code, message, undefined, statusCode);
      }

      return createErrorResponse(
        requestId,
        code,
        message,
        process.env.NODE_ENV === "development" ? { originalError: error.message } : undefined,
        statusCode
      );
    }
  };
}
