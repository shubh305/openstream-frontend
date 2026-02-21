"use client";

import { useState, useEffect, useCallback } from "react";
import { getHighlights, type HighlightsResponse, type HighlightClip } from "@/actions/video";

/**
 * Hook for fetching highlight clips for a video.
 * Polls for updates while status is processing.
 */
export function useHighlights(videoId: string | null) {
  const [data, setData] = useState<HighlightsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHighlights = useCallback(async () => {
    if (!videoId) return;
    setLoading(true);
    try {
      const result = await getHighlights(videoId);
      setData(result);
    } catch (error) {
      console.error("useHighlights error:", error);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchHighlights();

    const interval = setInterval(() => {
      if (data?.status === "processing" || data?.status === "queued") {
        fetchHighlights();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchHighlights, data?.status]);

  return { highlights: data, loading, refetch: fetchHighlights };
}

export type { HighlightClip, HighlightsResponse };
