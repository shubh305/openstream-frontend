"use server";

import { api } from "@/lib/api";
import { Video, Channel, Stream } from "@/types/api";

interface SearchResponse {
  results: {
    videos: (Video & { isSemantic?: boolean; matchedExcerpt?: string; score?: number })[];
    channels: Channel[];
    streams: Stream[];
  };
  query: string;
  totalResults: number;
  isAI?: boolean;
}

export async function search(query: string, type: "video" | "channel" | "stream" | "all" = "all", isAI: boolean = false) {
  const queryString = new URLSearchParams({ q: query, limit: "50" });
  const endpoint = isAI ? "/search/ai" : "/search";

  try {
    const response = await api.get<SearchResponse>(`${endpoint}?${queryString.toString()}`, {
      next: { revalidate: 0 },
    });

    const videos = response?.results?.videos || [];
    const channels = response?.results?.channels || [];
    const streams = response?.results?.streams || [];

    if (type === "video") return { videos, channels: [], streams: [] };
    if (type === "channel") return { videos: [], channels, streams: [] };
    if (type === "stream") return { videos: [], channels: [], streams };
    return { videos, channels, streams };
  } catch (error) {
    console.error("search error:", error);
    return { videos: [], channels: [], streams: [] };
  }
}

export async function getSuggestions(query: string) {
  if (!query.trim()) return [];

  try {
    const response = await api.get<{ suggestions: string[] }>(`/search/suggestions?q=${encodeURIComponent(query)}`, {
      next: { revalidate: 60 },
    });
    return response?.suggestions || [];
  } catch (error) {
    console.error("getSuggestions error:", error);
    return [];
  }
}
