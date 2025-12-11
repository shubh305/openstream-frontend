"use server";

import { fetchApi } from "@/lib/api-client";
import { cookies } from "next/headers";
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
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return [];
  }

  try {
    const response = await fetchApi<{ subscriptions: Subscription[] }>("/subscriptions", {
      next: { revalidate: 60 },
    }, token);
    return response.subscriptions;
  } catch (error) {
    console.error("getSubscriptions error:", error);
    return [];
  }
}

export async function toggleSubscription(channelId: string, isSubscribed: boolean) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) return { success: false, error: "Unauthorized" };

    try {
        if (isSubscribed) {
            await fetchApi(`/subscriptions/${channelId}`, { method: "DELETE" }, token);
        } else {
            await fetchApi(`/subscriptions/${channelId}`, { method: "POST" }, token);
        }
        revalidatePath("/subscriptions");
        return { success: true };
    } catch (error) {
        console.error("toggleSubscription error:", error);
        return { success: false, error: "Action failed" };
    }
}
