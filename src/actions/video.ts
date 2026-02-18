"use server";

import { api } from "@/lib/api";
import { Video, VideoListResponse } from "@/types/api";

export interface UpdateVideoData {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  visibility?: "public" | "private" | "unlisted";
  category?: string;
}

export async function getVideos(
  params: {
    page?: number;
    limit?: number;
    sort?: "latest" | "popular" | "oldest";
    category?: string;
    channelId?: string;
    isLive?: boolean;
  } = {},
) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.append("page", params.page.toString());
  if (params.limit) queryString.append("limit", params.limit.toString());
  if (params.sort) queryString.append("sort", params.sort);
  if (params.category) queryString.append("category", params.category);
  if (params.channelId) queryString.append("channelId", params.channelId);
  if (params.isLive !== undefined) queryString.append("isLive", params.isLive.toString());

  try {
    return await api.get<VideoListResponse>(`/videos?${queryString.toString()}`, {
      cache: "no-store",
    });
  } catch (error) {
    console.error("getVideos error:", error);
    return { videos: [], pagination: { page: 1, limit: 12, total: 0, hasMore: false } };
  }
}

export async function getTrendingVideos(limit = 12) {
  try {
    return await api.get<Video[]>(`/videos/trending?limit=${limit}`, {
      next: { revalidate: 60 },
    });
  } catch (error) {
    console.error("getTrendingVideos error:", error);
    return [];
  }
}

export async function getVideo(id: string) {
  try {
    return await api.get<Video>(`/videos/${id}`, { cache: "no-store" });
  } catch (error) {
    console.error(`getVideo(${id}) error:`, error);
    return null;
  }
}

export async function getRelatedVideos(id: string, limit = 10) {
  try {
    return await api.get<Video[]>(`/videos/${id}/recommendations?limit=${limit}`, {
      cache: "no-store",
    });
  } catch (error) {
    console.error(`getRelatedVideos(${id}) error:`, error);
    return [];
  }
}

export async function incrementView(id: string) {
  try {
    await api.post(`/videos/${id}/view`, {});
  } catch (error) {
    console.error(`incrementView(${id}) error:`, error);
  }
}

export async function updateVideo(id: string, data: UpdateVideoData) {
  try {
    const result = await api.put<Video>(`/videos/${id}`, data);
    return result;
  } catch (error) {
    console.error(`updateVideo(${id}) error:`, error);
    throw error;
  }
}

export async function deleteVideo(id: string) {
  try {
    await api.delete(`/videos/${id}`);
    return true;
  } catch (error) {
    console.error(`deleteVideo(${id}) error:`, error);
    return false;
  }
}

export async function likeVideo(id: string) {
  try {
    await api.post(`/videos/${id}/like`, {});
    return true;
  } catch (error) {
    console.error(`likeVideo(${id}) error:`, error);
    return false;
  }
}

export async function unlikeVideo(id: string) {
  try {
    await api.delete(`/videos/${id}/like`);
    return true;
  } catch (error) {
    console.error(`unlikeVideo(${id}) error:`, error);
    return false;
  }
}

export async function dislikeVideo(id: string) {
  try {
    await api.post(`/videos/${id}/dislike`, {});
    return true;
  } catch (error) {
    console.error(`dislikeVideo(${id}) error:`, error);
    return false;
  }
}
