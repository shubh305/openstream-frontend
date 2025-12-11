"use server";

import { fetchApi } from "@/lib/api-client";
import { Video } from "@/types/api";

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  videoCount: number;
  thumbnailUrl?: string; 
  videos?: Video[]; 
  createdAt: string;
  updatedAt: string;
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

export async function getPlaylist(id: string) {
  try {
    return await fetchApi<Playlist>(`/playlists/${id}`, {
      next: { revalidate: 60 },
    });
  } catch (error) {
    console.error(`getPlaylist(${id}) error:`, error);
    return null;
  }
}
