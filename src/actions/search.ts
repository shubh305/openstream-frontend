"use server";

import { api } from "@/lib/api";
import { Video, Channel } from "@/types/api";

interface SearchResponse {
  results: {
    videos: Video[];
    channels: Channel[];
  };
  query: string;
  totalResults: number;
}

export async function search(query: string, type: "video" | "channel" | "all" = "all") {
  const queryString = new URLSearchParams({ q: query, limit: "50" });

  try {
    const response = await api.get<SearchResponse>(`/search?${queryString.toString()}`, {
      next: { revalidate: 0 },
    });

    const videos = response?.results?.videos || [];
    const channels = response?.results?.channels || [];

    if (type === "video") return { videos, channels: [] };
    if (type === "channel") return { videos: [], channels };
    return { videos, channels };
  } catch (error) {
    console.error("search error:", error);
    return { videos: [], channels: [] };
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
