"use server";

import { fetchApi } from "@/lib/api-client";
import { cookies } from "next/headers";

export interface AnalyticsOverview {
  overview: {
    views: string | number;
    watchTimeHours: string | number;
    subscribers: number;
    subscriberChange: number;
    avgViewDuration: string | number;
    estimatedRevenue?: string | null;
  };
  trend: { bucket: string; views: number | string }[];
  trends: {
    views: number;
    watchTime: number;
    subscribers: number;
  };
  period: string;
}

export interface RealtimeStats {
  currentViewers: number;
  views48Hours: { hour: string; views: number }[];
}

export interface TopContentParams {
  period?: "today" | "last7days" | "last28days" | "lifetime";
}

export async function getChannelAnalytics(period: string = "last28days") {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value || "mock-token-fallback";

  if (!token) return null;

  try {
    const data = await fetchApi<AnalyticsOverview>(`/analytics/channel?period=${period}`, {
      next: { revalidate: 60 }
    }, token);
    return data;
  } catch (error) {
    console.error("getChannelAnalytics error:", error);
    return null;
  }
}

export async function getRealtimeStats() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value || "mock-token-fallback";

  if (!token) return null;

  try {
    const data = await fetchApi<RealtimeStats>(`/analytics/channel/realtime`, {
      cache: "no-store" 
    }, token);
    return data;
  } catch (error) {
    console.error("getRealtimeStats error:", error);
    return null;
  }
}

export interface TopContentResponse {
  videos: { id: string; title: string; views: number; thumbnailUrl?: string; avgViewDuration?: string }[];
  period: string;
}

export async function getTopContent(period: string = "last28days") {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value || "mock-token-fallback";

  if (!token) return { videos: [], period };

  try {
    const data = await fetchApi<TopContentResponse>(`/analytics/top-content?period=${period}`, {
      next: { revalidate: 60 }
    }, token);
    return data;
  } catch (error) {
    console.error("getTopContent error:", error);
    return { videos: [], period };
  }
}

export interface EngagementAnalytics {
  trend: { bucket: string; comments: number; likes: number; shares: number }[];
  topSearches: { query: string; count: number }[];
  period: string;
}

export async function getEngagementAnalytics(period: string = "last28days") {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value || "mock-token-fallback";

  if (!token) return { trend: [], topSearches: [], period };

  try {
    const data = await fetchApi<EngagementAnalytics>(
      `/analytics/engagement?period=${period}`,
      {
        next: { revalidate: 60 },
      },
      token,
    );
    return data;
  } catch (error) {
    console.error("getEngagementAnalytics error:", error);
    return { trend: [], topSearches: [], period };
  }
}
