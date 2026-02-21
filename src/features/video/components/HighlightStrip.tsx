"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Play, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { HighlightClip } from "@/actions/video";

interface HighlightStripProps {
  clips: HighlightClip[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  onHover?: (time: number, x: number) => void;
  onLeave?: () => void;
  className?: string;
}

/**
 * HighlightStrip — Interactive timeline strip showing highlight segments.
 */
export function HighlightStrip({ clips, duration, currentTime, onSeek, onHover, onLeave, className }: HighlightStripProps) {
  const [selectedClip, setSelectedClip] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      setShowArrows(scrollWidth > clientWidth);
    }
  }, []);

  useEffect(() => {
    if (isExpanded) {
      const handle = requestAnimationFrame(checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        cancelAnimationFrame(handle);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll, clips, isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;
    const timeout = setTimeout(() => setIsExpanded(false), 10000);
    return () => clearTimeout(timeout);
  }, [isExpanded, selectedClip]);

  const handleClipClick = useCallback(
    (clip: HighlightClip) => {
      setSelectedClip(clip.index);
      onSeek(clip.start);
    },
    [onSeek],
  );

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  if (!clips.length) return null;

  const activeClip = clips.find((c) => currentTime >= c.start && currentTime <= c.end);

  return (
    <div className={cn("relative", className)}>
      {/* Timeline Markers */}
      <div className="absolute inset-x-0 top-0 h-full pointer-events-none z-10">
        {clips.map((clip) => {
          const left = (clip.start / duration) * 100;
          const width = ((clip.end - clip.start) / duration) * 100;
          const isActive = activeClip?.index === clip.index;

          return (
            <div
              key={clip.index}
              className={cn(
                "absolute top-0 h-full rounded-sm transition-all duration-300 pointer-events-auto cursor-pointer",
                isActive
                  ? "bg-violet-500/50 border-t-2 border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                  : "bg-violet-500/20 hover:bg-violet-500/40 border-t border-violet-500/40",
              )}
              style={{ left: `${left}%`, width: `${Math.max(width, 0.3)}%` }}
              onMouseMove={(e) => {
                const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                const x = e.clientX - rect.left;
                const hoverTime = (x / rect.width) * duration;
                onHover?.(hoverTime, x);
              }}
              onMouseLeave={() => onLeave?.()}
              onClick={(e) => {
                e.stopPropagation();
                const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                const x = e.clientX - rect.left;
                const seekTime = (x / rect.width) * duration;
                
                onSeek(seekTime);
                setSelectedClip(clip.index);
                setIsExpanded(true);
              }}
              title={clip.title}
            />
          );
        })}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => onHover?.(currentTime, 0)}
        onMouseLeave={() => onLeave?.()}
        className={cn(
          "absolute -top-8 right-0 flex items-center gap-1.5 px-2.5 py-1 rounded-t-md text-[10px] font-bold tracking-wide transition-all duration-300 z-20 pointer-events-auto cursor-pointer",
          isExpanded
            ? "bg-violet-500 text-white"
            : "bg-white/10 text-violet-400 hover:bg-white/15",
        )}
      >
        <Sparkles className="h-3 w-3" />
        <span>{clips.length} HIGHLIGHTS</span>
      </button>

      {/* Expanded Clip Carousel */}
      {isExpanded && (
        <div 
          onMouseEnter={() => onHover?.(currentTime, 0)}
          onMouseLeave={() => onLeave?.()}
          className="absolute bottom-full mb-1 left-0 right-0 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-md rounded-t-lg border-t border-violet-500/30 px-2 py-3 z-30 animate-in slide-in-from-bottom-2 fade-in duration-300 pointer-events-auto"
        >
          {/* Scroll Arrows */}
          {showArrows && (
            <>
              <button
                onClick={() => scroll("left")}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Scrollable Clip Cards */}
          <div
            ref={scrollRef}
            className="flex gap-2.5 overflow-x-auto scrollbar-hide px-1 snap-x snap-mandatory"
          >
            {clips.map((clip) => {
              const isActive = activeClip?.index === clip.index;
              const isSelected = selectedClip === clip.index;
              const clipDuration = clip.end - clip.start;

              return (
                <button
                  key={clip.index}
                  onClick={() => handleClipClick(clip)}
                  className={cn(
                    "flex-none w-[150px] snap-start group rounded-lg overflow-hidden transition-all duration-200 text-left cursor-pointer",
                    isSelected || isActive
                      ? "ring-2 ring-violet-500 shadow-lg shadow-violet-500/20"
                      : "ring-1 ring-white/10 hover:ring-white/25",
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-noir-terminal overflow-hidden">
                    {clip.thumbnailUrl ? (
                      <Image
                        src={clip.thumbnailUrl}
                        alt={clip.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-900/30 to-black">
                        <Sparkles className="h-5 w-5 text-violet-400/50" />
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-5 w-5 text-white fill-white" />
                    </div>
                    {/* Duration badge */}
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-[9px] font-mono font-bold text-white rounded">
                      {Math.floor(clipDuration / 60)}:{String(Math.floor(clipDuration % 60)).padStart(2, "0")}
                    </span>
                    {/* Playing indicator */}
                    {isActive && (
                      <div className="absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 bg-violet-500 rounded text-[8px] font-black text-white">
                        <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        PLAYING
                      </div>
                    )}
                  </div>
                  {/* Title */}
                  <div className="px-2 py-1.5 bg-white/5">
                    <p className="text-[10px] font-medium text-white/80 line-clamp-1">{clip.title}</p>
                    <p className="text-[9px] text-white/40 font-mono mt-0.5">
                      {formatTimestamp(clip.start)} — {formatTimestamp(clip.end)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
