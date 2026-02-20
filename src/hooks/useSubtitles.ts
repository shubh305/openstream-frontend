"use client";

import { useState, useEffect, useCallback } from "react";
import { getSubtitles, type SubtitlesResponse, type SubtitleTrack } from "@/actions/video";

/**
 * Hook for fetching subtitle tracks for a video.
 * Polls for updates while status is processing.
 */
export function useSubtitles(videoId: string | null) {
  const [data, setData] = useState<SubtitlesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSubtitles = useCallback(async () => {
    if (!videoId) return;
    setLoading(true);
    try {
      const result = await getSubtitles(videoId);
      setData(result);
    } catch (error) {
      console.error("useSubtitles error:", error);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchSubtitles();

    const interval = setInterval(() => {
      if (data?.status === "processing" || data?.status === "transcribed" || data?.status === "translating") {
        fetchSubtitles();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchSubtitles, data?.status]);

  return { subtitles: data, loading, refetch: fetchSubtitles };
}

export type { SubtitleTrack, SubtitlesResponse };
