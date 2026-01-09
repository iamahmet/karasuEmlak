/**
 * API Client Utility
 * Provides retry mechanism, error handling, and consistent API calls
 */

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatuses?: number[];
  retryableErrors?: string[];
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  requestId?: string;
}

/**
 * Retry wrapper for API calls
 */
export async function fetchWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<ApiResponse<T>> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryableStatuses = [408, 429, 500, 502, 503, 504],
    retryableErrors = ["NetworkError", "Failed to fetch", "timeout"],
  } = retryOptions;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      // If response is ok, parse and return
      if (response.ok) {
        const data = await response.json();
        return data;
      }

      // Check if status is retryable
      if (retryableStatuses.includes(response.status) && attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Non-retryable error or max retries reached
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}`,
        code: errorData.code || `HTTP_${response.status}`,
        requestId: errorData.requestId,
      };
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      const isRetryable =
        retryableErrors.some((err) => error.message?.includes(err)) ||
        error.name === "TimeoutError" ||
        error.name === "NetworkError";

      if (isRetryable && attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Non-retryable error or max retries reached
      return {
        success: false,
        error: error.message || "Network error",
        code: "NETWORK_ERROR",
      };
    }
  }

  // All retries exhausted
  return {
    success: false,
    error: lastError?.message || "Request failed after retries",
    code: "RETRY_EXHAUSTED",
  };
}

/**
 * Standardized API error handler
 */
export function handleApiError(error: unknown): {
  message: string;
  code: string;
  userFriendly: string;
} {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      return {
        message: error.message,
        code: "NETWORK_ERROR",
        userFriendly: "Bağlantı hatası. İnternet bağlantınızı kontrol edin.",
      };
    }

    // Timeout errors
    if (error.message.includes("timeout") || error.name === "TimeoutError") {
      return {
        message: error.message,
        code: "TIMEOUT_ERROR",
        userFriendly: "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.",
      };
    }

    // Generic error
    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
      userFriendly: error.message || "Beklenmeyen bir hata oluştu.",
    };
  }

  return {
    message: "Unknown error",
    code: "UNKNOWN_ERROR",
    userFriendly: "Beklenmeyen bir hata oluştu.",
  };
}

/**
 * Log error (only in development or to error tracking service)
 */
export function logError(error: unknown, context?: string) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context || "API"}] Error:`, error);
  }
  // In production, send to error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === "production") {
  //   Sentry.captureException(error, { tags: { context } });
  // }
}
