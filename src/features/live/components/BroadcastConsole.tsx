"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Video, VideoOff, Settings, Activity, Signal } from "lucide-react";

/**
 * BroadcastConsole Component (Basic Version)
 * 
 * Focus: Media Capture & Controls.
 */
export function BroadcastConsole() {
    const [isLive, setIsLive] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);

    // 1. Initialize Camera/Mic Media
    useEffect(() => {
        let mounted = true;
        let localStream: MediaStream | null = null;

        async function initMedia() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 },
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
            if (localStream) localStream.getTracks().forEach(track => track.stop());
        };
    }, []);

    // 2. Attach Local Preview
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

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
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
            <div className="flex h-full items-center justify-center bg-neutral-900 relative">
                {error && (
                    <div className="text-center text-red-500 p-4">
                        <p className="font-semibold">{error}</p>
                    </div>
                )}
                
                {isLoading && !error && (
                    <div className="flex flex-col items-center gap-2 text-neutral-500">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p>Initializing Studio...</p>
                    </div>
                )}

                {!isLoading && !error && (
                    <video 
                        ref={videoRef}
                        autoPlay 
                        muted 
                        playsInline
                        className={`h-full w-full object-cover ${!camOn ? 'opacity-0' : 'opacity-100'}`} 
                    />
                )}
            </div>

            <div className="absolute top-4 left-4 flex gap-2 z-30">
                <Badge variant={isLive ? "destructive" : "secondary"}>
                    {isLive ? "LIVE" : "OFFLINE"}
                </Badge>
            </div>

            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-4 rounded-full bg-neutral-900/90 p-4 border border-white/10 backdrop-blur z-30">
                <Button variant={micOn ? "secondary" : "destructive"} onClick={toggleMic}>
                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                
                <Button variant={camOn ? "secondary" : "destructive"} onClick={toggleCam}>
                    {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>

                <Button 
                    variant={isLive ? "destructive" : "default"}
                    onClick={() => setIsLive(!isLive)}
                >
                    {isLive ? "End Stream" : "Go Live"}
                </Button>
            </div>
        </div>
    );
}
