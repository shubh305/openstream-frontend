"use server";

import { fetchApi } from "@/lib/api-client";
import { Channel } from "@/types/api";
import { cookies } from "next/headers";

export async function getChannelByHandle(handle: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  try {
    const cleanHandle = handle.replace("@", "");
    return await fetchApi<Channel>(`/channels/${cleanHandle}`, { next: { revalidate: 60 } }, token);
  } catch (error) {
    console.error(`getChannelByHandle(${handle}) error:`, error);
    return null;
  }
}

export async function getMyChannel() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  try {
    return await fetchApi<Channel>("/channels/me", { next: { revalidate: 60 } }, token);
  } catch (error) {
    console.error("getMyChannel error:", error);
    return null;
  }
}

export async function subscribeToChannel(channelId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  
  if (!token) return { error: "Login required" };

  try {
    await fetchApi(`/subscriptions/${channelId}`, { method: "POST" }, token);
    return { success: true };
  } catch {
    return { error: "Failed to subscribe" };
  }
}

export async function unsubscribeFromChannel(channelId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    
    if (!token) return { error: "Login required" };
  
    try {
      await fetchApi(`/subscriptions/${channelId}`, { method: "DELETE" }, token);
      return { success: true };
    } catch {
      return { error: "Failed to unsubscribe" };
    }
  }
