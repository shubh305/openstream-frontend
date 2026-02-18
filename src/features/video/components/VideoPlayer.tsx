"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Hls from "hls.js";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, RotateCcw, Check, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { incrementView } from "@/actions/video";

import { useVideoStatus } from "@/hooks/useVideoStatus";

interface VideoPlayerProps {
  videoId: string;
  posterUrl?: string;
  videoUrl?: string;
  resolutions?: string[];
}

export function VideoPlayer({ videoId, posterUrl: initialPosterUrl, videoUrl: initialVideoUrl, resolutions: initialResolutions = [] }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<string>("auto");
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [posterUrl, setPosterUrl] = useState(initialPosterUrl);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasViewedRef = useRef(false);

  // Real-time status updates
  const { update } = useVideoStatus(videoId);

  // Consolidate quality options and status updates from all sources
  useEffect(() => {
    if (update) {
      if (update.hlsManifest && update.hlsManifest !== videoUrl) {
        requestAnimationFrame(() => setVideoUrl(update.hlsManifest!));
      }
      if (update.thumbnailUrl && update.thumbnailUrl !== posterUrl) {
        requestAnimationFrame(() => setPosterUrl(update.thumbnailUrl!));
      }
    }

    const qualities = new Set<string>(["auto"]);
    initialResolutions.forEach(r => qualities.add(r));
    if (update?.resolutions) {
      update.resolutions.forEach(r => qualities.add(r));
    }

    if (qualities.size > availableQualities.length) {
      const newQualities = Array.from(qualities);
      requestAnimationFrame(() => setAvailableQualities(newQualities));
    }
  }, [initialResolutions, update, videoUrl, posterUrl, availableQualities.length]);



  useEffect(() => {
    if (initialResolutions.length > 0 && availableQualities.length <= 1) {
      requestAnimationFrame(() => setAvailableQualities(["auto", ...initialResolutions]));
    }
  }, [initialResolutions, availableQualities.length]);

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (videoUrl.endsWith(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          startFragPrefetch: true,
        });
        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          const levels = data.levels.map(level => `${level.height}p`);
          const uniqueLevels = Array.from(new Set(levels));
          setAvailableQualities(["auto", ...uniqueLevels]);

          if (currentQuality === "auto") {
            hls.startLevel = -1;
          } else {
            const height = parseInt(currentQuality);
            const levelIndex = data.levels.findIndex(l => l.height === height);
            if (levelIndex !== -1) {
              hls.startLevel = levelIndex;
            }
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, () => {
          console.log("[HLS] Level switched");
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      }
    } else {
      video.src = videoUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoUrl, currentQuality]);

  useEffect(() => {
    if (isPlaying && !hasViewedRef.current && videoId) {
      incrementView(videoId);
      hasViewedRef.current = true;
    }
  }, [isPlaying, videoId]);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
 
    if (hasEnded) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play();
      setIsPlaying(true);
      setHasEnded(false);
      return;
    }
 
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
    setHasEnded(false);
  }, [hasEnded, isPlaying]);
 
  const handleQualityChange = useCallback((quality: string) => {
    setCurrentQuality(quality);
    if (!hlsRef.current) return;
 
    // Trigger visual buffering feedback immediately
    setIsBuffering(true);
 
    if (quality === "auto") {
      hlsRef.current.currentLevel = -1;
    } else {
      const height = parseInt(quality);
      const levelIndex = hlsRef.current.levels.findIndex(l => l.height === height);
 
      if (levelIndex !== -1) {
        hlsRef.current.currentLevel = levelIndex;
        hlsRef.current.loadLevel = levelIndex;
      } else {
        if (videoUrl && !videoUrl.includes("?t=")) {
          const separator = videoUrl.includes("?") ? "&" : "?";
          const newUrl = `${videoUrl}${separator}t=${Date.now()}`;
          setVideoUrl(newUrl);
        }
      }
    }
  }, [videoUrl, setVideoUrl]);
 
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
 
  const handleVolumeChange = useCallback((value: number[]) => {
    if (!videoRef.current) return;
    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);
 
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);
 
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);
 
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className="group relative h-full w-full overflow-hidden bg-black flex items-center justify-center cursor-default"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="h-full w-full max-h-full object-contain cursor-pointer"
        onClick={handlePlayPause}
        onTimeUpdate={() => {
          if (videoRef.current) {
            if (!isBuffering) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }
        }}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onSeeking={() => setIsBuffering(true)}
        onSeeked={() => {
          setIsBuffering(false);
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setHasEnded(true);
          setShowControls(true);
          setIsBuffering(false);
        }}
        playsInline
      />

      {/* Loading Spinner */}
      {isBuffering && !hasEnded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-30 transition-all duration-300">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-electric-lime animate-spin stroke-[1.5]" />
            <div className="absolute inset-0 h-16 w-16 text-electric-lime animate-pulse blur-xl opacity-20" />
          </div>
          <span className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-electric-lime">Buffering</span>
        </div>
      )}

      {/* Overlays (Poster/Play/Replay) */}
      {(!isPlaying && currentTime === 0) || hasEnded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
          {currentTime === 0 && posterUrl && <Image src={posterUrl} alt="Poster" fill className="object-cover -z-10 opacity-70" priority />}
          <Button
            size="icon"
            className="h-20 w-20 rounded-full bg-electric-lime text-black hover:bg-electric-lime/90 hover:scale-110 transition-all shadow-2xl shadow-electric-lime/20"
            onClick={handlePlayPause}
          >
            {hasEnded ? <RotateCcw className="h-10 w-10" /> : <Play className="h-10 w-10 ml-1.5" />}
          </Button>
        </div>
      ) : null}

      {/* Bottom Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-4 pb-4 pt-10 transition-all duration-300 z-20",
          showControls || !isPlaying ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none",
        )}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={val => {
              if (videoRef.current) videoRef.current.currentTime = val[0];
            }}
            className="cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 font-mono">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-10 w-10" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white" />}
            </Button>

            <div className="flex items-center gap-2 group/volume">
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-10 w-10 shrink-0" onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>
              <div className="w-0 overflow-hidden transition-all duration-300 group-hover/volume:w-24">
                <Slider value={[isMuted ? 0 : volume]} min={0} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-20" />
              </div>
            </div>

            <span className="text-[10px] sm:text-xs font-bold text-white/90">
              {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Quality Selector */}
            {availableQualities.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-10 gap-2 px-3">
                    <Settings className="h-5 w-5" />
                    <span className="text-xs font-bold hidden sm:inline uppercase">{currentQuality}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-noir-terminal border-white/10 text-white min-w-[120px]">
                  <DropdownMenuLabel className="text-[10px] uppercase text-muted-text">Quality</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {availableQualities.map(q => (
                    <DropdownMenuItem
                      key={q}
                      className={cn("flex items-center justify-between gap-4 focus:bg-white/10 focus:text-white cursor-pointer", currentQuality === q && "text-electric-lime")}
                      onClick={() => handleQualityChange(q)}
                    >
                      <span className="text-xs font-bold uppercase">{q}</span>
                      {currentQuality === q && <Check className="h-3 w-3" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-10 w-10" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
