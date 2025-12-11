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
      if (typeof errorData.message === "string") {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      } else if (typeof errorData.message === "object") {
        errorMessage = JSON.stringify(errorData.message);
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
      if (typeof errorData.message === "string") {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      } else if (typeof errorData.message === "object") {
        errorMessage = JSON.stringify(errorData.message);
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
    });

    if (!response.ok) {
      console.error(`getSession failed: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error("getSession response body:", text);
      return null;
    }

    const user = await response.json();

    if (!user.avatar) {
      user.avatar = PLACEHOLDER_IMAGES.AVATAR_DEFAULT;
    }
    user.avatarUrl = user.avatar;

    return { user };
  } catch (error) {
    console.error("Get session error:", error);

    const cookieStore = await cookies();
    const fallbackUsername = cookieStore.get("session_username")?.value;

    if (fallbackUsername) {
      console.warn("Using fallback session from cookies due to API error");
      return {
        user: {
          username: fallbackUsername,
          email: `${fallbackUsername}@example.com`,
          avatarUrl: PLACEHOLDER_IMAGES.AVATAR_DEFAULT,
          id: "fallback-id",
        },
      };
    }

    return null;
  }
}
