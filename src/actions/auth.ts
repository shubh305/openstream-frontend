"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api-client";
import * as authLib from "@/lib/auth";

export async function refreshToken() {
  return await authLib.refreshToken();
}

export async function getAccessToken() {
  return await authLib.getAccessToken();
}

export async function getSession() {
  return await authLib.getSession();
}

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  streamKey?: string;
}

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
    const data = await fetchApi<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

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

    // Store Refresh Token
    if (data.refresh_token) {
      cookieStore.set("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
    }
  } catch (error) {
    console.error("Login action error:", error);
    return { error: error instanceof Error ? error.message : "Invalid credentials" };
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
    await fetchApi("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username, password, email }),
    });
  } catch (error) {
    console.error("Signup action error:", error);
    return { error: error instanceof Error ? error.message : "Signup failed" };
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
  cookieStore.delete("refresh_token");
  redirect("/login");
}
