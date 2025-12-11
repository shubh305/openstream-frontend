"use server";

import { fetchApi } from "@/lib/api-client";
import { Comment } from "@/types/api";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getComments(videoId: string, params: { page?: number; limit?: number } = {}) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.append("page", params.page.toString());
  if (params.limit) queryString.append("limit", params.limit.toString());

  try {
    const response = await fetchApi<{ comments: { id: string; text: string; timestamp: string; likes?: number; replyCount?: number; userLiked?: boolean; user: string; avatarUrl: string }[] }>(`/comments/video/${videoId}?${queryString.toString()}`, {
      next: { revalidate: 30 },
    });
    
    const comments: Comment[] = (response.comments || []).map((c: { id: string; text: string; timestamp: string; likes?: number; replyCount?: number; userLiked?: boolean; user: string; avatarUrl: string }) => ({
        id: c.id,
        text: c.text,
        timestamp: c.timestamp,
        likes: c.likes || 0,
        replyCount: c.replyCount || 0,
        isLiked: c.userLiked || false, 
        author: {
            username: c.user, 
            avatarUrl: c.avatarUrl
        }
    }));

    return comments;
  } catch (error) {
    console.error(`getComments(${videoId}) error:`, error);
    return [];
  }
}

export async function postComment(videoId: string, text: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return { error: "You must be logged in to comment." };
  }

  try {
    await fetchApi(`/comments/video/${videoId}`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }, token);

    revalidatePath(`/watch/${videoId}`);
    return { success: true };
  } catch (error) {
    console.error("postComment error:", error);
    return { error: "Failed to post comment." };
  }
}
