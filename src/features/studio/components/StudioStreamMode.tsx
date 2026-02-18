import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Radio, Eye, EyeOff, RefreshCw, Loader2, Play, Square } from "lucide-react";
import { updateStreamSettings, getStreamKey, regenerateStreamKey, goLive, endStream } from "@/actions/stream";
import { RTMP_INGEST_URL } from "@/lib/constants";
import type { StreamSettingsData } from "./StudioSettings";
import { toast } from "@/components/ui/sonner";
import { WIP_LIMITS } from "@/lib/wip-limits";

interface StudioStreamModeProps {
  isLive: boolean;
  settings: StreamSettingsData;
  isValid: boolean;
}

export function StudioStreamMode({ isLive, settings, isValid }: StudioStreamModeProps) {
  const [showKey, setShowKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [latency, setLatency] = useState<"normal" | "low" | "ultra">("low");
  const [streamKey, setStreamKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isStartingStream, setIsStartingStream] = useState(false);
  const [isEndingStream, setIsEndingStream] = useState(false);

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
    if (!isLive) return;

    const interval = setInterval(() => {
      const currentBitrate = Math.round(3500 + Math.random() * 500 - 250);
      const currentFps = Math.round(60 + Math.random() * 2 - 1);
      const currentLatency = Math.round(25 + Math.random() * 5);

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
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    if (!isLive) {
      setStats({ bitrate: 0, fps: 0, latency: 0 });
      setHistory({
        bitrate: Array(30).fill(0),
        fps: Array(30).fill(0),
        latency: Array(30).fill(0),
      });
    }
  }, [isLive]);

  useEffect(() => {
    // Fetch key on mount always
    async function initKey() {
      try {
        const keyData = await getStreamKey();
        if ("streamKey" in keyData && keyData.streamKey) {
          setStreamKey(keyData.streamKey);
        }
      } catch (e) {
        console.error("Failed to load stream key", e);
      }
    }
    initKey();
  }, []);

  const handleSaveSettings = async () => {
    if (!isValid) return;
    setIsLoading(true);

    try {
      await updateStreamSettings(settings);
      toast.success("Stream settings updated");
    } catch (error) {
      console.error("Failed to save settings", error);
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStream = async () => {
    if (!isValid) return;
    setIsStartingStream(true);
    try {
      await updateStreamSettings(settings);
      const res = await goLive();
      if (res && typeof res === "object" && "error" in res) {
        toast.error(res.error as string);
      } else {
        toast.success("Stream session initialized");
      }
    } catch (e) {
      toast.error("Failed to start stream" + e);
    } finally {
      setIsStartingStream(false);
    }
  };

  const handleEndStream = async () => {
    setIsEndingStream(true);
    try {
      const res = await endStream();
      if (res && typeof res === "object" && "error" in res) {
        toast.error(res.error as string);
      } else {
        toast.success("Stream session ended");
      }
    } catch (e) {
      toast.error("Failed to end stream" + e);
    } finally {
      setIsEndingStream(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!confirm("Are you sure? This will disconnect any current stream.")) return;
    setIsRegenerating(true);
    try {
      const keyData = await regenerateStreamKey();
      if ("streamKey" in keyData && keyData.streamKey) {
        setStreamKey(keyData.streamKey);
        toast.success("Stream key regenerated");
      } else {
        console.error("Regeneration failed:", keyData);
        toast.error("Failed to regenerate stream key");
      }
    } catch (error) {
      console.error("Failed to regenerate key", error);
      toast.error("An error occurred");
    } finally {
      setIsRegenerating(false);
    }
  };

  const streamUrl = RTMP_INGEST_URL || "";

  const copyToClipboard = async (text: string, type: "url" | "key") => {
    await navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Scrollable Content */}
      <div className="flex-1 space-y-6">
        {/* Connection Status & Graphs */}
        <div className="bg-noir-bg border border-noir-border rounded-xl p-8 text-center relative overflow-hidden">
          {/* Live Graphs Overlay */}
          {isLive && (
            <div className="grid grid-cols-3 gap-4 mb-8 text-left">
              <div className="bg-noir-terminal/50 p-3 rounded-lg border border-noir-border">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs uppercase tracking-widest text-muted-text font-bold">Bitrate</span>
                  <span className="text-sm font-mono text-electric-lime">{stats.bitrate} kbps</span>
                </div>
                <Sparkline data={history.bitrate} color="#a3e635" />
              </div>
              <div className="bg-noir-terminal/50 p-3 rounded-lg border border-noir-border">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs uppercase tracking-widest text-muted-text font-bold">FPS</span>
                  <span className="text-sm font-mono text-blue-400">{stats.fps}</span>
                </div>
                <Sparkline data={history.fps} color="#60a5fa" />
              </div>
              <div className="bg-noir-terminal/50 p-3 rounded-lg border border-noir-border">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs uppercase tracking-widest text-muted-text font-bold">Latency</span>
                  <span className="text-sm font-mono text-purple-400">{stats.latency} ms</span>
                </div>
                <Sparkline data={history.latency} color="#c084fc" />
              </div>
            </div>
          )}

          <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border ${isLive ? "border-signal-red bg-signal-red/10" : "border-noir-border bg-noir-terminal"}`}>
            <Radio className={`w-5 h-5 ${isLive ? "text-signal-red animate-pulse" : "text-muted-text"}`} />
            <span className={`text-sm font-medium ${isLive ? "text-signal-red" : "text-muted-text"}`}>{isLive ? "Receiving video from encoder" : "Waiting for encoder connection..."}</span>
          </div>

          {!isLive && (
            <>
              <h2 className="text-xl font-bold text-foreground mt-6 mb-2">Connect your encoder to go live</h2>
              <p className="text-sm text-muted-text max-w-md mx-auto mb-6">Copy your stream URL and key into OBS, Streamlabs, or any RTMP-compatible software</p>

              <Button onClick={handleSaveSettings} disabled={!isValid || isLoading} className="bg-noir-terminal border border-noir-border text-foreground hover:bg-white/10 font-bold px-8">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isLoading ? "Saving..." : "Save Stream Info"}
              </Button>
            </>
          )}
        </div>

        {/* Stream Credentials */}
        <div className="grid gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Stream URL */}
          <div className="bg-noir-terminal border border-noir-border rounded-lg p-4">
            <label className="text-xs text-muted-text uppercase tracking-wide mb-2 block">Stream URL</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <code className="flex-1 bg-noir-bg border border-noir-border rounded-lg px-4 py-3 text-sm text-foreground font-mono truncate">{streamUrl}</code>
              <Button variant="outline" onClick={() => copyToClipboard(streamUrl, "url")} className="shrink-0 h-11 px-6 sm:px-0 sm:w-11 rounded-lg flex items-center justify-center gap-2 sm:gap-0">
                {copiedUrl ? <Check className="w-4 h-4 text-electric-lime" /> : <Copy className="w-4 h-4" />}
                <span className="sm:hidden text-xs font-bold uppercase transition-all">Copy URL</span>
              </Button>
            </div>
          </div>

          {/* Stream Key */}
          <div className="bg-noir-terminal border border-noir-border rounded-lg p-4">
            <label className="text-xs text-muted-text uppercase tracking-wide mb-2 block">Stream Key</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center bg-noir-bg border border-noir-border rounded-lg px-4 py-3 h-11 overflow-hidden">
                <code className="flex-1 text-sm text-foreground font-mono truncate">{showKey ? streamKey : "••••••••••••••••••••"}</code>
                <button onClick={() => setShowKey(!showKey)} className="ml-2 text-muted-text hover:text-foreground transition-colors shrink-0">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(streamKey, "key")}
                  className="flex-1 sm:shrink-0 h-11 sm:w-11 rounded-lg flex items-center justify-center gap-2 sm:gap-0"
                  title="Copy Key"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-electric-lime" /> : <Copy className="w-4 h-4" />}
                  <span className="sm:hidden text-xs font-bold uppercase">Copy</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRegenerateKey}
                  disabled={isRegenerating}
                  className="flex-1 sm:shrink-0 h-11 sm:w-11 rounded-lg border-signal-red/50 text-signal-red hover:bg-signal-red/10 flex items-center justify-center gap-2 sm:gap-0"
                  title="Regenerate Key"
                >
                  <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
                  <span className="sm:hidden text-xs font-bold uppercase">Reset</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Latency Options */}
        {WIP_LIMITS.showStreamLatency && (
          <div className="bg-noir-terminal border border-noir-border rounded-lg p-4">
            <label className="text-xs text-muted-text uppercase tracking-wide mb-3 block">Stream Latency</label>
            <div className="flex gap-2">
              {[
                { id: "normal", label: "Normal", desc: "~15-30s delay" },
                { id: "low", label: "Low Latency", desc: "~5-10s delay" },
                { id: "ultra", label: "Ultra Low", desc: "~2-4s delay" },
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setLatency(option.id as typeof latency)}
                  className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                    latency === option.id ? "border-electric-lime bg-electric-lime/5" : "border-noir-border hover:border-muted-text"
                  }`}
                >
                  <span className={`text-sm font-medium block ${latency === option.id ? "text-foreground" : "text-muted-text"}`}>{option.label}</span>
                  <span className="text-xs text-muted-text">{option.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="sticky bottom-0 bg-noir-terminal/90 border border-noir-border backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-2xl z-20 mt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <div className={`p-2 rounded-lg border shrink-0 ${isLive ? "border-signal-red/50 bg-signal-red/5" : "border-noir-border bg-noir-bg"}`}>
              <Radio className={`w-4 h-4 sm:w-5 sm:h-5 ${isLive ? "text-signal-red animate-pulse" : "text-muted-text"}`} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-muted-text uppercase font-bold tracking-widest hidden sm:block">Session Status</p>
              <p className={`text-xs sm:text-sm font-bold truncate ${isLive ? "text-signal-red" : "text-muted-text"}`}>{isLive ? "LIVE_INGEST" : "OFFLINE"}</p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 shrink-0">
            {isLive ? (
              <Button
                onClick={handleEndStream}
                disabled={isEndingStream}
                className="bg-noir-bg border border-signal-red/50 text-signal-red hover:bg-signal-red hover:text-white font-bold h-10 sm:h-12 px-3 sm:px-8 rounded-lg sm:rounded-xl transition-all text-[11px] sm:text-sm"
              >
                {isEndingStream ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" /> : <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                <span className="hidden sm:inline">{isEndingStream ? "Ending Session..." : "End Session"}</span>
                <span className="sm:hidden">{isEndingStream ? "Ending..." : "End"}</span>
              </Button>
            ) : (
              <Button
                onClick={handleStartStream}
                disabled={isStartingStream || !isValid}
                className="bg-signal-red hover:bg-signal-red/90 text-white font-bold h-10 sm:h-12 px-4 sm:px-10 rounded-lg sm:rounded-xl text-xs sm:text-base shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all flex items-center"
              >
                {isStartingStream ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                <span className="hidden sm:inline">Start Session</span>
                <span className="sm:hidden">Start</span>
              </Button>
            )}
          </div>
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
