"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Video, VideoOff, Settings, Activity, Signal, Play, RotateCcw, X, Save } from "lucide-react";

/**
 * Simple SVG Sparkline Component
 */
function Sparkline({ data, color, height = 32 }: { data: number[], color: string, height?: number }) {
    if (data.length < 2) return <div style={{ height }} className="w-full" />;

    const max = Math.max(...data, 1);
    const min = 0;
    const range = max - min;
    const width = 100; // viewbox units

    // Create SVG path
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const normalizedY = (d - min) / range;
        const y = height - (normalizedY * height); // Invert Y because SVG 0 is top
        return `${x},${y}`;
    }).join(" ");

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8 overflow-visible" preserveAspectRatio="none">
            <polyline 
                fill="none" 
                stroke={color} 
                strokeWidth="2" 
                points={points} 
                vectorEffect="non-scaling-stroke"
            />
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
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * BroadcastConsole Component
 * 
 * The control center for creators during a live stream.
 * 
 * PRODUCTION-GRADE SIMULATION:
 * - Uses a Local WebRTC Loopback (PeerConnection A -> PeerConnection B)
 * - Monitors real-time stats (Bitrate, FPS) using the getStats() API
 * - Records the stream using MediaRecorder for post-broadcast preview
 */
export function BroadcastConsole() {
    const [isLive, setIsLive] = useState(false);
    const [duration, setDuration] = useState(0);
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

    // Dynamic Connection Quality Logic
    const getConnectionQuality = () => {
        if (!isLive) return { text: "Standby", color: "text-neutral-500" };
        
        // Simple heuristic: 
        // > 1.5 Mbps = Excellent
        // > 500 Kbps = Good
        // < 500 Kbps = Poor
        if (stats.bitrate > 1500) return { text: "Excellent", color: "text-green-500" };
        if (stats.bitrate > 500) return { text: "Good", color: "text-yellow-500" };
        return { text: "Poor", color: "text-red-500" };
    };

    const connectionStatus = getConnectionQuality();

    const stopBroadcast = () => {
        if (statsInterval.current) clearInterval(statsInterval.current);
        
        // Stop WebRTC
        pcSender.current?.close();
        pcReceiver.current?.close();

        // Stop Recording
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
             mediaRecorderRef.current.stop();
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
     * Start WebRTC Loopback Simulation
     * Mimics sending data to a server and receiving it back.
     */
    const startBroadcast = async () => {
        if (!stream) return;

        // Reset stats & Recording
        lastBytesReceived.current = 0;
        lastTimestamp.current = performance.now();
        setRecordedVideoUrl(null);
        chunksRef.current = [];
        setDuration(0);

        // 1. Initialize Recording
        try {
            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
            
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedVideoUrl(url);
            };

            recorder.start(100); // Collect chunks every 100ms
            mediaRecorderRef.current = recorder;
        } catch (e) {
            console.warn("MediaRecorder failed, likely duplicate invocation or unsupported codec", e);
        }

        // 2. Initialize Peer Connections
        pcSender.current = new RTCPeerConnection();
        pcReceiver.current = new RTCPeerConnection();

        // Ice Candidate Loopback (Production Mimicry)
        pcSender.current.onicecandidate = (e) => {
            if (e.candidate) pcReceiver.current?.addIceCandidate(e.candidate);
        };
        pcReceiver.current.onicecandidate = (e) => {
            if (e.candidate) pcSender.current?.addIceCandidate(e.candidate);
        };

        // Attach tracks from Camera to Sender
        stream.getTracks().forEach(track => {
            pcSender.current?.addTrack(track, stream);
        });

        // Handle Receiver's track (This is the "Live Broadcast" view)
        pcReceiver.current.ontrack = (e) => {
            if (videoRef.current) {
                videoRef.current.srcObject = e.streams[0];
            }
        };

        // Signaling Handshake (Local)
        const offer = await pcSender.current.createOffer();
        await pcSender.current.setLocalDescription(offer);
        await pcReceiver.current.setRemoteDescription(offer);

        const answer = await pcReceiver.current.createAnswer();
        await pcReceiver.current.setLocalDescription(answer);
        await pcSender.current.setRemoteDescription(answer);

        setIsLive(true);

        // Start Stats Polling (Production Ingest Monitoring)
        statsInterval.current = setInterval(async () => {
            if (!pcReceiver.current) return;
            const statsReport = await pcReceiver.current.getStats();
            
            statsReport.forEach(report => {
                if (report.type === 'inbound-rtp' && report.kind === 'video') {
                    const now = performance.now();
                    const bytes = report.bytesReceived;
                    const deltaBytes = bytes - lastBytesReceived.current;
                    const deltaTime = (now - lastTimestamp.current) / 1000;

                    // Calculate Bitrate (kbps)
                    const bitrate = Math.round((deltaBytes * 8) / (deltaTime * 1000));
                    const fps = report.framesPerSecond || 0;
                    const latency = Math.round(report.jitter * 1000) || 12; // Simulate consistent ms

                    setStats({
                        bitrate: bitrate > 0 ? bitrate : 0,
                        fps: fps,
                        latency: latency,
                    });

                    // Update History (keep last 30 points)
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

    // 1. Initialize Camera/Mic Media
    useEffect(() => {
        let mounted = true;
        let localStream: MediaStream | null = null;

        async function initMedia() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 }, // Force 720p for realistic stats
                    audio: true
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
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, []);

    // 2. Attach Local Preview
    useEffect(() => {
        if (videoRef.current && stream && !isLive) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, isLoading, isLive, recordedVideoUrl]);

    // 3. Timer Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLive) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
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

    const handleDiscardPreview = () => {
        if (recordedVideoUrl) {
            URL.revokeObjectURL(recordedVideoUrl);
            setRecordedVideoUrl(null);
        }
    };

    return (
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
            {/* Camera Preview / WebRTC Receiver View */}
            <div className="flex h-full items-center justify-center bg-neutral-900 relative">
                {/* 1. Error State */}
                {error && (
                    <div className="text-center text-red-500 p-4">
                        <p className="font-semibold">{error}</p>
                        <p className="text-sm">Please allow access in browser settings.</p>
                    </div>
                )}
                
                {/* 2. Loading State */}
                {isLoading && !error && (
                    <div className="flex flex-col items-center gap-2 text-neutral-500">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p>Initializing Studio...</p>
                    </div>
                )}

                {/* 3. Live Preview Video (Only visible if NOT revisiting a recording) */}
                {!recordedVideoUrl && !isLoading && !error && (
                    <video 
                        ref={videoRef}
                        autoPlay 
                        muted 
                        playsInline
                        className={`h-full w-full object-cover transition-opacity duration-500 ${!camOn ? 'opacity-0' : 'opacity-100'}`} 
                    />
                )}

                {/* 4. Stream Preview Overlay (Post-Broadcast) */}
                {recordedVideoUrl && (
                    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                            <Badge variant="outline" className="border-green-500 text-green-500 bg-green-500/10">
                                <Play className="h-3 w-3 mr-1 fill-current" /> Stream Recording
                            </Badge>
                        </div>

                        <video 
                            src={recordedVideoUrl} 
                            controls 
                            autoPlay 
                            className="h-full w-full object-contain"
                        />
                        
                         <div className="absolute top-4 right-4 z-10">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                className="shadow-lg backdrop-blur bg-white/90"
                                onClick={handleDiscardPreview}
                            >
                                <X className="h-4 w-4 mr-2" /> Close Preview
                            </Button>
                        </div>

                         <div className="absolute bottom-8 flex gap-4">
                            <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white" onClick={handleDiscardPreview}>
                                <RotateCcw className="h-4 w-4 mr-2" /> Discard
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                                <Save className="h-4 w-4 mr-2" /> Save to Library
                            </Button>
                         </div>
                    </div>
                )}


                {/* Camera Off Placeholder */}
                {isLive && !camOn && !recordedVideoUrl && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                         <div className="flex flex-col items-center gap-2 text-white/50">
                            <VideoOff className="h-12 w-12" />
                            <p className="font-medium">Audio Only Broadcast</p>
                        </div>
                    </div>
                )}
                
                {/* Stats Overlay (Only when LIVE) */}
                {isLive && !recordedVideoUrl && (
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
                                    <p className="text-xs font-mono text-yellow-400 mb-1">{stats.latency} ms</p>
                                </div>
                                <Sparkline data={history.latency} color="rgb(250, 204, 21)" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Overlays (Only when NOT previewing) */}
            {!recordedVideoUrl && (
                <>
                    <div className="absolute top-4 left-4 flex gap-2 z-30">
                        <Badge variant={isLive ? "destructive" : "secondary"} className={isLive ? "animate-pulse" : ""}>
                            {isLive ? (
                                <div className="flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    LIVE
                                </div>
                            ) : "OFFLINE"}
                        </Badge>
                        {isLive && <Badge variant="secondary" className="bg-black/50 backdrop-blur border-none font-mono tracking-widest">{formatDuration(duration)}</Badge>}
                    </div>

                     <div className="absolute top-4 right-4 flex gap-2 z-30">
                         <div className="flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-xs text-white backdrop-blur">
                            <Signal className={`h-3 w-3 ${connectionStatus.color}`} />
                            <span className="font-medium">Connection: {connectionStatus.text}</span>
                         </div>
                    </div>
                </>
            )}

            {/* Control Bar (Only when NOT previewing) */}
            {!recordedVideoUrl && (
                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-4 rounded-full bg-neutral-900/90 p-4 border border-white/10 backdrop-blur z-30">
                    <Button 
                        variant={micOn ? "secondary" : "destructive"} 
                        size="icon" 
                        className="rounded-full shadow-lg"
                        onClick={toggleMic}
                        disabled={!!error || isLoading}
                    >
                        {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                    
                    <Button 
                        variant={camOn ? "secondary" : "destructive"} 
                        size="icon" 
                        className="rounded-full shadow-lg"
                        onClick={toggleCam}
                        disabled={!!error || isLoading}
                    >
                        {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>

                    <div className="mx-2 h-10 w-px bg-white/20" />

                    <Button 
                        variant={isLive ? "destructive" : "default"}
                        className="w-32 rounded-full font-bold shadow-lg transition-all active:scale-95"
                        onClick={isLive ? stopBroadcast : startBroadcast}
                        disabled={!!error || isLoading}
                    >
                        {isLive ? "End Stream" : "Go Live"}
                    </Button>
                    
                     <div className="mx-2 h-10 w-px bg-white/20" />

                     <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20">
                        <Settings className="h-5 w-5" />
                     </Button>
                </div>
            )}
        </div>
    );
}
