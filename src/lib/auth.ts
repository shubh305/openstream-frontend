import { cookies } from "next/headers";
import { API_BASE_URL, PLACEHOLDER_IMAGES } from "@/lib/constants";
import { cache } from "react";

/**
 * Utility to fetch with a timeout.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Global promise to handle concurrent refresh requests.
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Request-local storage for the token refreshed during the current request.
 */
const getRequestRefreshCache = cache(() => ({ token: null as string | null }));

/**
 * Refreshes the current access token using the long-lived refresh token.
 */
export async function refreshToken(): Promise<string | null> {
  const requestCache = getRequestRefreshCache();

  if (requestCache.token) {
    return requestCache.token;
  }

  if (refreshPromise) {
    console.log("[Auth] Refresh already in progress, waiting...");
    const sharedToken = await refreshPromise;
    if (sharedToken) requestCache.token = sharedToken;
    return sharedToken;
  }

  refreshPromise = (async () => {
    try {
      const cookieStore = await cookies();
      const refreshTokenValue = cookieStore.get("refresh_token")?.value;

      if (!refreshTokenValue) return null;

      console.log("[Auth] Starting token refresh operation...");
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshTokenValue }),
          cache: "no-store",
        },
        10000,
      );

      if (!response.ok) {
        console.warn("[Auth] Refresh token failed, session expired");
        try {
          const cookieStore = await cookies();
          cookieStore.delete("session_token");
          cookieStore.delete("stream_key");
          cookieStore.delete("session_username");
          cookieStore.delete("refresh_token");
        } catch {
          // Ignore error
        }
        return null;
      }

      const data = await response.json();
      const newToken = data.access_token;
      const newRefreshToken = data.refresh_token;

      if (newToken) {
        // Cache locally for the current request context
        requestCache.token = newToken;

        try {
          const cookieStore = await cookies();
          cookieStore.set("session_token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          });

          if (newRefreshToken) {
            cookieStore.set("refresh_token", newRefreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              maxAge: 60 * 60 * 24 * 7,
              path: "/",
            });
          }
          console.log("[Auth] Token refresh successful.");
        } catch (e) {
          console.warn("[Auth] Could not update session cookie in current phase, using request-local cache." + e);
        }
        return newToken;
      }
      return null;
    } catch (error) {
      console.error("[Auth] Refresh token error:", error);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Retrieves the current access token.
 */
export const getAccessToken = cache(async () => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (sessionToken) {
     return sessionToken;
  }

  // If no session token, try refresh
  const newToken = await refreshToken();
  if (newToken) {
    console.log("[Auth] Access token missing/expired. Refreshed successfully.");
  }
  return newToken;
});

/**
 * Retrieves the current user session server-side.
 */
export const getSession = cache(async () => {
  const sessionToken = (await cookies()).get("session_token")?.value;
  if (!sessionToken) return null;

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        cache: "no-store",
      },
      4000,
    );

    if (response.status === 401) {
      console.log("Token unauthorized, attempting refresh...");
      const newToken = await refreshToken();

      if (newToken) {
        const retryResponse = await fetchWithTimeout(
          `${API_BASE_URL}/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
            cache: "no-store",
          },
          3000,
        );
        if (retryResponse.ok) {
          const user = await retryResponse.json();
          return {
            user: { ...user, avatarUrl: user.avatar || PLACEHOLDER_IMAGES.AVATAR_DEFAULT },
            accessToken: newToken,
          };
        }
      }

      console.log("Refresh failed or token invalid. Logging out.");
      try {
        const cookieStore = await cookies();
        cookieStore.delete("session_token");
        cookieStore.delete("stream_key");
        cookieStore.delete("session_username");
        cookieStore.delete("refresh_token");
      } catch {
      }
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    user.avatarUrl = user.avatar || PLACEHOLDER_IMAGES.AVATAR_DEFAULT;

    return { user, accessToken: sessionToken };
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
});
