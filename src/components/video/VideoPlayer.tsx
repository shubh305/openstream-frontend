'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { CRTContainer } from './CRTContainer';

interface VideoPlayerProps {
  streamKey?: string;
  poster?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ streamKey, poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamKey) return;

    const host = process.env.NEXT_PUBLIC_STREAM_HOST;
    const src = `${host}/live/${streamKey}/index.m3u8`;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
         // System ready
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
           setError("Connection Failed: Stream Offline");
           setIsPlaying(false);
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari)
      video.src = src;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [streamKey]);

  return (
    <CRTContainer isPlaying={isPlaying}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        controls={false}
        poster={poster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
            setIsPlaying(false);
            setError("Stream Error");
        }}
      />
      {error && !isPlaying && (
         <div className="absolute top-4 left-4 text-red-500 font-mono text-xs bg-black/50 p-1">
            [ERR] {error}
         </div>
      )}
    </CRTContainer>
  );
};
