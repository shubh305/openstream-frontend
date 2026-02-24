"use server";

import { api } from "@/lib/api";

export interface Clip {
  _id: string;
  clipId: string;
  parentVideoId: string | { _id: string; title: string };
  status: "PENDING" | "READY" | "FAILED";
  duration: number;
  signals: {
    audio: boolean;
    scene: boolean;
    chat: boolean;
    ocr: boolean;
  };
  title?: string;
  score: number;
  start: number;
  end: number;
  viewCount: number;
  createdAt: string;
  playableUrl: string;
  thumbnailResolvedUrl?: string | null;
}

export interface ClipsResponse {
  data: Clip[];
  total: number;
  page: number;
  lastPage: number;
}

export async function getClips(
  params: {
    page?: number;
    limit?: number;
    signal?: string;
    sortBy?: "score" | "createdAt";
    sortOrder?: "asc" | "desc";
  } = {},
) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.append("page", params.page.toString());
  if (params.limit) queryString.append("limit", params.limit.toString());
  if (params.signal) queryString.append("signal", params.signal);
  if (params.sortBy) queryString.append("sortBy", params.sortBy);
  if (params.sortOrder) queryString.append("sortOrder", params.sortOrder);

  try {
    return await api.get<ClipsResponse>(`/clips?${queryString.toString()}`, {
      cache: "no-store",
    });
  } catch (error) {
    console.error("getClips error:", error);
    return { data: [], total: 0, page: 1, lastPage: 1 };
  }
}

export async function getVideoClips(videoId: string) {
  try {
    return await api.get<Clip[]>(`/vod/${videoId}/clips`, {
      cache: "no-store",
    });
  } catch (error) {
    console.error(`getVideoClips(${videoId}) error:`, error);
    return [];
  }
}

export async function getClipById(clipId: string) {
  try {
    return await api.get<Clip>(`/clips/${clipId}`, { cache: "no-store" });
  } catch (error) {
    console.error(`getClipById(${clipId}) error:`, error);
    return null;
  }
}

export async function incrementClipView(clipId: string) {
  try {
    const res = await api.post<{ viewCount: number }>(`/clips/${clipId}/view`, {});
    return res.viewCount;
  } catch (error) {
    console.error(`incrementClipView(${clipId}) error:`, error);
    return null;
  }
}
