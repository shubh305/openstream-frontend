"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL, PLACEHOLDER_IMAGES } from "@/lib/constants";

/**
 * Handles user login.
 * Sets a session cookie after valid credentials.
 */
export async function login(formData: FormData | Record<string, unknown>) {
  let username, password;

  if (formData instanceof FormData) {
    username = formData.get("username") as string;
    password = formData.get("password") as string;
  } else {
    const data = formData as Record<string, unknown>;
    username = data?.username as string;
    password = data?.password as string;
  }



  if (!username || !password) {
    console.error("Login validation failed: Missing fields");
    return { error: "Missing fields" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Login API error:", errorData);

      let errorMessage = "Invalid credentials";
      if (errorData.message) {
        if (typeof errorData.message === "string") {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else if (typeof errorData.message === "object") {
          errorMessage = errorData.message.message || JSON.stringify(errorData.message);
        }
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }

      return { error: errorMessage };
    }

    const data = await response.json();
    const token = data.access_token;
    const streamKey = data.streamKey;

    if (!token) {
      console.error("Login failed: No access token received");
      return { error: "Login failed: No token received" };
    }

    // Set Session Cookie
    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    // Set Stream Key Cookie (if present)
    if (streamKey) {
      cookieStore.set("stream_key", streamKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
    }

    // Store username to allow session fallback if /profile endpoint fails
    cookieStore.set("session_username", username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
  } catch (error) {
    console.error("Login action error:", error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/");
}

/**
 * Handles user signup.
 */
export async function signup(formData: FormData | Record<string, unknown>) {
  let username, email, password;

  if (formData instanceof FormData) {
    username = formData.get("username") as string;
    email = formData.get("email") as string;
    password = formData.get("password") as string;
  } else {
    const data = formData as Record<string, unknown>;
    username = data?.username as string;
    email = data?.email as string;
    password = data?.password as string;
  }



  if (!username || !password || !email) {
    console.error("Signup validation failed: Missing fields");
    return { error: "Missing fields" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Signup API failed:", errorData);

      let errorMessage = "Signup failed";
      if (errorData.message) {
        if (typeof errorData.message === "string") {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else if (typeof errorData.message === "object") {
          errorMessage = errorData.message.message || JSON.stringify(errorData.message);
        }
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }

      return { error: errorMessage };
    }
  } catch (error) {
    console.error("Signup action error:", error);
    return { error: "Something went wrong during signup." };
  }

  return await login({ username, password });
}

/**
 * Handles user logout.
 * Destroys the session cookie.
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
  cookieStore.delete("stream_key");
  cookieStore.delete("session_username");
  redirect("/login");
}

/**
 * Refreshes the current access token.
 * Only works if the current token is still valid (not expired).
 */
export async function refreshToken() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("Refresh token failed, session may be expired");
      return null;
    }

    const data = await response.json();
    const newToken = data.access_token;

    if (newToken) {
      // Update cookie with new token
      cookieStore.set("session_token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return newToken;
    }
  } catch (error) {
    console.error("Refresh token error:", error);
  }
  return null;
}

/**
 * Retrieves the current user session server-side.
 * Returns null if no valid session token exists.
 */
export async function getSession() {
  const sessionToken = (await cookies()).get("session_token")?.value;
  if (!sessionToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      cache: "no-store",
    });

    if (response.status === 401) {
      console.log("Token unauthorized, attempting refresh...");
      const newToken = await refreshToken();
      if (newToken) {
        const retryResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
          cache: "no-store",
        });
        if (retryResponse.ok) {
          const user = await retryResponse.json();
          return { user: { ...user, avatarUrl: user.avatar || PLACEHOLDER_IMAGES.AVATAR_DEFAULT } };
        }
      }

      const cookieStore = await cookies();
      cookieStore.delete("session_token");
      cookieStore.delete("stream_key");
      cookieStore.delete("session_username");
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    user.avatarUrl = user.avatar || PLACEHOLDER_IMAGES.AVATAR_DEFAULT;

    return { user };
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}
