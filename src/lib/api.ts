import { fetchApi } from "./api-client";
import { getAccessToken, refreshToken } from "./auth";

/**
 * Unified API client that handles authentication and token refresh automatically.
 * Only intended for use in Server Components and Server Actions.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = options.method || 'GET';
  
  const isAuthRoute = endpoint.includes("/auth/");
  
  const token = await getAccessToken();

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[API Request] ${method} ${endpoint}`);
  }

  const start = Date.now();
  try {
    const result = await fetchApi<T>(endpoint, options, token || undefined);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`[API Error] ${method} ${endpoint} (${duration}ms): ${errorMessage}`);

    if (!isAuthRoute && (errorMessage.includes("Status 401") || errorMessage.includes("Unauthorized"))) {
      console.log(`[API Refresh] ${endpoint} failed with 401. Attempting token refresh...`);
      const newToken = await refreshToken();
      
      if (newToken) {
        console.log(`[API Retry] Retrying ${method} ${endpoint} with new token...`);
        try {
          const retryResult = await fetchApi<T>(endpoint, options, newToken);
          console.log(`[API Success] ${method} ${endpoint} succeeded after retry.`);
          return retryResult;
        } catch (retryError) {
          console.error(`[API Fail] ${method} ${endpoint} failed again after retry.`);
          throw retryError;
        }
      }
    }
    
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
};
