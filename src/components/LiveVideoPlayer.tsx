"use client";

import { useEffect, useRef, useState } from "react";
import type Player from "video.js/dist/types/player";

interface LiveVideoPlayerProps {
  hlsUrl: string;
  poster?: string;
  autoplay?: boolean;
  className?: string;
  onStreamEnded?: () => void;
}

export function LiveVideoPlayer({
  hlsUrl,
  poster,
  autoplay = true,
  className = "",
  onStreamEnded,
}: LiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamEnded, setStreamEnded] = useState(false);
  const errorCountRef = useRef(0);


  useEffect(() => {
    const initPlayer = async () => {
      if (!videoRef.current) return;

      const videojs = (await import("video.js")).default;

      // Initialize Video.js player
      const player = videojs(videoRef.current, {
        autoplay,
        controls: true,
        responsive: true,
        fluid: true,
        preload: "auto",
        liveui: true,
        muted: true,
        html5: {
          vhs: {
            overrideNative: true,
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
        },
      });

      playerRef.current = player;

      player.src({
        src: hlsUrl,
        type: "application/x-mpegURL",
      });

      player.on("playing", () => {
        setIsLoading(false);
        setIsPlaying(true);
        setHasError(false);
        setStreamEnded(false);
        errorCountRef.current = 0;
      });

      player.on("pause", () => {
        setIsPlaying(false);
      });

      player.on("waiting", () => {
        setIsLoading(true);
      });

      player.on("canplay", () => {
        setIsLoading(false);
      });

      player.on("loadeddata", () => {
        setIsLoading(false);
      });

      const handleError = () => {
        errorCountRef.current++;
        const error = player.error();
        console.log("Video player error:", error, "Count:", errorCountRef.current);

        // Code 2 = Network Error, Code 4 = Source Not Supported
        if (error?.code === 2 || error?.code === 4 || errorCountRef.current >= 2) {
            console.log("Stream deemed ended due to errors");
            setIsLoading(false);
            setHasError(false);
            setStreamEnded(true);
            onStreamEnded?.();
        } else {
            setIsLoading(false);
            setHasError(true);
        }
      };

      player.on("error", handleError);
      
      player.on("usage", (e: { name: string }) => {
          if (e.name === 'hls-404') {
             handleError();
          }
      });

      player.tech().on('retryplaylist', () => {
          console.log("Playlist retry - potential 404");
          handleError();
      });
    };

    initPlayer();

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [hlsUrl, autoplay, onStreamEnded]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Video.js CSS */}
      <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />

      {/* Video Element */}
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered vjs-theme-noir" poster={poster} playsInline>
          <p className="vjs-no-js">
            To view this video please enable JavaScript, and consider upgrading to a web browser that{" "}
            <a href="https://videojs.com/html5-video-support/" target="_blank" rel="noreferrer">
              supports HTML5 video
            </a>
          </p>
        </video>
      </div>

      {/* Live Badge */}
      {isPlaying && !hasError && !streamEnded && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-signal-red px-3 py-1.5 rounded-full animate-pulse z-10">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="text-xs font-bold text-white uppercase">Live Now</span>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && !hasError && !streamEnded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-electric-lime border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-text">Connecting to stream...</span>
          </div>
        </div>
      )}

      {/* Stream Ended Overlay */}
      {streamEnded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <div className="w-20 h-20 rounded-full bg-noir-terminal flex items-center justify-center">
              <svg className="w-10 h-10 text-electric-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-white">Stream Ended</p>
              <p className="text-sm text-muted-text max-w-xs">This stream has ended. Thanks for watching!</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Overlay (temporary errors) */}
      {hasError && !streamEnded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <div className="w-16 h-16 rounded-full bg-noir-terminal flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-white">Connection Issue</p>
              <p className="text-sm text-muted-text">Trying to reconnect...</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom styles for Video.js noir theme */}
      <style jsx global>{`
        .vjs-loading-spinner {
          display: none !important;
        }
        .vjs-theme-noir {
          --vjs-theme-noir--primary: #e8ff1e;
          --vjs-theme-noir--secondary: #1e1e1e;
        }
        .vjs-theme-noir .vjs-control-bar {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5), transparent);
          height: 4.5em;
          padding-bottom: 0.5em;
          padding-left: 0.5em;
          padding-right: 0.5em;
          display: flex;
          align-items: center;
        }
        .vjs-theme-noir .vjs-progress-control {
          position: absolute;
          bottom: 4.5em;
          left: 0;
          right: 0;
          width: 100%;
          height: 0.8em;
          transition: height 0.1s ease-in-out;
          z-index: 10;
        }
        .vjs-theme-noir .vjs-progress-control:hover {
          height: 1em;
        }
        .vjs-theme-noir .vjs-progress-holder {
          margin: 0;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
        }
        .vjs-theme-noir .vjs-play-progress {
          background: var(--vjs-theme-noir--primary);
        }
        .vjs-theme-noir .vjs-play-progress:before {
          font-size: 1.2em;
          top: -0.35em;
          color: var(--vjs-theme-noir--primary);
          opacity: 0;
          transition: opacity 0.1s ease-in-out;
        }
        .vjs-theme-noir .vjs-progress-control:hover .vjs-play-progress:before {
          opacity: 1;
        }
        .vjs-theme-noir .vjs-load-progress {
          background: rgba(255, 255, 255, 0.3);
        }
        .vjs-theme-noir .vjs-load-progress div {
          background: transparent;
        }

        .vjs-theme-noir .vjs-volume-level {
          background: var(--vjs-theme-noir--primary);
        }
        .vjs-theme-noir .vjs-big-play-button {
          background: var(--vjs-theme-noir--primary);
          border: none;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          line-height: 80px;
          font-size: 40px;
          box-shadow: 0 0 30px rgba(232, 255, 30, 0.2);
          cursor: pointer;
        }
        .vjs-theme-noir .vjs-big-play-button:hover {
          background: var(--vjs-theme-noir--primary);
          transform: scale(1.1);
          transition: all 0.2s;
        }
        .vjs-theme-noir .vjs-control {
          cursor: pointer;
        }
        .vjs-theme-noir .vjs-big-play-button .vjs-icon-placeholder:before {
          color: #000;
        }
      `}</style>
    </div>
  );
}

