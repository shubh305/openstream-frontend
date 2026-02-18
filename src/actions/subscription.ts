"use server";

import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

export interface Subscription {
  id: string;
  channelId: string;
  channelName: string;
  channelHandle: string;
  avatarUrl: string;
  isLive: boolean;
  subscribedAt: string;
  notificationsEnabled: boolean;
}

export async function getSubscriptions() {
  try {
    const response = await api.get<{ subscriptions: Subscription[] }>("/subscriptions", {
      cache: "no-store",
    });
    return response.subscriptions || [];
  } catch (error) {
    console.error("getSubscriptions error:", error);
    return [];
  }
}

export async function toggleSubscription(channelId: string, isSubscribed: boolean) {
  try {
    if (isSubscribed) {
      await api.delete(`/subscriptions/${channelId}`);
    } else {
      await api.post(`/subscriptions/${channelId}`, {});
    }
    revalidatePath("/subscriptions");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("toggleSubscription error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Action failed",
    };
  }
}
