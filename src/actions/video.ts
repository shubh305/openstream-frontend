"use server";

import { fetchApi } from "@/lib/api-client";
import { Video, VideoListResponse } from "@/types/api";
import { cookies } from "next/headers";

export async function getVideos(params: {
  page?: number;
  limit?: number;
  sort?: "latest" | "popular" | "oldest";
  category?: string;
  channelId?: string;
} = {}) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.append("page", params.page.toString());
  if (params.limit) queryString.append("limit", params.limit.toString());
  if (params.sort) queryString.append("sort", params.sort);
  if (params.category) queryString.append("category", params.category);
  if (params.channelId) queryString.append("channelId", params.channelId);

  try {
    return await fetchApi<VideoListResponse>(`/videos?${queryString.toString()}`, {
      next: { revalidate: 60 }, 
    });
  } catch (error) {
    console.error("getVideos error:", error);
    return { videos: [], pagination: { page: 1, limit: 12, total: 0, hasMore: false } };
  }
}

export async function getTrendingVideos(limit = 12) {
  try {
    return await fetchApi<Video[]>(`/videos/trending?limit=${limit}`, {
      next: { revalidate: 60 },
    });
  } catch (error) {
    console.error("getTrendingVideos error:", error);
    return [];
  }
}

export async function getVideo(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  try {
    return await fetchApi<Video>(`/videos/${id}`, { cache: "no-store" }, token);
  } catch (error) {
    console.error(`getVideo(${id}) error:`, error);
    return null;
  }
}

export async function getRelatedVideos(id: string, limit = 10) {
    try {
        return await fetchApi<Video[]>(`/videos/${id}/recommendations?limit=${limit}`, {
             next: { revalidate: 300 } 
        });
    } catch (error) {
        console.error(`getRelatedVideos(${id}) error:`, error);
        return [];
    }
}

export async function incrementView(id: string) {
  try {
    await fetchApi(`/videos/${id}/view`, { method: "POST" });
  } catch (error) {
    console.error(`incrementView(${id}) error:`, error);
  }
}
