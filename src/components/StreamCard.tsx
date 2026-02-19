"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { StreamThumbnail } from "./StreamThumbnail";
import type { Stream } from "@/types/api";

interface StreamCardProps {
  stream: Stream;
}

export function StreamCard({ stream }: StreamCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ReturnType<typeof import("video.js").default> | null>(null);
  const [isHovering, setIsHovering] = useState(false);
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
    setIsHovering(true);
    playerRef.current?.play()?.catch(() => {});
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    playerRef.current?.pause();
  }, []);

  const viewerCount = Intl.NumberFormat("en-US", { notation: "compact" }).format(stream.viewerCount || 0);
  const streamerInfo = stream.streamer || stream.creator;

  return (
    <Link href={`/live/${streamerInfo?.username || stream.id}`} className="block group" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div ref={containerRef} className="relative aspect-video w-full rounded-lg overflow-hidden bg-noir-terminal">
        <StreamThumbnail url={stream.thumbnailUrl} title={stream.title} className={`transition-opacity duration-300 ${isVideoReady ? "opacity-0" : "opacity-100"}`} />

        {canLivePreview && (
          <div className={`stream-card-player absolute inset-0 transition-opacity duration-500 ${isVideoReady ? "opacity-100" : "opacity-0"}`}>
            <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />
            <video ref={videoRef} className="video-js vjs-fluid" playsInline muted />
          </div>
        )}

        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-signal-red px-2 py-0.5 rounded z-20">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold text-white tracking-wide">Live</span>
        </div>

        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/70 px-2 py-0.5 rounded text-xs text-white z-20">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <span>{viewerCount} viewers</span>
        </div>

        <div className={`absolute inset-0 ring-2 ring-electric-lime rounded-lg transition-opacity duration-200 z-30 ${isHovering ? "opacity-100" : "opacity-0"}`} />
      </div>

      <div className="flex gap-4 mt-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-noir-border shrink-0">
          {streamerInfo?.avatarUrl ? (
            <Image src={streamerInfo.avatarUrl} alt={streamerInfo.username || "Streamer"} width={40} height={40} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">{(streamerInfo?.username || "U")[0].toUpperCase()}</div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="text-base font-semibold text-white leading-tight line-clamp-1 group-hover:text-electric-lime transition-colors">{stream.title}</h3>
          <p className="text-sm text-muted-text mt-1 line-clamp-1">{streamerInfo?.username || "Unknown"}</p>
          <p className="text-xs text-muted-text mt-0.5 line-clamp-1">{stream.category || "Just Chatting"}</p>
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
  );
}
