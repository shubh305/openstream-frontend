"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Loader2, Settings2 } from "lucide-react";
import { getIngestConfig, updateStreamSettings, goLive, endStream } from "@/actions/stream";
import { StudioSettings, type StreamSettingsData } from "./StudioSettings";

interface StudioWebcamModeProps {
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  settings: StreamSettingsData;
  setSettings: (settings: StreamSettingsData) => void;
  isValid: boolean;
}

const VideoPreview = memo(({ videoRef, camOn }: { videoRef: React.RefObject<HTMLVideoElement | null>; camOn: boolean }) => (
  <video
    ref={videoRef}
    autoPlay
    muted
    playsInline
    className={`h-full w-full object-cover transition-opacity duration-300 ${!camOn ? "opacity-0" : "opacity-100"}`}
  />
));
VideoPreview.displayName = "VideoPreview";

type WebcamStep = "SETUP" | "READY" | "LIVE";

export function StudioWebcamMode({ isLive, setIsLive, settings, setSettings, isValid }: StudioWebcamModeProps) {
  const [step, setStep] = useState<WebcamStep>("SETUP");

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLocallyBroadcasting, setIsLocallyBroadcasting] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const stopBroadcast = useCallback(async () => {
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      if (wsRef.current) {
        wsRef.current.close(1000, "Stream ended by user");
        wsRef.current = null;
      }

      await endStream();
    } catch (e) {
      console.error("Failed to cleanly end stream session:", e);
    } finally {
      setIsLive(false);
      setIsLocallyBroadcasting(false);
      setStep("READY");
    }
  }, [setIsLive, setIsLocallyBroadcasting, setStep]);

  // Stats for graphs
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

  useEffect(() => {
    if (!isLive && isLocallyBroadcasting) {
      stopBroadcast();
    }
  }, [isLive, isLocallyBroadcasting, stopBroadcast]);

  useEffect(() => {
    if (!isLocallyBroadcasting) return;

    const interval = setInterval(() => {
      const currentBitrate = Math.round(2500 + Math.random() * 500 - 250);
      const currentFps = Math.round(30 + Math.random() * 2 - 1);
      const currentLatency = Math.round(15 + Math.random() * 5);

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

      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocallyBroadcasting]);

  useEffect(() => {
    if (!isLocallyBroadcasting) {
      setStats({ bitrate: 0, fps: 0, latency: 0 });
      setHistory({
        bitrate: Array(30).fill(0),
        fps: Array(30).fill(0),
        latency: Array(30).fill(0),
      });
      setDuration(0);
    }
  }, [isLocallyBroadcasting]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Initialize media
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
      } catch {
        if (mounted) {
          setError("Could not access camera/microphone. Please check permissions.");
          setIsLoading(false);
        }
      }
    }

    initMedia();

    return () => {
      mounted = false;
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      if (wsRef.current) wsRef.current.close();
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    };
  }, []);

  // Attach preview
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isLoading]);

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

  const handleNextStep = () => {
    if (!isValid) return;
    setStep("READY");
  };

  const startBroadcast = async () => {
    if (!stream) return;
    if (!isValid) {
      setStep("SETUP");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const updateRes = (await updateStreamSettings(settings)) as { error?: string };
      if (updateRes.error) {
        throw new Error(updateRes.error);
      }

      await goLive();

      const config = await getIngestConfig();
      if (config.error || !config.url) {
        setError(typeof config.error === "string" ? config.error : "Failed to get stream config");
        setIsConnecting(false);
        return;
      }

      const ws = new WebSocket(config.url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[Studio] WebSocket connected");
        setIsLive(true);
        setIsLocallyBroadcasting(true);
        setIsConnecting(false);
        setStep("LIVE");

        const mimeTypes = ["video/webm;codecs=h264", "video/webm;codecs=vp8,opus", "video/webm"];
        const selectedMimeType = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || "";

        try {
          const recorder = new MediaRecorder(stream, {
            mimeType: selectedMimeType || undefined,
            videoBitsPerSecond: 1500000,
          });

          recorder.ondataavailable = event => {
            if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
              ws.send(event.data);
            }
          };

          recorder.onerror = e => {
            console.error("[Studio] MediaRecorder error:", e);
            setError("Encoder error");
            stopBroadcast();
          };

          recorder.start(1000);
          recorderRef.current = recorder;
        } catch (e) {
          console.error("[Studio] Failed to create MediaRecorder:", e);
          setError("Failed to start encoder");
          setIsLive(false);
          ws.close();
        }
      };

      ws.onerror = e => {
        console.error("[Studio] WebSocket error:", e);
      };

      ws.onclose = e => {
        console.log(`[Studio] WebSocket closed: ${e.code} ${e.reason}`);
        if (e.code !== 1000 && isLocallyBroadcasting) {
          setError(`Connection lost (${e.code})`);
        }
        setIsLive(false);
        setIsLocallyBroadcasting(false);
        setStep("READY");
      };
    } catch (e) {
      console.error("[Studio] Start broadcast exception:", e);
      setError("Failed to start broadcast");
      setIsConnecting(false);
    }
  };



  return (
    <div className="h-full flex flex-col gap-4 w-full mx-auto transition-all duration-300">
      {/* End Stream Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-noir-terminal border border-noir-border rounded-2xl p-8 shadow-2xl w-full max-w-sm mx-4 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-signal-red/10 border border-signal-red/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-foreground">End your stream?</h2>
              <p className="text-sm text-muted-text">Your stream will stop immediately and viewers will be disconnected.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-11" onClick={() => setShowEndConfirm(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 h-11 bg-signal-red hover:bg-signal-red/90 text-white font-bold"
                onClick={() => {
                  setShowEndConfirm(false);
                  stopBroadcast();
                }}
              >
                End Stream
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Container - Flex Grow to fill space */}
      <div className="flex-1 relative w-full bg-noir-bg border border-noir-border rounded-xl overflow-hidden group shadow-2xl min-h-[300px] md:min-h-0">
        {/* Loading State */}
        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-noir-terminal z-50">
            <Loader2 className="w-8 h-8 animate-spin text-muted-text" />
          </div>
        )}

        {/* Eror State (Full Overlay) */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-center p-4 bg-black/80 backdrop-blur-md z-50">
            <div>
              <p className="text-signal-red text-sm mb-4 font-bold">{error}</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Reload Studio
              </Button>
            </div>
          </div>
        )}

        {/* Video Element */}
        <div className={`transition-all duration-500 w-full h-full ${step === "SETUP" ? "blur-md scale-105 opacity-50" : "blur-0 scale-100 opacity-100"}`}>
          {!isLoading && !error && <VideoPreview videoRef={videoRef} camOn={camOn} />}
        </div>

        {/* Cam Off State */}
        {!camOn && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-text bg-black/50 p-4 rounded-xl backdrop-blur-sm">
              <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Camera Off</p>
            </div>
          </div>
        )}

        {/* SETUP OVERLAY: Form */}
        {step === "SETUP" && !isLoading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-2 md:p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-noir-terminal/95 border border-noir-border shadow-2xl rounded-2xl p-3 md:p-8 max-w-4xl w-full backdrop-blur-xl relative overflow-hidden flex flex-col max-h-[95%]">
              {/* Decorative glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-lime to-transparent opacity-50" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 md:mb-8 text-center tracking-tight shrink-0">Setup Your Stream</h2>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <StudioSettings settings={settings} onChange={setSettings} className="border-none bg-transparent p-0 shadow-none !space-y-6" />
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleNextStep}
                  disabled={!isValid}
                  className={`w-full font-bold h-14 text-base transition-all ${
                    isValid
                      ? "bg-electric-lime hover:bg-electric-lime/90 text-black shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.4)]"
                      : "bg-noir-border text-muted-text cursor-not-allowed"
                  }`}
                >
                  Next: Preview Stream
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* READY OVERLAY: Clean view */}
        {step === "READY" && !isLoading && !isConnecting && (
          <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-center items-center">{/* Clean video preview, controls at bottom */}</div>
        )}

        {/* LIVE OVERLAY: Stats */}
        {step === "LIVE" && (
          <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex gap-2">
                <div className="bg-signal-red/90 text-white px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold animate-pulse uppercase tracking-wider flex items-center gap-2 shadow-lg ring-1 ring-white/20 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  LIVE
                </div>
                <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-md text-[10px] md:text-xs font-mono text-white border border-white/10 shadow-lg">{formatDuration(duration)}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full sm:w-64 max-w-[280px]">
                <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 border border-white/10 flex flex-col justify-between h-14 shadow-lg shrink-0">
                  <div>
                    <p className="text-[7px] text-white/50 uppercase font-bold mb-0.5">Bitrate</p>
                    <p className="text-[9px] font-mono text-electric-lime italic">{stats.bitrate}</p>
                  </div>
                  <Sparkline data={history.bitrate} color="#a3e635" height={15} />
                </div>
                <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 border border-white/10 flex flex-col justify-between h-14 shadow-lg shrink-0">
                  <div>
                    <p className="text-[7px] text-white/50 uppercase font-bold mb-0.5">FPS</p>
                    <p className="text-[9px] font-mono text-blue-400 italic">{stats.fps}</p>
                  </div>
                  <Sparkline data={history.fps} color="#60a5fa" height={15} />
                </div>
                <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 border border-white/10 flex flex-col justify-between h-14 shadow-lg shrink-0">
                  <div>
                    <p className="text-[7px] text-white/50 uppercase font-bold mb-0.5">Latency</p>
                    <p className="text-[9px] font-mono text-purple-400 italic">{stats.latency}</p>
                  </div>
                  <Sparkline data={history.latency} color="#c084fc" height={15} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stream Info & Controls Bar - Fixed height at bottom */}
      <div className="shrink-0 space-y-4">
        {/* Stream Info Card - Visible in READY and LIVE */}
        {(step === "READY" || step === "LIVE") && (
          <div className="bg-noir-terminal/50 border border-noir-border rounded-xl p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight mb-1">{settings.title}</h1>
              <div className="flex items-center gap-2 md:gap-3 text-muted-text text-[10px] md:text-xs">
                <span className="flex items-center gap-1.5 bg-noir-bg px-2 py-0.5 rounded-full border border-noir-border">
                  <span className={`w-1.5 h-1.5 rounded-full ${settings.visibility === "public" ? "bg-electric-lime" : "bg-muted-text"}`} />
                  <span className="capitalize">{settings.visibility}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-noir-bg px-2 py-0.5 rounded-full border border-noir-border">{settings.category}</span>
              </div>
            </div>

            {step === "READY" && !isLoading && !isConnecting && (
              <Button variant="ghost" size="sm" onClick={() => setStep("SETUP")} className="text-muted-text hover:text-foreground shrink-0 h-8 text-[10px] md:text-xs">
                <Settings2 className="w-3.5 h-3.5 mr-2" />
                Edit Settings
              </Button>
            )}
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex items-center justify-between bg-noir-terminal/80 p-4 rounded-2xl border border-noir-border backdrop-blur-md shadow-lg">
          {/* Left: Device Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={micOn ? "secondary" : "destructive"}
              size="icon"
              onClick={toggleMic}
              className={`rounded-xl h-10 w-10 transition-all ${!micOn ? "bg-signal-red/10 text-signal-red border border-signal-red/20 hover:bg-signal-red/20" : "bg-noir-bg border border-noir-border text-foreground hover:bg-white/10"}`}
              title={micOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>

            <Button
              variant={camOn ? "secondary" : "destructive"}
              size="icon"
              onClick={toggleCam}
              className={`rounded-xl h-10 w-10 transition-all ${!camOn ? "bg-signal-red/10 text-signal-red border border-signal-red/20 hover:bg-signal-red/20" : "bg-noir-bg border border-noir-border text-foreground hover:bg-white/10"}`}
              title={camOn ? "Turn Camera Off" : "Turn Camera On"}
            >
              {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
          </div>

          {/* Center: Main Actions */}
          <div className="flex-1 flex justify-center px-2">
            {step === "READY" && !isLoading && !isConnecting && (
              <Button
                onClick={startBroadcast}
                className="w-full sm:w-auto bg-signal-red hover:bg-signal-red/90 text-white font-bold h-12 px-6 sm:px-10 rounded-xl text-sm sm:text-base shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all scale-100 hover:scale-105 active:scale-95"
              >
                Go Live
              </Button>
            )}

            {step === "LIVE" && (
              <Button
                onClick={() => setShowEndConfirm(true)}
                className="w-full sm:w-auto bg-noir-bg border border-signal-red/30 text-signal-red hover:bg-signal-red hover:text-white font-bold h-12 px-6 sm:px-8 rounded-xl transition-all"
              >
                End Stream
              </Button>
            )}

            {step === "SETUP" && <p className="text-muted-text text-[10px] md:text-sm font-medium uppercase tracking-widest text-center truncate px-2">Configure stream details</p>}
          </div>

          {/* Right: Spacer */}
          <div className="w-[88px]"></div>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return <div style={{ height }} className="w-full" />;

  const max = Math.max(...data, 1);
  const min = 0;
  const range = max - min;
  const width = 100;

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
