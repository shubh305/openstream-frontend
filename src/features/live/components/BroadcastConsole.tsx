"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Video, VideoOff, Settings, Activity, Signal, Play, RotateCcw, X, Save } from "lucide-react";

/**
 * Simple SVG Sparkline Component
 */
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

/**
 * BroadcastConsole Component (WebRTC & Recording Version)
 */
export function BroadcastConsole() {
  const [isLive, setIsLive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Recording State
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // WebRTC Real-time Stats & History
  const [stats, setStats] = useState({
    bitrate: 0,
    fps: 0,
    latency: 0,
  });

  const [history, setHistory] = useState<{
    bitrate: number[];
    fps: number[];
    latency: number[];
  }>({
    bitrate: Array(30).fill(0),
    fps: Array(30).fill(0),
    latency: Array(30).fill(0),
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const pcSender = useRef<RTCPeerConnection>(null);
  const pcReceiver = useRef<RTCPeerConnection>(null);
  const statsInterval = useRef<NodeJS.Timeout>(null);
  const lastBytesReceived = useRef<number>(0);
  const lastTimestamp = useRef<number>(0);

  const stopBroadcast = () => {
    if (statsInterval.current) clearInterval(statsInterval.current);

    pcSender.current?.close();
    pcReceiver.current?.close();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    setIsLive(false);
    setStats({ bitrate: 0, fps: 0, latency: 0 });
  };

  const startBroadcast = async () => {
    if (!stream) return;

    lastBytesReceived.current = 0;
    lastTimestamp.current = performance.now();
    setRecordedVideoUrl(null);
    chunksRef.current = [];

    // 1. Initialize Recording
    try {
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
      recorder.ondataavailable = event => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
    } catch (e) {
      console.warn(e);
    }

    // 2. Initialize Peer Connections
    pcSender.current = new RTCPeerConnection();
    pcReceiver.current = new RTCPeerConnection();

    pcSender.current.onicecandidate = e => {
      if (e.candidate) pcReceiver.current?.addIceCandidate(e.candidate);
    };
    pcReceiver.current.onicecandidate = e => {
      if (e.candidate) pcSender.current?.addIceCandidate(e.candidate);
    };

    stream.getTracks().forEach(track => pcSender.current?.addTrack(track, stream));

    pcReceiver.current.ontrack = e => {
      if (videoRef.current) videoRef.current.srcObject = e.streams[0];
    };

    const offer = await pcSender.current.createOffer();
    await pcSender.current.setLocalDescription(offer);
    await pcReceiver.current.setRemoteDescription(offer);

    const answer = await pcReceiver.current.createAnswer();
    await pcReceiver.current.setLocalDescription(answer);
    await pcSender.current.setRemoteDescription(answer);

    setIsLive(true);

    statsInterval.current = setInterval(async () => {
      if (!pcReceiver.current) return;
      const statsReport = await pcReceiver.current.getStats();
      statsReport.forEach(report => {
        if (report.type === "inbound-rtp" && report.kind === "video") {
          const now = performance.now();
          const bytes = report.bytesReceived;
          const deltaBytes = bytes - lastBytesReceived.current;
          const deltaTime = (now - lastTimestamp.current) / 1000;
          const bitrate = Math.round((deltaBytes * 8) / (deltaTime * 1000));
          const fps = report.framesPerSecond || 0;
          const latency = Math.round(report.jitter * 1000) || 12;

          setStats({ bitrate: bitrate > 0 ? bitrate : 0, fps, latency });
          setHistory(prev => ({
            bitrate: [...prev.bitrate.slice(1), bitrate > 0 ? bitrate : 0],
            fps: [...prev.fps.slice(1), fps],
            latency: [...prev.latency.slice(1), latency],
          }));
          lastBytesReceived.current = bytes;
          lastTimestamp.current = now;
        }
      });
    }, 1000);
  };

  useEffect(() => {
    let mounted = true;
    async function initMedia() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
        if (mounted) {
          setStream(s);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError("Permission Error");
          setIsLoading(false);
        }
      }
    }
    initMedia();
    return () => {
      mounted = false;
      stopBroadcast();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream && !isLive) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isLive, recordedVideoUrl]);

  const toggleMic = () => {
    if (stream) stream.getAudioTracks()[0].enabled = !micOn;
    setMicOn(!micOn);
  };
  const toggleCam = () => {
    if (stream) stream.getVideoTracks()[0].enabled = !camOn;
    setCamOn(!camOn);
  };
  const handleDiscardPreview = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
      <div className="flex h-full items-center justify-center bg-neutral-900 relative">
        {!recordedVideoUrl && !isLoading && !error && <video ref={videoRef} autoPlay muted playsInline className={`h-full w-full object-cover ${!camOn ? "opacity-0" : "opacity-100"}`} />}

        {recordedVideoUrl && (
          <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <video src={recordedVideoUrl} controls autoPlay className="h-full w-full object-contain" />
            <Button className="absolute top-4 right-4" onClick={handleDiscardPreview}>
              <X />
            </Button>
          </div>
        )}

        {isLive && !recordedVideoUrl && (
          <div className="absolute top-16 left-4 right-4 z-20 pointer-events-none grid grid-cols-3 gap-2 max-w-sm">
            <div className="bg-black/60 rounded p-2">
              <p className="text-[10px] text-white/50">Bitrate</p>
              <p className="text-xs text-green-400">{stats.bitrate} kbps</p>
              <Sparkline data={history.bitrate} color="green" />
            </div>
            <div className="bg-black/60 rounded p-2">
              <p className="text-[10px] text-white/50">FPS</p>
              <p className="text-xs text-blue-400">{stats.fps} fps</p>
              <Sparkline data={history.fps} color="blue" />
            </div>
            <div className="bg-black/60 rounded p-2">
              <p className="text-[10px] text-white/50">Latency</p>
              <p className="text-xs text-yellow-400">{stats.latency} ms</p>
              <Sparkline data={history.latency} color="yellow" />
            </div>
          </div>
        )}
      </div>

      {!recordedVideoUrl && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-neutral-900/90 p-4 rounded-full border border-white/10 backdrop-blur z-30">
          <Button variant={micOn ? "secondary" : "destructive"} onClick={toggleMic}>
            <Mic />
          </Button>
          <Button variant={camOn ? "secondary" : "destructive"} onClick={toggleCam}>
            <Video />
          </Button>
          <Button variant={isLive ? "destructive" : "default"} onClick={isLive ? stopBroadcast : startBroadcast}>
            {isLive ? "End Stream" : "Go Live"}
          </Button>
        </div>
      )}
    </div>
  );
}
