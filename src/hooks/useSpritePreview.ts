"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/constants";

interface SpritesResponse {
  videoId: string;
  sprites: {
    status: "PENDING" | "READY" | "FAILED";
    vttUrl?: string | null;
    spriteUrl?: string | null;
  };
}

/**
 * Fetches sprite thumbnail metadata for a video on mount.
 * Returns the VTT URL immediately if sprites are READY, or null otherwise. 
 */
export function useSpritePreview(videoId: string | null) {
  const [vttUrl, setVttUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;

    let cancelled = false;

    const fetchSprites = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/videos/${videoId}/sprites`);
        if (!res.ok) return;

        const data = (await res.json()) as SpritesResponse;

        if (!cancelled && data.sprites?.status === "READY" && data.sprites.vttUrl) {
          setVttUrl(data.sprites.vttUrl);
        }
      } catch {
        // Ignore
      }
    };

    void fetchSprites();

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  return { vttUrl, setVttUrl };
}
