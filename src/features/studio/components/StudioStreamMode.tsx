import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Radio, Eye, EyeOff, RefreshCw, Loader2, Square } from "lucide-react";
import { updateStreamSettings, getStreamKey, regenerateStreamKey, endStream } from "@/actions/stream";
import { RTMP_INGEST_URL } from "@/lib/constants";
import { StudioSettings, type StreamSettingsData } from "./StudioSettings";
import { toast } from "@/components/ui/sonner";

interface StudioStreamModeProps {
  isLive: boolean;
  settings: StreamSettingsData;
  isValid: boolean;
  onSettingsChange: (settings: StreamSettingsData) => void;
}

export function StudioStreamMode({ isLive, settings, isValid, onSettingsChange }: StudioStreamModeProps) {
  const [showKey, setShowKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [streamKey, setStreamKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
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
    <div className="h-full flex flex-col gap-6 relative">
      {/* Scrollable Content */}
      <div className="flex-1 space-y-6 pb-24">
        {/* Connection Status & Graphs */}
        <div className="bg-noir-bg border border-noir-border rounded-xl p-8 text-center relative overflow-hidden shadow-sm">
          {/* Live Graphs Overlay */}
          {isLive && (
            <div className="grid grid-cols-3 gap-4 mb-8 text-left animate-in fade-in zoom-in duration-500">
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

          <div
            className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border transition-colors ${isLive ? "border-signal-red bg-signal-red/10" : "border-electric-lime bg-electric-lime/5 border-dashed"}`}
          >
            <Radio className={`w-5 h-5 ${isLive ? "text-signal-red animate-pulse" : "text-electric-lime"}`} />
            <span className={`text-sm font-medium ${isLive ? "text-signal-red" : "text-electric-lime"}`}>{isLive ? "Receiving Video Signal" : "Ready to Connect"}</span>
          </div>

          {!isLive && (
            <>
              <h2 className="text-xl font-bold text-foreground mt-6 mb-2">Connect your encoder to go live</h2>
              <p className="text-sm text-muted-text max-w-md mx-auto mb-6">Copy your stream URL and key into OBS, Streamlabs, or any RTMP-compatible software</p>
            </>
          )}
        </div>

        {/* Stream Settings Form */}
        <StudioSettings settings={settings} onChange={onSettingsChange} disabled={isLive} className="shadow-sm" />

        {/* Stream Credentials */}
        <div className="grid gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Stream URL */}
          <div className="bg-noir-terminal border border-noir-border rounded-lg p-4 transition-colors hover:border-muted-text/20">
            <label className="text-xs text-muted-text uppercase tracking-wide mb-2 block font-bold">Stream URL</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <code className="flex-1 bg-noir-bg border border-noir-border rounded-lg px-4 py-3 text-sm text-foreground font-mono truncate select-all">{streamUrl}</code>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(streamUrl, "url")}
                className="shrink-0 h-11 px-6 sm:px-0 sm:w-11 rounded-lg flex items-center justify-center gap-2 sm:gap-0 hover:bg-electric-lime/10 hover:text-electric-lime"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-electric-lime" /> : <Copy className="w-4 h-4" />}
                <span className="sm:hidden text-xs font-bold uppercase transition-all">Copy URL</span>
              </Button>
            </div>
          </div>

          {/* Stream Key */}
          <div className="bg-noir-terminal border border-noir-border rounded-lg p-4 transition-colors hover:border-muted-text/20">
            <label className="text-xs text-muted-text uppercase tracking-wide mb-2 block font-bold">Stream Key</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center bg-noir-bg border border-noir-border rounded-lg px-4 py-3 h-11 overflow-hidden group focus-within:border-electric-lime">
                <code className="flex-1 text-sm text-foreground font-mono truncate select-all">{showKey ? streamKey : "••••••••••••••••••••"}</code>
                <button onClick={() => setShowKey(!showKey)} className="ml-2 text-muted-text hover:text-foreground transition-colors shrink-0">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(streamKey, "key")}
                  className="flex-1 sm:shrink-0 h-11 sm:w-11 rounded-lg flex items-center justify-center gap-2 sm:gap-0 hover:bg-electric-lime/10 hover:text-electric-lime"
                  title="Copy Key"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-electric-lime" /> : <Copy className="w-4 h-4" />}
                  <span className="sm:hidden text-xs font-bold uppercase">Copy</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRegenerateKey}
                  disabled={isRegenerating}
                  className="flex-1 sm:shrink-0 h-11 sm:w-11 rounded-lg border-signal-red/50 text-signal-red hover:bg-signal-red/10 flex items-center justify-center gap-2 sm:gap-0 transition-colors"
                  title="Regenerate Key"
                >
                  <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
                  <span className="sm:hidden text-xs font-bold uppercase">Reset</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="fixed bottom-6 left-0 right-0 px-6 sm:px-10 lg:sticky lg:bottom-0 lg:left-auto lg:right-auto lg:px-0 z-50">
        <div className="bg-noir-terminal/90 border border-noir-border backdrop-blur-xl p-4 rounded-2xl shadow-2xl ring-1 ring-white/5 mx-auto max-w-4xl lg:max-w-none">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
              <div className={`p-2 rounded-lg border shrink-0 transition-all duration-500 ${isLive ? "border-signal-red/50 bg-signal-red/10 animate-pulse" : "border-noir-border bg-noir-bg"}`}>
                <Radio className={`w-5 h-5 ${isLive ? "text-signal-red" : "text-muted-text"}`} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-muted-text uppercase font-bold tracking-widest hidden sm:block">Session Status</p>
                <p className={`text-sm sm:text-base font-bold truncate tracking-tight ${isLive ? "text-signal-red" : "text-foreground"}`}>
                  {isLive ? "LIVE BROADCAST ACTIVE" : "OFFLINE / SETUP MODE"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 shrink-0">
              {!isLive && (
                <Button onClick={handleSaveSettings} disabled={!isValid || isLoading} variant="outline" className="hidden sm:flex border-noir-border hover:bg-white/10 font-bold h-12 px-6 rounded-xl">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isLoading ? "Saving..." : "Save Settings"}
                </Button>
              )}

              {isLive ? (
                <Button
                  onClick={handleEndStream}
                  disabled={isEndingStream}
                  className="bg-noir-bg border-2 border-signal-red text-signal-red hover:bg-signal-red hover:text-white font-bold h-12 px-8 rounded-xl transition-all shadow-lg shadow-signal-red/10"
                >
                  {isEndingStream ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Square className="w-4 h-4 mr-2 fill-current" />}
                  {isEndingStream ? "Ending Session..." : "End Session"}
                </Button>
              ) : null}
            </div>
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
