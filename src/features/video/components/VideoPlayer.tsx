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
import { incrementClipView } from "@/actions/clips";

import { useVideoStatus } from "@/hooks/useVideoStatus";
import { useHighlights } from "@/hooks/useHighlights";
import { useSubtitles } from "@/hooks/useSubtitles";
import { useSpritePreview } from "@/hooks/useSpritePreview";
import { HighlightStrip } from "./HighlightStrip";
import { SubtitleSelector } from "./SubtitleSelector";
import { SeekbarThumbnail } from "./SeekbarThumbnail";

export interface VideoPlayerProps {
  videoId: string;
  posterUrl?: string;
  videoUrl?: string;
  resolutions?: string[];
  status?: string;
  type?: "video" | "clip";
  onEnded?: () => void;
}

export function VideoPlayer({
  videoId,
  posterUrl: initialPosterUrl,
  videoUrl: initialVideoUrl,
  resolutions: initialResolutions = [],
  status: initialStatus,
  type = "video",
  onEnded,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
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
  const [buffered, setBuffered] = useState<{ start: number; end: number }[]>([]);
  const [resolvedQuality, setResolvedQuality] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSubtitleTrack, setActiveSubtitleTrack] = useState<string | null>(null);
  const [isOverHighlight, setIsOverHighlight] = useState(false);
  const [seekHoverTime, setSeekHoverTime] = useState<number | null>(null);
  const [seekHoverX, setSeekHoverX] = useState(0);
  const [seekbarWidth, setSeekbarWidth] = useState(0);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setContainer(containerRef.current);
    }
  }, []);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasViewedRef = useRef(false);

  // Real-time pipeline status
  const { update } = useVideoStatus(videoId);

  const isReady = !!videoUrl || availableQualities.length > 1 || update?.hlsManifest || initialStatus === "READY" || initialStatus === "PUBLISHED" || type === "clip";

  // Sprite thumbnail preview
  const { vttUrl, setVttUrl } = useSpritePreview(type === "video" ? videoId : null);

  // Content Intelligence Layer data
  const { highlights } = useHighlights(type === "video" ? videoId : null);
  const { subtitles } = useSubtitles(type === "video" ? videoId : null);

  // Activate sprite preview live on sprite:ready WebSocket event
  useEffect(() => {
    if (update?.status === "sprite:ready" && update.vttUrl && !vttUrl) {
      setVttUrl(update.vttUrl);
    }
  }, [update, vttUrl, setVttUrl]);

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
          const levels = data.levels.filter(l => l.height > 0).map(level => `${level.height}p`);

          let uniqueLevels = Array.from(new Set(levels));
          if (uniqueLevels.length === 0 && initialResolutions.length > 0) {
            uniqueLevels = [...initialResolutions];
          }

          setAvailableQualities(["auto", ...uniqueLevels]);

          if (currentQuality === "auto") {
            hls.startLevel = -1;
          } else {
            const height = parseInt(currentQuality);
            const levelIndex = data.levels.findIndex(l => l.height === height || uniqueLevels.includes(currentQuality));
            if (levelIndex !== -1) {
              hls.startLevel = levelIndex;
            }
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          if (data.level !== -1 && hls.levels[data.level]) {
            const height = hls.levels[data.level].height;
            if (height > 0) {
              setResolvedQuality(`${height}p`);
            } else if (initialResolutions.length > 0) {
              setResolvedQuality(initialResolutions[0]);
            }
          }
        });

        hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
          if (data.level !== undefined && hls.levels[data.level]) {
            const height = hls.levels[data.level].height;
            if (height > 0) {
              setResolvedQuality(`${height}p`);
            } else if (initialResolutions.length > 0) {
              setResolvedQuality(initialResolutions[0]);
            }
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (hls.loadLevel !== -1 && hls.levels[hls.loadLevel]) {
            const height = hls.levels[hls.loadLevel].height;
            if (height > 0) {
              setResolvedQuality(`${height}p`);
            } else if (initialResolutions.length > 0) {
              setResolvedQuality(initialResolutions[0]);
            }
          }

          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      }
    } else {
      video.src = videoUrl;
    }

    if (videoUrl && !videoUrl.endsWith(".m3u8") && video) {
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoUrl, currentQuality, initialResolutions]);

  useEffect(() => {
    if (isPlaying && !hasViewedRef.current && videoId) {
      if (type === "video") {
        incrementView(videoId);
      } else if (type === "clip") {
        incrementClipView(videoId);
      }
      hasViewedRef.current = true;
    }
  }, [isPlaying, videoId, type]);

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

  const handleQualityChange = useCallback(
    (quality: string) => {
      if (quality === currentQuality) {
        setCurrentQuality("auto");
        if (hlsRef.current) hlsRef.current.currentLevel = -1;
        return;
      }

      setCurrentQuality(quality);
      if (!hlsRef.current) return;

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
    },
    [currentQuality, videoUrl, setVideoUrl],
  );

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
      onClick={() => {
        if (showControls) {
          setShowControls(false);
        } else {
          handleMouseMove();
        }
      }}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
    >
      <video
        ref={videoRef}
        className="h-full w-full max-h-full object-contain cursor-pointer"
        onClick={handlePlayPause}
        onTimeUpdate={() => {
          if (videoRef.current && !isBuffering && !isScrubbing) {
            setCurrentTime(videoRef.current.currentTime);
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
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setHasEnded(true);
          setShowControls(true);
          setIsBuffering(false);
          if (onEnded) onEnded();
        }}
        onProgress={() => {
          if (videoRef.current) {
            const ranges = [];
            for (let i = 0; i < videoRef.current.buffered.length; i++) {
              ranges.push({
                start: videoRef.current.buffered.start(i),
                end: videoRef.current.buffered.end(i),
              });
            }
            setBuffered(ranges);
          }
        }}
        playsInline
        crossOrigin="anonymous"
      >
        {/* Subtitle tracks */}
        {subtitles?.tracks?.map(track => (
          <track key={track.lang} kind="subtitles" src={track.url} srcLang={track.lang} label={track.label} default={false} />
        ))}
      </video>

      {/* Processing State Overlay */}
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-noir-terminal z-40 p-6 text-center">
          <div className="relative mb-6">
            <div className="h-16 w-16 rounded-full border-t-2 border-electric-lime animate-spin" />
            <div className="absolute inset-0 h-16 w-16 rounded-full bg-electric-lime animate-pulse blur-2xl opacity-20" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2 tracking-tight">Video is being processed</h2>
          <p className="text-muted-text max-w-sm text-[10px] leading-relaxed uppercase tracking-widest font-mono">Preparing for playback. Please wait...</p>
        </div>
      )}

      {/* Scrubbing Overlay */}
      <div className={cn("absolute inset-0 bg-black/40 transition-opacity duration-300 pointer-events-none z-10", isScrubbing ? "opacity-100" : "opacity-0")} />

      {/* Loading Spinner */}
      {isBuffering && !hasEnded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 z-5 transition-all duration-300">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-electric-lime animate-spin stroke-[1.5]" />
            <div className="absolute inset-0 h-16 w-16 text-electric-lime animate-pulse blur-xl opacity-20" />
          </div>
        </div>
      )}

      {/* Overlays (Poster/Play/Replay) */}
      {isReady && ((!isPlaying && currentTime === 0) || hasEnded) ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
          {currentTime === 0 && posterUrl && <Image src={posterUrl} alt="Poster" fill className="object-cover -z-10 opacity-70" priority />}
          <Button
            size="icon"
            className="h-14 w-14 md:h-20 md:w-20 rounded-full bg-electric-lime text-black hover:bg-electric-lime/90 md:hover:scale-110 transition-all shadow-2xl shadow-electric-lime/20 cursor-pointer"
            onClick={handlePlayPause}
          >
            {hasEnded ? <RotateCcw className="h-7 w-7 md:h-10 md:w-10" /> : <Play className="h-7 w-7 md:h-10 md:w-10 ml-0.5 md:ml-1.5" />}
          </Button>
        </div>
      ) : null}

      {/* Bottom Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-4 pb-4 pt-10 transition-all duration-300 z-50",
          (showControls || !isPlaying) && isReady ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none",
        )}
      >
        {/* Progress Bar */}
        <div className="relative group/progress-container mb-4 px-2">
          <div
            className="relative h-1 group-hover/progress-container:h-2 transition-all duration-150 cursor-pointer flex items-center"
            onMouseMove={e => {
              if (!duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
              setSeekHoverTime(percent * duration);
              setSeekHoverX(e.clientX - rect.left);
              setSeekbarWidth(rect.width);
            }}
            onMouseLeave={() => setSeekHoverTime(null)}
            onMouseDown={e => {
              if (duration === 0) return;
              setIsScrubbing(true);
              const wasPlayingWhenStarted = isPlaying;
              if (wasPlayingWhenStarted && videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
              }

              const seekbar = e.currentTarget;
              const lastHardwareSeekRef = { current: 0 };

              const handleScrub = (clientX: number, isFinal = false) => {
                const rect = seekbar.getBoundingClientRect();
                const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
                const newTime = percent * duration;

                setCurrentTime(newTime);

                setSeekHoverTime(newTime);
                setSeekHoverX(clientX - rect.left);
                setSeekbarWidth(rect.width);
                const now = Date.now();
                if (isFinal || now - lastHardwareSeekRef.current > 150) {
                  if (videoRef.current) {
                    videoRef.current.currentTime = newTime;
                  }
                  lastHardwareSeekRef.current = now;
                }
              };

              handleScrub(e.clientX);

              const onMouseMove = (moveEvent: MouseEvent) => {
                handleScrub(moveEvent.clientX);
              };

              const onMouseUp = (upEvent: MouseEvent) => {
                setIsScrubbing(false);
                handleScrub(upEvent.clientX, true);
                setSeekHoverTime(null);

                if (wasPlayingWhenStarted && videoRef.current) {
                  videoRef.current.play();
                  setIsPlaying(true);
                }

                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);
              };

              window.addEventListener("mousemove", onMouseMove);
              window.addEventListener("mouseup", onMouseUp);
            }}
            onTouchStart={e => {
              if (duration === 0) return;
              setIsScrubbing(true);
              const wasPlayingWhenStarted = isPlaying;
              if (wasPlayingWhenStarted && videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
              }

              const seekbar = e.currentTarget;
              const lastHardwareSeekRef = { current: 0 };

              const handleTouchScrub = (clientX: number, isFinal = false) => {
                const rect = seekbar.getBoundingClientRect();
                const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
                const newTime = percent * duration;

                setCurrentTime(newTime);

                setSeekHoverTime(newTime);
                setSeekHoverX(clientX - rect.left);
                setSeekbarWidth(rect.width);

                const now = Date.now();
                if (isFinal || now - lastHardwareSeekRef.current > 150) {
                  if (videoRef.current) {
                    videoRef.current.currentTime = newTime;
                  }
                  lastHardwareSeekRef.current = now;
                }
              };

              handleTouchScrub(e.touches[0].clientX);

              const onTouchMove = (moveEvent: TouchEvent) => {
                handleTouchScrub(moveEvent.touches[0].clientX);
              };

              const onTouchEnd = (endEvent: TouchEvent) => {
                setIsScrubbing(false);
                if (endEvent.changedTouches && endEvent.changedTouches.length > 0) {
                  handleTouchScrub(endEvent.changedTouches[0].clientX, true);
                }
                setSeekHoverTime(null);

                if (wasPlayingWhenStarted && videoRef.current) {
                  videoRef.current.play();
                  setIsPlaying(true);
                }

                window.removeEventListener("touchmove", onTouchMove);
                window.removeEventListener("touchend", onTouchEnd);
              };

              window.addEventListener("touchmove", onTouchMove, { passive: false });
              window.addEventListener("touchend", onTouchEnd);
            }}
          >
            {/* Background */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-white/20 rounded-full" />

            {/* Buffered Ranges */}
            {buffered.map((range, i) => (
              <div
                key={i}
                className="absolute inset-y-0 bg-white/30 rounded-full"
                style={{
                  left: `${(range.start / duration) * 100}%`,
                  width: `${((range.end - range.start) / duration) * 100}% `,
                }}
              />
            ))}

            {/* Progress */}
            <div className="absolute inset-y-0 bg-[#fafafa] rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }} />

            {/* Scrubber Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-[#fafafa] rounded-full shadow-lg scale-0 group-hover/progress-container:scale-100 transition-transform duration-150 z-20"
              style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
            />

            {/* Highlight Timeline Markers */}
            {highlights?.clips && highlights.clips.length > 0 && (
              <HighlightStrip
                clips={highlights.clips}
                duration={duration}
                currentTime={currentTime}
                onSeek={time => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = time;
                    setCurrentTime(time);
                  }
                }}
                onHover={(time, x) => {
                  setSeekHoverTime(time);
                  setSeekHoverX(x);
                  setIsOverHighlight(true);
                }}
                onLeave={() => {
                  setIsOverHighlight(false);
                }}
                className="absolute inset-x-0 -top-1 -bottom-1 pointer-events-none"
              />
            )}
          </div>

          {/* Sprite Thumbnail Preview */}
          {vttUrl && seekHoverTime !== null && seekbarWidth > 0 && !isOverHighlight && <SeekbarThumbnail vttUrl={vttUrl} hoverTime={seekHoverTime} hoverX={seekHoverX} seekbarWidth={seekbarWidth} />}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 font-mono">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-10 w-10 cursor-pointer" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white" />}
            </Button>

            <div className="flex items-center gap-2 group/volume">
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-10 w-10 shrink-0 cursor-pointer" onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>
              <div className="w-0 overflow-hidden transition-all duration-300 group-hover/volume:w-24">
                <Slider value={[isMuted ? 0 : volume]} min={0} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-20 cursor-pointer" />
              </div>
            </div>

            <span className="text-[10px] sm:text-xs font-bold text-white/90">
              {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Quality Selector */}
            {availableQualities.length > 1 && (
              <DropdownMenu onOpenChange={setIsSettingsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-10 gap-2 px-3 relative cursor-pointer group">
                    <Settings className="h-5 w-5" />
                    <span className="text-xs font-bold hidden sm:inline">
                      {currentQuality === "auto" ? (isSettingsOpen ? "Auto" : `Auto${resolvedQuality ? ` (${resolvedQuality})` : ""}`) : currentQuality}
                    </span>
                    {((currentQuality === "auto" ? resolvedQuality : currentQuality).includes("720") || (currentQuality === "auto" ? resolvedQuality : currentQuality).includes("1080")) && (
                      <span className="absolute -top-1 -right-1 px-1 bg-signal-red text-[10px] font-black leading-tight rounded-sm text-white shadow-lg z-10 border border-black/20 font-black">
                        HD
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-noir-terminal border-white/10 text-white min-w-[160px]" container={container}>
                  <DropdownMenuLabel className="text-[10px] text-muted-text">Quality</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />

                  {/* Resolution Options */}
                  {availableQualities
                    .filter(q => q !== "auto")
                    .map(q => {
                      const isActive = currentQuality === q;
                      return (
                        <DropdownMenuItem
                          key={q}
                          className={cn("flex items-center justify-between gap-4 focus:bg-white/10 focus:text-white cursor-pointer", isActive && "text-electric-lime")}
                          onClick={() => handleQualityChange(q)}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold">{q}</span>
                            {(q.includes("720") || q.includes("1080")) && <span className="text-[8px] opacity-70 font-black leading-none">HD</span>}
                          </div>
                          {isActive && <Check className="h-3 w-3" />}
                        </DropdownMenuItem>
                      );
                    })}

                  <DropdownMenuSeparator className="bg-white/5" />

                  <DropdownMenuItem
                    className={cn("flex items-center justify-between gap-4 focus:bg-white/10 focus:text-white cursor-pointer", currentQuality === "auto" && "text-electric-lime")}
                    onClick={() => handleQualityChange("auto")}
                  >
                    <span className="text-xs font-bold">Auto</span>
                    {currentQuality === "auto" && <Check className="h-3 w-3" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Subtitle Selector */}
            {subtitles && (subtitles.tracks?.length > 0 || ["processing", "transcribed", "translating"].includes(subtitles.status)) && (
              <SubtitleSelector
                tracks={subtitles.tracks || []}
                status={subtitles.status}
                activeTrack={activeSubtitleTrack}
                container={container}
                onTrackSelect={lang => {
                  setActiveSubtitleTrack(lang);

                  if (videoRef.current) {
                    const tracks = videoRef.current.textTracks;
                    for (let i = 0; i < tracks.length; i++) {
                      tracks[i].mode = tracks[i].language === lang ? "showing" : "hidden";
                    }
                  }
                }}
              />
            )}

            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-10 w-10 cursor-pointer" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      {/* Mini Progress Bar*/}
      <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-white/10 transition-opacity duration-300 z-10", !showControls && isPlaying ? "opacity-100" : "opacity-0")}>
        {/* Buffered */}
        {buffered.map((range, i) => (
          <div
            key={i}
            className="absolute inset-y-0 bg-white/20"
            style={{
              left: `${(range.start / duration) * 100}%`,
              width: `${((range.end - range.start) / duration) * 100}%`,
            }}
          />
        ))}
        {/* Progress */}
        <div className="absolute inset-y-0 bg-electric-lime" style={{ width: `${(currentTime / duration) * 100}%` }} />
      </div>
    </div>
  );
}
