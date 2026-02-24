"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { StreamThumbnail } from "./StreamThumbnail";
import type { Stream } from "@/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PlaylistAction } from "./PlaylistAction";

interface StreamCardProps {
  stream: Stream;
}

export function StreamCard({ stream }: StreamCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ReturnType<typeof import("video.js").default> | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Only show video if it's a real HLS stream and status is live
  const canLivePreview = stream.status === "live" && (stream.hlsPlaybackUrl?.endsWith(".m3u8") ?? false);

  const initPlayer = useCallback(
    async (shouldPlay = false) => {
      if (!videoRef.current || !canLivePreview || playerRef.current) return;

      try {
        const videojs = (await import("video.js")).default;

        if (playerRef.current) return;

        const player = videojs(videoRef.current, {
          autoplay: true,
          controls: false,
          muted: true,
          loop: true,
          preload: "auto",
          html5: {
            vhs: { overrideNative: true },
            nativeAudioTracks: false,
            nativeVideoTracks: false,
          },
        });

        playerRef.current = player;

        player.src({
          src: stream.hlsPlaybackUrl!,
          type: "application/x-mpegURL",
        });

        player.on("playing", () => {
          setIsVideoReady(true);
          const isCurrentlyHovered = videoRef.current?.closest(".group")?.matches(":hover");
          if (!shouldPlay && !isCurrentlyHovered) {
            player.pause();
          }
        });

        player.on("error", () => {
          setIsVideoReady(false);
          player.dispose();
          playerRef.current = null;
        });
      } catch (e) {
        console.error("Failed to initialize video player:", e);
      }
    },
    [canLivePreview, stream.hlsPlaybackUrl],
  );

  // Intersection Observer to lazy-load video player in background
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !canLivePreview) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          initPlayer(false);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [canLivePreview, initPlayer]);

  useEffect(() => {
    if (!canLivePreview && playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
      setIsVideoReady(false);
    }
  }, [canLivePreview]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && stream.hlsPlaybackUrl) {
      playerRef.current.src({
        src: stream.hlsPlaybackUrl,
        type: "application/x-mpegURL",
      });
      setIsVideoReady(false);
    }
  }, [stream.hlsPlaybackUrl]);

  const handleMouseEnter = useCallback(() => {
    playerRef.current?.play()?.catch(() => {});
  }, []);

  const handleMouseLeave = useCallback(() => {
    playerRef.current?.pause();
  }, []);

  const viewerCount = Intl.NumberFormat("en-US", { notation: "compact" }).format(stream.viewerCount || 0);
  const streamerInfo = stream.streamer || stream.creator;

  return (
    <div className="relative group">
      <Link href={`/live/${streamerInfo?.username || stream.id}`} className="block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div ref={containerRef} className="relative aspect-video w-full rounded-xl overflow-hidden bg-noir-deep border border-white/10">
          <StreamThumbnail url={stream.thumbnailUrl} title={stream.title} className={cn("transition-all duration-300", isVideoReady ? "opacity-0" : "opacity-100")} />

          {canLivePreview && (
            <div className={`stream-card-player absolute inset-0 transition-opacity duration-500 ${isVideoReady ? "opacity-100" : "opacity-0"}`}>
              <video ref={videoRef} className="video-js vjs-fluid" playsInline muted />
            </div>
          )}

          {/* Status Overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded-md z-20">
            <div className="w-1.5 h-1.5 rounded-full bg-signal-red" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.15em]">Live</span>
          </div>

          {/* View Count Overlay */}
          <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded-md z-20">
            <span className="text-[9px] font-bold text-white tracking-widest uppercase">{viewerCount} VIEWERS</span>
          </div>
        </div>

        <div className="flex gap-4 mt-4 px-2 md:px-1">
          <Avatar className="h-10 w-10 shrink-0 border border-white/10">
            <AvatarImage src={streamerInfo?.avatarUrl} alt={streamerInfo?.username} />
            <AvatarFallback className="bg-noir-deep text-white text-xs font-bold uppercase">{streamerInfo?.username?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <h3 className="text-base md:text-sm font-bold text-white leading-snug md:leading-tight line-clamp-2 transition-colors group-hover:text-white/90">{stream.title}</h3>
            <div className="flex flex-col mt-2 md:mt-1 space-y-0.5">
              <p className="text-sm md:text-[11px] text-muted-text font-bold md:font-medium group-hover:text-white/70 transition-colors truncate">{streamerInfo?.username || "Unknown Creator"}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-[10px] text-muted-text/40 uppercase tracking-wider font-black">{stream.category || "General"}</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .stream-card-player .vjs-fluid {
            padding-top: 0 !important;
            height: 100% !important;
          }
          .stream-card-player .vjs-fluid video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        `}</style>
      </Link>

      {/* Playlist Action */}
      <div className="absolute top-2 right-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
        <PlaylistAction videoId={stream.id} />
      </div>
    </div>
  );
}
