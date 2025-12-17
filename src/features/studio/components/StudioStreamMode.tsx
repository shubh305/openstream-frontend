import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Radio, Eye, EyeOff, RefreshCw } from "lucide-react";
import { updateStreamSettings, getStreamKey, regenerateStreamKey } from "@/actions/stream";
import type { StreamSettingsData } from "./StudioSettings";

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
            if ('streamKey' in keyData && keyData.streamKey) {
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
        // Visual feedback only
    } catch (error) {
        console.error("Failed to save settings", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!confirm("Are you sure? This will disconnect any current stream.")) return;
    setIsRegenerating(true);
    try {
        const keyData = await regenerateStreamKey();
        if ('streamKey' in keyData && keyData.streamKey) {
            setStreamKey(keyData.streamKey);
            alert("Stream key updated successfully!");
        } else {
            console.error("Regeneration failed:", keyData);
            alert("Failed to regenerate stream key. The backend service may be unavailable.");
        }
    } catch (error) {
        console.error("Failed to regenerate key", error);
        alert("An error occurred while regenerating the key.");
    } finally {
        setIsRegenerating(false);
    }
  };

  const streamUrl = process.env.NEXT_PUBLIC_RTMP_URL || "rtmp://localhost:1935/live";

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
    <div className="space-y-6">
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

        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border ${
          isLive 
            ? "border-signal-red bg-signal-red/10" 
            : "border-noir-border bg-noir-terminal"
        }`}>
          <Radio className={`w-5 h-5 ${isLive ? "text-signal-red animate-pulse" : "text-muted-text"}`} />
          <span className={`text-sm font-medium ${isLive ? "text-signal-red" : "text-muted-text"}`}>
            {isLive ? "Receiving video from encoder" : "Waiting for encoder connection..."}
          </span>
        </div>
        
        {!isLive && (
          <>
            <h2 className="text-xl font-bold text-foreground mt-6 mb-2">
              Connect your encoder to go live
            </h2>
            <p className="text-sm text-muted-text max-w-md mx-auto mb-6">
              Copy your stream URL and key into OBS, Streamlabs, or any RTMP-compatible software
            </p>

            <Button 
                onClick={handleSaveSettings} 
                disabled={!isValid || isLoading}
                className="bg-electric-lime text-black hover:bg-electric-lime/90 font-bold"
            >
                {isLoading ? "Saving..." : "Save Stream Info"}
            </Button>
          </>
        )}
      </div>

      {/* Stream Credentials - Always Visible */}
      <div className="grid gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        {/* Stream URL */}
        <div className="bg-noir-terminal border border-noir-border rounded-lg p-4">
          <label className="text-xs text-muted-text uppercase tracking-wide mb-2 block">
            Stream URL
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-noir-bg border border-noir-border rounded-lg px-4 py-3 text-sm text-foreground font-mono truncate">
              {streamUrl}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(streamUrl, "url")}
              className="shrink-0 h-12 w-12 rounded-lg"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-electric-lime" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Stream Key */}
        <div className="bg-noir-terminal border border-noir-border rounded-lg p-4">
          <label className="text-xs text-muted-text uppercase tracking-wide mb-2 block">
            Stream Key
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-noir-bg border border-noir-border rounded-lg px-4 py-3">
              <code className="flex-1 text-sm text-foreground font-mono truncate">
                {showKey ? streamKey : "••••••••••••••••••••"}
              </code>
              <button
                onClick={() => setShowKey(!showKey)}
                className="ml-2 text-muted-text hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(streamKey, "key")}
              className="shrink-0 h-12 w-12 rounded-lg"
            >
              {copiedKey ? <Check className="w-4 h-4 text-electric-lime" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRegenerateKey}
              disabled={isRegenerating}
              className="shrink-0 h-12 w-12 rounded-lg border-signal-red/50 text-signal-red hover:bg-signal-red/10"
              title="Regenerate Key"
            >
               <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Latency Options */}
      <div className="bg-noir-terminal border border-noir-border rounded-lg p-4">
        <label className="text-xs text-muted-text uppercase tracking-wide mb-3 block">
          Stream Latency
        </label>
        <div className="flex gap-2">
          {[
            { id: "normal", label: "Normal", desc: "~15-30s delay" },
            { id: "low", label: "Low Latency", desc: "~5-10s delay" },
            { id: "ultra", label: "Ultra Low", desc: "~2-4s delay" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setLatency(option.id as typeof latency)}
              className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                latency === option.id
                  ? "border-electric-lime bg-electric-lime/5"
                  : "border-noir-border hover:border-muted-text"
              }`}
            >
              <span className={`text-sm font-medium block ${latency === option.id ? "text-foreground" : "text-muted-text"}`}>
                {option.label}
              </span>
              <span className="text-xs text-muted-text">{option.desc}</span>
            </button>
          ))}
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
  const width = 100; // viewbox units

  // Create SVG path
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const normalizedY = (d - min) / range;
      const y = height - normalizedY * height; // Invert Y because SVG 0 is top
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8 overflow-visible" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
