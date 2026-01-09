/**
 * API Client Utility for Web App
 * Provides retry mechanism, error handling, offline support, and consistent API calls
 */

import { registerBackgroundSync } from '@/lib/pwa/background-sync';

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
  message?: string;
  code?: string;
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
    maxRetries = 2, // Web app: fewer retries (2 instead of 3)
    retryDelay = 1000,
    retryableStatuses = [408, 429, 500, 502, 503, 504],
    retryableErrors = ["NetworkError", "Failed to fetch", "timeout"],
  } = retryOptions;

  // Check if offline and method is not GET
  if (typeof window !== 'undefined' && !navigator.onLine && options.method && options.method !== 'GET') {
    // Register background sync for offline requests
    try {
      const taskId = await registerBackgroundSync({
        type: 'form_submission',
        data: options.body ? JSON.parse(options.body as string) : {},
        url,
        method: (options.method as 'POST' | 'PUT' | 'PATCH' | 'DELETE') || 'POST',
      });
      
      console.log('📴 Offline - Task queued for sync:', taskId);
      
      // Return a promise that resolves when online
      return new Promise((resolve) => {
        const handleOnline = async () => {
          window.removeEventListener('online', handleOnline);
          // Retry the request
          const result = await fetchWithRetry(url, options, retryOptions);
          resolve(result);
        };
        window.addEventListener('online', handleOnline);
      });
    } catch (error) {
      console.error('Error registering background sync:', error);
      return {
        success: false,
        error: 'Offline - İşlem kaydedildi, internet bağlantısı kurulduğunda gönderilecek',
        message: 'Offline - İşlem kaydedildi, internet bağlantısı kurulduğunda gönderilecek',
        code: 'OFFLINE_QUEUED',
      };
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(20000), // 20s timeout for web
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      if (retryableStatuses.includes(response.status) && attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}`,
        message: errorData.message || errorData.error,
        code: errorData.code || `HTTP_${response.status}`,
      };
    } catch (error: any) {
      lastError = error;

      const isRetryable =
        retryableErrors.some((err) => error.message?.includes(err)) ||
        error.name === "TimeoutError" ||
        error.name === "NetworkError";

      if (isRetryable && attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return {
        success: false,
        error: error.message || "Bağlantı hatası",
        message: error.message || "Bağlantı hatası",
        code: "NETWORK_ERROR",
      };
    }
  }

  return {
    success: false,
    error: lastError?.message || "İstek başarısız oldu",
    message: lastError?.message || "İstek başarısız oldu",
    code: "RETRY_EXHAUSTED",
  };
}

/**
 * Standardized API error handler for web app
 */
export function handleApiError(error: unknown): {
  message: string;
  code: string;
  userFriendly: string;
} {
  if (error instanceof Error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      return {
        message: error.message,
        code: "NETWORK_ERROR",
        userFriendly: "Bağlantı hatası. İnternet bağlantınızı kontrol edin.",
      };
    }

    if (error.message.includes("timeout") || error.name === "TimeoutError") {
      return {
        message: error.message,
        code: "TIMEOUT_ERROR",
        userFriendly: "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.",
      };
    }

    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
      userFriendly: error.message || "Bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }

  return {
    message: "Unknown error",
    code: "UNKNOWN_ERROR",
    userFriendly: "Bir hata oluştu. Lütfen tekrar deneyin.",
  };
}
