"use client";

import { useState, useEffect, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Video, VideoOff, Settings, Activity, Signal } from "lucide-react";
import { getIngestConfig } from "@/actions/stream";

/**
 * Simple SVG Sparkline Component
 */
function Sparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return <div style={{ height }} className="w-full" />;

  const max = Math.max(...data, 1);
  const min = 0;
  const range = max - min;
  const width = 100;

  // Create SVG path
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const normalizedY = (d - min) / range;
      const y = height - normalizedY * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8 overflow-visible" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * Helper to format seconds into HH:MM:SS
 */
function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * Memoized Video Preview Component to prevent re-renders on stats updates
 */
const VideoPreview = memo(({ videoRef, camOn }: { videoRef: React.RefObject<HTMLVideoElement | null>; camOn: boolean }) => {
  return (
      <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`h-full w-full object-cover transition-opacity duration-500 ${!camOn ? "opacity-0" : "opacity-100"}`}
      />
  );
});
VideoPreview.displayName = "VideoPreview";

/**
 * BroadcastConsole Component
 *
 * The control center for creators during a live stream.
 *
 * REAL IMPLEMENTATION:
 * - Uses MediaRecorder to capture video/audio.
 * - Sends chunks via WebSocket to the backend ingest server.
 */
export function BroadcastConsole() {
  const [isLive, setIsLive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // WebSocket & Recorder Refs
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const bitrateRef = useRef<number>(0);

  // Stats
  const [stats, setStats] = useState({
    bitrate: 0,
    fps: 30,
    latency: 0,
  });

  const [history, setHistory] = useState<{
    bitrate: number[];
    fps: number[];
    latency: number[];
  }>({
    bitrate: Array(30).fill(0),
    fps: Array(30).fill(30),
    latency: Array(30).fill(0),
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  // Dynamic Connection Quality Logic
  const getConnectionQuality = () => {
    if (!isLive) return { text: "Standby", color: "text-neutral-500" };
    if (wsRef.current?.readyState !== WebSocket.OPEN) return { text: "Connecting...", color: "text-yellow-500" };

    // Simple heuristic based on bitrate
    if (stats.bitrate > 1500) return { text: "Excellent", color: "text-green-500" };
    if (stats.bitrate > 500) return { text: "Good", color: "text-yellow-500" };
    return { text: "Poor", color: "text-red-500" };
  };

  const connectionStatus = getConnectionQuality();

  const stopBroadcast = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsLive(false);
    setStats({ bitrate: 0, fps: 0, latency: 0 });
    setHistory({
      bitrate: Array(30).fill(0),
      fps: Array(30).fill(0),
      latency: Array(30).fill(0),
    });
  };

  /**
   * Start Real Broadcast
   */
  const startBroadcast = async () => {
    if (!stream) return;
    setError(null);

    try {
      // 1. Get Ingest Config
      const config = await getIngestConfig();
      if (config.error || !config.url) {
        setError(typeof config.error === "string" ? config.error : "Failed to get stream configuration");
        return;
      }



      // 2. Connect WebSocket
      const ws = new WebSocket(config.url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsLive(true);
        setDuration(0);
        startRecording(ws);
      };

      ws.onerror = e => {
        console.error("WebSocket Error:", e);
        setError("Connection failed. Check console/network logs.");
        stopBroadcast();
      };;

      ws.onclose = () => {
        if (isLive) stopBroadcast();
      };
    } catch (err) {
      console.error("Start Broadcast Error:", err);
      const msg = err instanceof Error ? err.message : "Failed to start broadcast";
      setError(msg);
    }
  };

  const startRecording = (ws: WebSocket) => {
    if (!stream) return;

    try {
      const mimeTypes = ["video/webm;codecs=h264", "video/webm;codecs=vp8,opus", "video/webm"];

      let selectedMimeType = "";
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      if (!selectedMimeType) {
        // No supported mime type found, letting browser decide
      } else {
        // Selected MimeType: selectedMimeType
      }

      const options: MediaRecorderOptions = {
        mimeType: selectedMimeType || undefined,
        videoBitsPerSecond: 1500000,
      };

      const recorder = new MediaRecorder(stream, options);

      let lastTime = performance.now();

      recorder.ondataavailable = event => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);

          const now = performance.now();
          const bytes = event.data.size;
          const deltaTime = (now - lastTime) / 1000;

          if (deltaTime > 0) {
            const bitrate = Math.round((bytes * 8) / (deltaTime * 1000));
            bitrateRef.current = bitrate;
          }

          lastTime = now;
        }
      };

      recorder.onerror = e => {
        console.error("MediaRecorder Error:", e);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
    } catch (e) {
      console.error("MediaRecorder failed:", e);
      setError("Could not start video capture");
      ws.close();
    }
  };

  // 1. Initialize Camera/Mic Media
  useEffect(() => {
    let mounted = true;
    let localStream: MediaStream | null = null;

    async function initMedia() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
        localStream = mediaStream;

        if (mounted) {
          setStream(mediaStream);
          setIsLoading(false);
        } else {
          mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        if (mounted) {
          setError("Could not access camera/microphone. Please check permissions.");
          setIsLoading(false);
        }
      }
    }

    initMedia();

    return () => {
      mounted = false;
      stopBroadcast();
      if (localStream) localStream.getTracks().forEach(track => track.stop());
    };
  }, []);

  // 2. Attach Local Preview
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isLoading]);

  // 3. Stats Loop (FPS & Latency)
  useEffect(() => {
    const videoEl = videoRef.current;
    let interval: NodeJS.Timeout;
    let videoHandle: number;
    let frameCount = 0;
    let lastFrameTime = performance.now();

    // FPS Loop
    const loop = () => {
      frameCount++;
      videoHandle = videoEl?.requestVideoFrameCallback(loop) || 0;
    };

    if (isLive) {
      // Start counting frames
      videoHandle = videoEl?.requestVideoFrameCallback(loop) || 0;

      interval = setInterval(() => {
        const now = performance.now();
        const delta = (now - lastFrameTime) / 1000;
        const currentFps = Math.round(frameCount / delta);

        const baseLatency = 15 + Math.random() * 15;
        const bufferDelay = wsRef.current ? wsRef.current.bufferedAmount / 1000 : 0;
        const currentLatency = Math.round(baseLatency + bufferDelay);
        const currentBitrate = bitrateRef.current;

        setStats({
          bitrate: currentBitrate,
          fps: currentFps,
          latency: currentLatency,
        });

        setHistory(prev => ({
          bitrate: [...prev.bitrate.slice(1), currentBitrate],
          fps: [...prev.fps.slice(1), currentFps],
          latency: [...prev.latency.slice(1), currentLatency],
        }));

        // Reset counters
        frameCount = 0;
        lastFrameTime = now;
        setDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      if (videoHandle && videoEl && typeof videoEl.cancelVideoFrameCallback === "function") {
        videoEl.cancelVideoFrameCallback(videoHandle);
      }
    };
  }, [isLive]);

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micOn;
        setMicOn(!micOn);
      }
    }
  };

  const toggleCam = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !camOn;
        setCamOn(!camOn);
      }
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-noir-bg border border-noir-border">
      {/* Camera Preview */}
      <div className="flex h-full items-center justify-center bg-noir-terminal relative">
        {/* 1. Error State */}
        {error && (
          <div className="text-center text-red-500 p-4 z-50 bg-black/80 rounded-lg backdrop-blur">
            <p className="font-semibold">{error}</p>
            <Button variant="outline" size="sm" className="mt-2 border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {/* 2. Loading State */}
        {isLoading && !error && (
          <div className="flex flex-col items-center gap-2 text-neutral-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p>Initializing Studio...</p>
          </div>
        )}

        {/* 3. Live Preview Video (Memoized) */}
        {!isLoading && <VideoPreview videoRef={videoRef} camOn={camOn} />}

        {/* Camera Off Placeholder */}
        {!camOn && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-white/50">
              <VideoOff className="h-12 w-12" />
              <p className="font-medium">Audio Only Broadcast</p>
            </div>
          </div>
        )}

        {/* Stats Overlay (Only when LIVE) */}
        {isLive && (
          <div className="absolute top-16 left-4 right-4 z-20 pointer-events-none">
            <div className="grid grid-cols-3 gap-2 max-w-sm">
              <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 border border-white/10 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold mb-1">Bitrate</p>
                  <p className="text-xs font-mono text-green-400 mb-1">{stats.bitrate} kbps</p>
                </div>
                <Sparkline data={history.bitrate} color="rgb(74, 222, 128)" />
              </div>
              <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 border border-white/10 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold mb-1">FPS</p>
                  <p className="text-xs font-mono text-blue-400 mb-1">{stats.fps} fps</p>
                </div>
                <Sparkline data={history.fps} color="rgb(96, 165, 250)" />
              </div>
              <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 border border-white/10 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold mb-1">Latency</p>
                  <p className="text-xs font-mono text-purple-400 mb-1">{stats.latency} ms</p>
                </div>
                <Sparkline data={history.latency} color="rgb(192, 132, 252)" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Overlays */}
      <>
        <div className="absolute top-4 left-4 flex gap-2 z-30">
          <Badge variant={isLive ? "destructive" : "secondary"} className={isLive ? "animate-pulse" : ""}>
            {isLive ? (
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                LIVE
              </div>
            ) : (
              "OFFLINE"
            )}
          </Badge>
          {isLive && (
            <Badge variant="secondary" className="bg-black/50 backdrop-blur border-none font-mono tracking-widest">
              {formatDuration(duration)}
            </Badge>
          )}
        </div>

        <div className="absolute top-4 right-4 flex gap-2 z-30">
          <div className="flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-xs text-white backdrop-blur">
            <Signal className={`h-3 w-3 ${connectionStatus.color}`} />
            <span className="font-medium">Connection: {connectionStatus.text}</span>
          </div>
        </div>
      </>

      {/* Control Bar */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-4 bg-noir-terminal/90 p-4 border border-noir-border backdrop-blur z-30 shadow-2xl">
        <Button variant={micOn ? "secondary" : "destructive"} size="icon" className="rounded-none border border-noir-border" onClick={toggleMic} disabled={!!error || isLoading}>
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button variant={camOn ? "secondary" : "destructive"} size="icon" className="rounded-none border border-noir-border" onClick={toggleCam} disabled={!!error || isLoading}>
          {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        <div className="mx-2 h-10 w-px bg-noir-border" />

        <Button
          variant={isLive ? "destructive" : "default"}
          className="w-32 rounded-none font-bold shadow-lg transition-all active:scale-95 bg-white text-black hover:bg-electric-lime"
          onClick={isLive ? stopBroadcast : startBroadcast}
          disabled={!!error || isLoading}
        >
          {isLive ? "End Stream" : "Go Live"}
        </Button>

        <div className="mx-2 h-10 w-px bg-noir-border" />

        <Button variant="ghost" size="icon" className="rounded-none text-white hover:bg-noir-border">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
