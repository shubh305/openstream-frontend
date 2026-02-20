"use client";

import { useEffect, useState } from "react";

interface VttCue {
  start: number;
  end: number;
  spriteUrl: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SeekbarThumbnailProps {
  vttUrl: string;
  hoverTime: number;
  hoverX: number;
  seekbarWidth: number;
}

const THUMB_W = 160;
const THUMB_H = 90;

function parseTime(vttTime: string): number {
  const parts = vttTime.split(":");
  if (parts.length === 3) {
    return (
      parseInt(parts[0], 10) * 3600 +
      parseInt(parts[1], 10) * 60 +
      parseFloat(parts[2])
    );
  }
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(parts[0]);
}

function parseXywh(fragment: string): { x: number; y: number; w: number; h: number } | null {
  const match = fragment.match(/xywh=(\d+),(\d+),(\d+),(\d+)/);
  if (!match) return null;
  return {
    x: parseInt(match[1], 10),
    y: parseInt(match[2], 10),
    w: parseInt(match[3], 10),
    h: parseInt(match[4], 10),
  };
}

function parseVtt(text: string, baseUrl: string): VttCue[] {
  const cues: VttCue[] = [];
  const blocks = text.trim().split(/\r?\n\r?\n/);

  for (const block of blocks) {
    const lines = block.trim().split(/\r?\n/);
    const timeLine = lines.find((l) => l.includes("-->"));
    if (!timeLine) continue;

    const urlLine = lines.find((l) => l.includes("#xywh="));
    if (!urlLine) continue;

    const [startStr, endStr] = timeLine.split("-->").map((s) => s.trim());
    const hashIdx = urlLine.lastIndexOf("#");
    const rawSpriteUrl = urlLine.substring(0, hashIdx).trim();
    const fragment = urlLine.substring(hashIdx + 1).trim();
    const rect = parseXywh(fragment);
    if (!rect) continue;

    // Resolve relative URL against VTT base
    let spriteUrl = rawSpriteUrl;
    try {
      if (!rawSpriteUrl.startsWith("http")) {
        spriteUrl = new URL(rawSpriteUrl, baseUrl).href;
      } else if (
        rawSpriteUrl.startsWith("https://storage.octanebrew.dev/vod/") &&
        !rawSpriteUrl.includes("openstream-uploads")
      ) {
        spriteUrl = rawSpriteUrl.replace(
          "storage.octanebrew.dev/vod/",
          "storage.octanebrew.dev/openstream-uploads/vod/"
        );
      }
    } catch (e) {
      console.warn("[SeekbarThumbnail] Failed to resolve sprite URL:", rawSpriteUrl, e);
    }

    cues.push({
      start: parseTime(startStr),
      end: parseTime(endStr),
      spriteUrl,
      ...rect,
    });
  }

  console.log(`[SeekbarThumbnail] Successfully parsed ${cues.length} cues`);
  return cues;
}

/**
 * Renders a 160×90 sprite thumbnail above the seekbar cursor using CSS
 */
export function SeekbarThumbnail({ vttUrl, hoverTime, hoverX, seekbarWidth }: SeekbarThumbnailProps) {
  const [cues, setCues] = useState<VttCue[]>([]);

  // Fetch and parse VTT once
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(vttUrl);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const text = await res.text();
        if (!cancelled) {
          const parsed = parseVtt(text, vttUrl);
          console.log(`[SeekbarThumbnail] Loaded ${parsed.length} cues from ${vttUrl}`);
          setCues(parsed);
        }
      } catch (err) {
        console.error("[SeekbarThumbnail] Failed to load VTT:", err, "URL:", vttUrl);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [vttUrl]);

  if (cues.length === 0) return null;

  const cue = cues.find((c) => hoverTime >= c.start && hoverTime < c.end);
  if (!cue) return null;

  // Clamp horizontal position so preview stays within the seekbar bounds
  const halfW = THUMB_W / 2;
  const clampedLeft = Math.max(0, Math.min(hoverX - halfW, seekbarWidth - THUMB_W));

  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 12px)",
        left: clampedLeft,
        width: THUMB_W,
        pointerEvents: "none",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
      }}
      aria-hidden="true"
    >
      {/* Thumbnail Image Container */}
      <div
        style={{
          width: THUMB_W,
          height: THUMB_H,
          backgroundImage: `url(${cue.spriteUrl})`,
          backgroundPosition: `-${cue.x}px -${cue.y}px`,
          backgroundSize: "auto",
          backgroundRepeat: "no-repeat",
          borderRadius: 8,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          border: "2px solid rgba(255,255,255,0.8)",
          backgroundColor: "#000",
          overflow: "hidden",
        }}
      />
      
      {/* Time Label */}
      <div 
        className="bg-black/90 px-2 py-0.5 rounded text-[11px] text-white font-bold shadow-lg"
      >
        {Math.floor(hoverTime / 60)}:
        {Math.floor(hoverTime % 60)
          .toString()
          .padStart(2, "0")}
      </div>
    </div>
  );
}
