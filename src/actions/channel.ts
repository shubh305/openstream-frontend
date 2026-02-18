"use server";

import { api } from "@/lib/api";
import { Channel } from "@/types/api";
import { revalidatePath } from "next/cache";

export async function getChannelByHandle(handle: string) {
  try {
    const cleanHandle = handle.replace("@", "");
    return await api.get<Channel>(`/channels/${cleanHandle}`, { cache: "no-store" });
  } catch (error) {
    console.error(`getChannelByHandle(${handle}) error:`, error);
    return null;
  }
}

export async function getMyChannel() {
  try {
    return await api.get<Channel>("/channels/me", { next: { revalidate: 60 } });
  } catch (error) {
    console.error("getMyChannel error:", error);
    return null;
  }
}

export async function subscribeToChannel(channelId: string) {
  try {
    await api.post(`/subscriptions/${channelId}`, {});
    return { success: true };
  } catch (error) {
    console.error("subscribeToChannel error:", error);
    return { error: error instanceof Error ? error.message : "Failed to subscribe" };
  }
}

export async function unsubscribeFromChannel(channelId: string) {
  try {
    await api.delete(`/subscriptions/${channelId}`);
    return { success: true };
  } catch (error) {
    console.error("unsubscribeFromChannel error:", error);
    return { error: error instanceof Error ? error.message : "Failed to unsubscribe" };
  }
}

export async function updateChannel(data: { name?: string; handle?: string; description?: string }) {
  try {
    await api.put("/channels/me", data);

    revalidatePath("/studio/customization");
    revalidatePath("/channels/me");
    return { success: true };
  } catch (error) {
    console.error("updateChannel error:", error);
    return { error: error instanceof Error ? error.message : "Failed to update channel" };
  }
}
