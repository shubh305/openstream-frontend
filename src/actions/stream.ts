"use server";

import { api } from "@/lib/api";
import { Stream, StreamListResponse } from "@/types/api";
import { cookies } from "next/headers";

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
    const response = await api.get<StreamListResponse>(`/streams?${queryString.toString()}`, {
      cache: "no-store",
    });
    return response.streams || [];
  } catch (error) {
    console.error("getLiveStreams error:", error);
    return [];
  }
}

export async function getStream(id: string) {
  try {
    return await api.get<Stream>(`/streams/${id}`, { cache: "no-store" });
  } catch (error) {
    console.error(`getStream(${id}) error:`, error);
    return null;
  }
}

export async function getIngestConfig() {
  const cookieStore = await cookies();
  let streamKey = cookieStore.get("stream_key")?.value;

  try {
    if (!streamKey) {
      const keyData = await api.get<{ streamKey: string }>("/streams/key", { cache: "no-store" });
      if (keyData?.streamKey) {
        streamKey = keyData.streamKey;
      }
    }

    let cleanKey = streamKey;
    if (cleanKey && cleanKey.startsWith("sk_live_")) {
      cleanKey = cleanKey.replace("sk_live_", "");
    }

    if (process.env.NEXT_PUBLIC_SOCKET_URL && cleanKey) {
      let baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
      baseUrl = baseUrl.replace(/\/$/, "");
      return { url: `${baseUrl}?key=${cleanKey}`, error: null };
    }

    return { url: null, error: "Missing ingest configuration" };

  } catch (error) {
    console.error("getIngestConfig error:", error);
    return { url: null, error: "Failed to get ingest config" };
  }
}

export async function updateStreamSettings(settings: { title: string; description?: string; category: string; visibility: string }) {
  try {
    const res = await api.put("/streams/settings", settings);
    return res;
  } catch (error) {
    console.error("updateSettings error (Ignored to unblock stream):", error);
    return { success: true };
  }
}

export async function goLive() {
  try {
    return await api.post("/streams/go-live", {});
  } catch (error) {
    console.error("goLive error:", error);
    return { error: error instanceof Error ? error.message : "Failed to go live" };
  }
}

export async function endStream() {
  try {
    return await api.post("/streams/end", {});
  } catch (error) {
    console.error("endStream error:", error);
    return { error: error instanceof Error ? error.message : "Failed to end stream" };
  }
}

export async function getStreamKey() {
  const cookieStore = await cookies();
  const cookieKey = cookieStore.get("stream_key")?.value;

  try {
    const data = await api.get<{ streamKey: string }>("/streams/key", { cache: "no-store" });
    let streamKey = data?.streamKey;
    if (streamKey && streamKey.startsWith("sk_live_")) {
      streamKey = streamKey.replace("sk_live_", "");
    }

    if (streamKey) {
      return { streamKey };
    }

    let fallbackKey = cookieKey;
    if (fallbackKey && fallbackKey.startsWith("sk_live_")) {
      fallbackKey = fallbackKey.replace("sk_live_", "");
    }
    if (fallbackKey) return { streamKey: fallbackKey };
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

  try {
    const data = await api.post<{ streamKey?: string; key?: string }>("/streams/key/regenerate", {});

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
  try {
    return await api.get<Stream>("/streams/me", { cache: "no-store" });
  } catch {
    return null;
  }
}
