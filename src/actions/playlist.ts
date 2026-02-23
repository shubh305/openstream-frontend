"use server";

import { fetchApi } from "@/lib/api-client";
import { Video } from "@/types/api";
import { getAccessToken } from "@/lib/auth";

export async function updatePlaylist(id: string, updates: { title?: string; description?: string; visibility?: string }) {
  try {
    const token = await getAccessToken();
    await fetchApi<Playlist>(
      `/playlists/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      },
      token || undefined,
    );
    return { success: true };
  } catch (error) {
    console.error(`updatePlaylist(${id}) error:`, error);
    return { success: false, error: "Failed to update playlist" };
  }
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  videoCount: number;
  thumbnailUrl?: string;
  videos?: Video[];
  owner?: {
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  includesVideo?: boolean;
}

export async function getChannelPlaylists(channelId: string) {
  try {
    return await fetchApi<Playlist[]>(`/channels/${channelId}/playlists`, {
      next: { revalidate: 60 },
    });
  } catch (error) {
    console.error(`getChannelPlaylists(${channelId}) error:`, error);
    return [];
  }
}

export async function getWatchLater() {
  try {
    const token = await getAccessToken();
    return await fetchApi<Playlist>(
      "/playlists/watch-later",
      {
        cache: "no-store",
      },
      token || undefined,
    );
  } catch (error) {
    console.error("getWatchLater() error:", error);
    return null;
  }
}

export async function createPlaylist(title: string, description?: string, visibility: string = "public") {
  try {
    const token = await getAccessToken();
    return await fetchApi<Playlist>(
      "/playlists",
      {
        method: "POST",
        body: JSON.stringify({ title, description, visibility }),
      },
      token || undefined,
    );
  } catch (error) {
    console.error("createPlaylist() error:", error);
    return null;
  }
}

export async function getPlaylist(id: string) {
  try {
    const token = await getAccessToken();
    return await fetchApi<Playlist>(
      `/playlists/${id}`,
      {
        cache: "no-store",
      },
      token || undefined,
    );
  } catch (error) {
    console.error(`getPlaylist(${id}) error:`, error);
    return null;
  }
}
export async function getUserPlaylists(videoId?: string) {
  try {
    const token = await getAccessToken();
    const url = videoId ? `/playlists?videoId=${videoId}` : "/playlists";
    return await fetchApi<Playlist[]>(
      url,
      {
        cache: "no-store",
      },
      token || undefined,
    );
  } catch (error) {
    console.error("getUserPlaylists() error:", error);
    return [];
  }
}

export async function addToWatchLater(videoId: string) {
  try {
    const token = await getAccessToken();
    await fetchApi(
      `/playlists/watch-later/${videoId}`,
      {
        method: "POST",
      },
      token || undefined,
    );
    return { success: true };
  } catch (error) {
    console.error(`addToWatchLater(${videoId}) error:`, error);
    return { success: false, error: "Failed to add to Watch Later" };
  }
}

export async function removeFromWatchLater(videoId: string) {
  try {
    const token = await getAccessToken();
    await fetchApi(
      `/playlists/watch-later/${videoId}`,
      {
        method: "DELETE",
      },
      token || undefined,
    );
    return { success: true };
  } catch (error) {
    console.error(`removeFromWatchLater(${videoId}) error:`, error);
    return { success: false, error: "Failed to remove from Watch Later" };
  }
}

export async function addToPlaylist(playlistId: string, videoId: string) {
  try {
    const token = await getAccessToken();
    await fetchApi(
      `/playlists/${playlistId}/videos`,
      {
        method: "POST",
        body: JSON.stringify({ videoId }),
      },
      token || undefined,
    );
    return { success: true };
  } catch (error) {
    console.error(`addToPlaylist(${playlistId}, ${videoId}) error:`, error);
    return { success: false, error: "Failed to add to playlist" };
  }
}

export async function deletePlaylist(id: string) {
  try {
    const token = await getAccessToken();
    await fetchApi(
      `/playlists/${id}`,
      {
        method: "DELETE",
      },
      token || undefined,
    );
    return { success: true };
  } catch (error) {
    console.error(`deletePlaylist(${id}) error:`, error);
    return { success: false, error: "Failed to delete playlist" };
  }
}

export async function removeFromPlaylist(playlistId: string, videoId: string) {
  try {
    const token = await getAccessToken();
    await fetchApi(
      `/playlists/${playlistId}/videos/${videoId}`,
      {
        method: "DELETE",
      },
      token || undefined,
    );
    return { success: true };
  } catch (error) {
    console.error(`removeFromPlaylist(${playlistId}, ${videoId}) error:`, error);
    return { success: false, error: "Failed to remove from playlist" };
  }
}
