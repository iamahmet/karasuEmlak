import { NextRequest, NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  requestId?: string;
}

export function createSuccessResponse<T>(
  requestId: string | null,
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      requestId: requestId || undefined,
    },
    { status }
  );
}

export function createErrorResponse(
  requestId: string | null,
  code: string,
  message: string,
  status: number = 500,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
      requestId: requestId || undefined,
    },
    { status }
  );
}

export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const requestId = request.headers.get('x-request-id') || 
                     `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      return await handler(request);
    } catch (error: any) {
      console.error('API Error:', error);
      
      return createErrorResponse(
        requestId,
        error.message || 'Internal server error',
        error.status || 500,
        error.code,
        process.env.NODE_ENV === 'development' ? error.stack : undefined
      );
    }
  };
}
