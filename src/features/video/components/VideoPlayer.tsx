"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { incrementView } from "@/actions/video";

/**
 * VideoPlayer Component
 * 
 * A custom video player implementation using the HTML5 <video> API.
 * Features:
 * - Custom controls (Play/Pause, Seek, Volume, Fullscreen)
 * - View tracking integration
 * - Poster image support
 */

interface VideoPlayerProps {
  videoId: string;
  posterUrl?: string;
  videoUrl?: string;
}

export function VideoPlayer({ videoId, posterUrl, videoUrl }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const hasViewedRef = useRef(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Track view on first play
  useEffect(() => {
    if (isPlaying && !hasViewedRef.current && videoId) {
      incrementView(videoId);
      hasViewedRef.current = true;
    }
  }, [isPlaying, videoId]);

  // Format time helper (mm:ss)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
    setHasEnded(false);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - NodeJS timeout type mismatch fallback
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2000);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setHasEnded(true);
    setShowControls(true);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="group relative aspect-video w-full overflow-hidden bg-black rounded-xl" onMouseMove={handleMouseMove} onMouseLeave={() => isPlaying && setShowControls(false)}>
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-contain cursor-pointer"
        onClick={handlePlayPause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleVideoEnd}
      />

      {/* Initial Play Button / Replay Overlay */}
      {(!isPlaying && currentTime === 0) || hasEnded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          {currentTime === 0 && posterUrl && <Image src={posterUrl} alt="Poster" fill className="object-cover -z-10 opacity-60" sizes="(max-width: 768px) 100vw, 80vw" />}
          <Button
            size="icon"
            className="h-20 w-20 rounded-full bg-white/10 hover:bg-white/25 hover:scale-110 transition-all backdrop-blur-md border border-white/10"
            onClick={() => {
              if (hasEnded) {
                videoRef.current!.currentTime = 0;
                handlePlayPause();
              } else {
                handlePlayPause();
              }
            }}
          >
            {hasEnded ? <RotateCcw className="h-10 w-10 text-white fill-white" /> : <Play className="h-10 w-10 text-white fill-white ml-2" />}
          </Button>
        </div>
      ) : null}

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-10 transition-opacity duration-300 z-20",
          showControls || !isPlaying ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Progress Bar */}
        <div className="group/slider mb-4 flex items-center gap-2">
          <Slider value={[currentTime]} min={0} max={duration || 100} onValueChange={handleSeek} className="cursor-pointer" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white" />}
            </Button>

            <div className="flex items-center gap-2 group/volume relative">
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8" onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <div className="w-0 overflow-hidden transition-all duration-300 group-hover/volume:w-24">
                <Slider value={[isMuted ? 0 : volume]} min={0} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-20" />
              </div>
            </div>

            <span className="text-xs font-medium text-white/90 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8">
              <Settings className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
