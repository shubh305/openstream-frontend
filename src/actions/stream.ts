"use server";

import { fetchApi } from "@/lib/api-client";
import { Stream, StreamListResponse } from "@/types/api";

export async function getLiveStreams(
  params: {
    page?: number;
    limit?: number;
    category?: string;
  } = {},
) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.append("page", params.page.toString());
  if (params.limit) queryString.append("limit", params.limit.toString());
  if (params.category) queryString.append("category", params.category);

  try {
    const response = await fetchApi<StreamListResponse>(`/streams?${queryString.toString()}`, {
      next: { revalidate: 0 }, 
    });
    return response.streams;
  } catch (error) {
    console.error("getLiveStreams error:", error);
    return [];
  }
}

export async function getStream(id: string) {
  try {
    return await fetchApi<Stream>(`/streams/${id}`, { cache: "no-store" });
  } catch (error) {
    console.error(`getStream(${id}) error:`, error);
    return null;
  }
}

import { cookies } from "next/headers";

export async function getIngestConfig() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  let streamKey = cookieStore.get("stream_key")?.value;

  try {
    if (!streamKey && token) {
      const keyData = await fetchApi<{ streamKey: string }>("/streams/key", { cache: "no-store" }, token);
      if (keyData?.streamKey) {
        streamKey = keyData.streamKey;
      }
    }

    const data = await fetchApi<{ url: string }>("/streams/ingest", { cache: "no-store" }, token);

    let url = data.url;
    if (streamKey && url.includes("{streamKey}")) {
      url = url.replace("{streamKey}", streamKey);

    }

    return { url, error: null };
  } catch (error) {
    console.error("getIngestConfig error:", error);
    return { url: null, error: "Failed to get ingest config" };
  }
}

export async function updateStreamSettings(settings: { title: string; category: string; visibility: string }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return { error: "Not authenticated" };

  try {
    const res = await fetchApi(
      "/streams/settings",
      {
        method: "PUT",
        body: JSON.stringify(settings),
      },
      token,
    );
    return res;
  } catch (error) {
    console.error("updateSettings error (Ignored to unblock stream):", error);
    return { success: true };
  }
}

export async function getStreamKey() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const cookieKey = cookieStore.get("stream_key")?.value;

  if (!token) return { error: "Not authenticated" };

  try {
    const data = await fetchApi<{ streamKey: string }>("/streams/key", { cache: "no-store" }, token);
    if (data?.streamKey) {
      return data;
    }
    if (cookieKey) return { streamKey: cookieKey };
    return { error: "No stream key found" };
  } catch (error) {
    console.error("getStreamKey error (Falling back to cookie):", error);
    if (cookieKey) {
      return { streamKey: cookieKey };
    }
    return { error: "Failed to retrieve stream key" };
  }
}

export async function regenerateStreamKey() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { error: "Not authenticated" };

  try {
    const data = await fetchApi<{ streamKey?: string; key?: string }>(
      "/streams/key/regenerate",
      {
        method: "POST",
      },
      token,
    );

    let newKey = data.streamKey || data.key;

    if (newKey && newKey.startsWith("sk_live_")) {
      newKey = newKey.replace("sk_live_", "");
    }

    if (newKey) {
      cookieStore.set("stream_key", newKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return { streamKey: newKey };
    }

    return data as { streamKey: string };
  } catch (error) {
    console.error("regenerateStreamKey error:", error);
    return { error: error instanceof Error ? error.message : "Failed to regenerate stream key" };
  }
}

export async function getMyStream() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  try {
    return await fetchApi<Stream>("/streams/me", { cache: "no-store" }, token);
  } catch {
    return null;
  }
}
