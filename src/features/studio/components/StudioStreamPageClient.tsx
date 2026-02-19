"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Radio, Video } from "lucide-react";
import Link from "next/link";
import { LiveChat } from "@/features/chat/components/LiveChat";
import { StudioWebcamMode } from "@/features/studio/components/StudioWebcamMode";
import { StudioStreamMode } from "@/features/studio/components/StudioStreamMode";
import { type StreamSettingsData, type Visibility } from "@/features/studio/components/StudioSettings";
import { getMyStream } from "@/actions/stream";

type StudioMode = "webcam" | "stream";

interface StudioStreamPageClientProps {
  token?: string;
}

export function StudioStreamPageClient({ token }: StudioStreamPageClientProps) {
  const [streamId, setStreamId] = useState<string | null>(null);
  const [mode, setMode] = useState<StudioMode>("webcam");
  const [isLive, setIsLive] = useState(false);
  const [settings, setSettings] = useState<StreamSettingsData>({
    title: "",
    description: "",
    category: "Gaming",
    visibility: "public",
  });

  const [, setHasLoadedSettings] = useState(false);
  const isSettingsValid = settings.title.trim().length > 0;

  // Poll for live status
  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      const stream = await getMyStream();
      if (mounted && stream) {
        setStreamId(stream.id);
        const isActuallyLive = stream.status === "live";
        const isStarting = stream.status === "starting";

        setIsLive(prev => {
          if (isActuallyLive) return true;
          if (stream.status === "offline") return false;
          if (isStarting) {
            return prev;
          }
          return isActuallyLive;
        });

        setHasLoadedSettings(prev => {
          if (!prev) {
            const isActive = stream.status === "live" || stream.status === "starting";
            setSettings({
              title: isActive ? stream.title : "",
              description: isActive ? stream.description || "" : "",
              category: isActive ? stream.category || "Gaming" : "Gaming",
              visibility: isActive ? (stream.visibility as Visibility) || "public" : "public",
            });
            return true;
          }
          return prev;
        });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-noir-border bg-noir-terminal px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-text hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-foreground tracking-tight">Studio</h1>
          {isLive && (
            <span className="flex items-center gap-2 bg-signal-red px-3 py-1 rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="text-xs font-bold text-white uppercase">Live</span>
            </span>
          )}
        </div>
        {/* Mode Tabs */}
        <div className="flex items-center gap-1 bg-noir-bg p-1 rounded-lg border border-noir-border">
          <button
            onClick={() => setMode("webcam")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === "webcam" ? "bg-noir-terminal text-foreground border border-noir-border" : "text-muted-text hover:text-foreground"
            }`}
          >
            <Video className="w-4 h-4" />
            Webcam
          </button>
          <button
            onClick={() => setMode("stream")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === "stream" ? "bg-noir-terminal text-foreground border border-noir-border" : "text-muted-text hover:text-foreground"
            }`}
          >
            <Radio className="w-4 h-4" />
            Stream
          </button>
        </div>
        <div className="w-20" />
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left + Center: Preview + Settings */}
        <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
          {/* Mode-specific content */}
          {mode === "webcam" ? (
            <StudioWebcamMode isLive={isLive} setIsLive={setIsLive} settings={settings} setSettings={setSettings} isValid={isSettingsValid} />
          ) : (
            <StudioStreamMode isLive={isLive} settings={settings} isValid={isSettingsValid} onSettingsChange={setSettings} />
          )}
        </div>

        {/* Right Panel: Chat */}
        <div className="w-80 border-l border-noir-border bg-noir-terminal hidden lg:flex flex-col">
          <LiveChat streamId={streamId || "me"} token={token} />
        </div>
      </div>
    </div>
  );
}
