"use server";

import { api } from "@/lib/api";
import { Comment } from "@/types/api";
import { revalidatePath } from "next/cache";

export async function getComments(videoId: string, params: { page?: number; limit?: number } = {}) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.append("page", params.page.toString());
  if (params.limit) queryString.append("limit", params.limit.toString());

  try {
    const response = await api.get<{
      comments: { id: string; text: string; timestamp: string; likes?: number; replyCount?: number; userLiked?: boolean; user: string; avatarUrl: string }[];
    }>(`/comments/video/${videoId}?${queryString.toString()}`, {
      next: { revalidate: 30 },
    });

    const comments: Comment[] = (response.comments || []).map(c => ({
      id: c.id,
      text: c.text,
      timestamp: c.timestamp,
      likes: c.likes || 0,
      replyCount: c.replyCount || 0,
      isLiked: c.userLiked || false,
      author: {
        username: c.user,
        avatarUrl: c.avatarUrl,
      },
    }));

    return comments;
  } catch (error) {
    console.error(`getComments(${videoId}) error:`, error);
    return [];
  }
}

export async function postComment(videoId: string, text: string) {
  try {
    await api.post(`/comments/video/${videoId}`, { text });
    revalidatePath(`/watch/${videoId}`);
    return { success: true };
  } catch (error) {
    console.error("postComment error:", error);
    return { error: error instanceof Error ? error.message : "Failed to post comment." };
  }
}
