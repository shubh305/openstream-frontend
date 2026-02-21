"use client";

import Link from "next/link";
import { PlayCircle } from "lucide-react";
import Image from "next/image";
import { Clip } from "@/actions/clips";

interface ClipsRailProps {
  videoId?: string;
  clips: Clip[];
}

export function ClipsRail({ clips }: ClipsRailProps) {
  if (!clips || clips.length === 0) return null;

  const readyClips = clips.filter((clip) => clip.status === "READY");
  
  if (readyClips.length === 0) return null;

  return (
    <div className="mt-6 mb-4 px-4 sm:px-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">Featured Highlights</h3>
        <Link href={`/clips`} className="text-sm font-semibold text-electric-lime hover:opacity-80 transition-opacity">
          More clips
        </Link>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
        {readyClips.map((clip) => (
          <Link
            key={clip.clipId}
            href={`/clips/${clip.clipId}`}
            className="flex-shrink-0 w-64 group relative rounded-xl overflow-hidden bg-noir-terminal/50 snap-start"
          >
            <div className="aspect-video relative overflow-hidden bg-black/50">
              {clip.thumbnailResolvedUrl ? (
                <Image
                  src={clip.thumbnailResolvedUrl}
                  alt={`Highlight Clip ${clip.clipId}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 256px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 group-hover:scale-105 transition-transform duration-300">
                  <PlayCircle className="w-10 h-10 text-white/50" />
                </div>
              )}
              
              {/* Duration badge */}
              <div className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 rounded text-[10px] font-medium text-white shadow-sm">
                00:{Math.floor(clip.duration).toString().padStart(2, "0")}
              </div>

              {/* Signals overlay */}
              <div className="absolute top-1.5 left-1.5 flex gap-1">
                {clip.signals?.chat && <div className="w-2 h-2 rounded-full bg-electric-lime shadow-[0_0_8px_rgba(204,255,0,0.8)]" title="High Chat Activity" />}
                {clip.signals?.audio && <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" title="Audio Spike" />}
                {clip.signals?.ocr && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" title="Key Action Read" />}
              </div>
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <PlayCircle className="w-12 h-12 text-white shadow-xl" />
              </div>
            </div>

            <div className="p-3">
              <h4 className="text-sm font-semibold text-white truncate group-hover:text-electric-lime transition-colors">
                {clip.title || `Highlight #${clip.clipId.slice(-4).toUpperCase()}`}
              </h4>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-text">
                <span>{Intl.NumberFormat("en-US", { notation: "compact" }).format(clip.viewCount)} views</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
