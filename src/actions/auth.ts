"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MOCK_USER } from "@/lib/mock-data";

/**
 * MOCK AUTHENTICATION MODULE
 * 
 * In a real production application, this file would interface with 
 * an external Identity Provider (e.g., Auth0, Clerk, Firebase) or 
 * a custom backend API.
 * 
 * For this demo, we use HTTP-only cookies to simulate session management.
 */

// Mock Delay Helper to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Handles user login.
 * Sets a session cookie after valid mock credentials.
 */
export async function login(formData: FormData) {
  // Simulate network delay
  await delay(1000);

  const email = formData.get("email");
  const password = formData.get("password");

  // Basic Validation
  if (!email || !password) {
      return { error: "Missing fields" };
  }

  // Set Session Cookie
  // In a real app, this would be a JWT or Session ID from the backend
  (await cookies()).set("session_token", "mock_session_token_12345", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  redirect("/");
}

/**
 * Handles user logout.
 * Destroys the session cookie.
 */
export async function logout() {
  (await cookies()).delete("session_token");
  redirect("/login");
}

/**
 * Retrieves the current user session server-side.
 * Returns null if no valid session token exists.
 */
export async function getSession() {
  const sessionToken = (await cookies()).get("session_token")?.value;
  if (!sessionToken) return null;

  // Return consistent Mock User Data
  return {
    user: MOCK_USER,
  };
}
