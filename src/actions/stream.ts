"use server";

import { cookies } from "next/headers";
import { SOCKET_URL } from "@/lib/constants";

/**
 * Fetches the Ingest Configuration (WebSocket URL) for the current user.
 * This is used to connect the 'BroadcastConsole' to the backend streaming server.
 */
export async function getIngestConfig() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    const streamKey = cookieStore.get("stream_key")?.value;

    console.log("Stream Config Check:", {
      hasSession: !!sessionToken,
      hasKey: !!streamKey,
    });

    if (!sessionToken || !streamKey) {
      return { error: "Missing stream credentials. Please log in again." };
    }

    const url = `${SOCKET_URL}?key=${streamKey}`;

    return {
      url,
      protocol: "webm",
    };
  } catch (error: unknown) {
    console.error("Error fetching ingest config:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { error: errorMessage || "An unknown error occurred while fetching ingest configuration." };
  }
}
