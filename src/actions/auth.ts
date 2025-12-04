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

  // Handle both FormData and plain object
  if (formData instanceof FormData) {
    username = formData.get("username") as string;
    password = formData.get("password") as string;
  } else {
    const data = formData as Record<string, unknown>;
    username = data?.username as string;
    password = data?.password as string;
  }

  console.log("Login attempt:", { username });

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
    console.log("Login Response Keys:", Object.keys(data));
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

  console.log("Signup action called. Type:", typeof formData, "Is FormData:", formData instanceof FormData);

  // Handle payload (FormData or Object)
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

  console.log("Signup parsing result:", { username, email, hasPassword: !!password });

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
      // Sending email as well, even if backend implementation might need update to store it
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

  // Auto-login after signup
  // Pass object to login to avoid FormData issues if reused
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
      return null;
    }

    const user = await response.json();

    // Ensure avatar is present, fallback to placeholder if not
    if (!user.avatar) {
      user.avatar = PLACEHOLDER_IMAGES.AVATAR_DEFAULT;
    }

    // Normalize for frontend components (Navbar expects avatarUrl)
    user.avatarUrl = user.avatar;

    return { user };
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}
