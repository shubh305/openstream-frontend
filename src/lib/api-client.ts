import { API_BASE_URL } from "@/lib/constants";

/**
 * Generic API fetch wrapper that handles auth tokens and base URL.
 * Designed to work both Client-side and Server-side (where cookies need to be passed explicitly if using server actions).
 */
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Attempt to parse error message
    const errorData = await response.json().catch(() => ({}));
    let message = errorData.message || response.statusText;

    if (typeof message === "object") {
      message = JSON.stringify(message);
    }

    throw new Error(`API Error ${response.status}: ${message}`);
  }

  // Handle 204 No Content or empty body
  const contentType = response.headers.get("content-type");
  if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
    return {} as T;
  }

  try {
    return await response.json();
  } catch (e) {
    console.warn("Failed to parse JSON response:", e);
    return {} as T;
  }
}
