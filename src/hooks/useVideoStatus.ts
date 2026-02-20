"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface VideoStatusUpdate {
  status: string;
  hlsManifest?: string;
  thumbnailUrl?: string;
  duration?: number;
  resolutions?: string[];
  vttUrl?: string;
  error?: string;
}

/**
 * Hook for real-time VOD pipeline status updates via WebSocket.
 * Connects to `/ws/vod-status` and subscribes to updates for a specific videoId.
 */
export function useVideoStatus(videoId: string | null) {
  const [update, setUpdate] = useState<VideoStatusUpdate | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (!videoId) return;

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || window.location.origin.replace(/^http/, "ws");
    const cleanBaseUrl = wsUrl.replace(/\/$/, "");
    
    try {
      const ws = new WebSocket(`${cleanBaseUrl}/ws/vod-status`);
      
      ws.onopen = () => {
        setConnected(true);
        ws.send(JSON.stringify({ type: "subscribe", videoId }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as {
            type: string;
            videoId: string;
          } & VideoStatusUpdate;

          if (msg.type === "status" && msg.videoId === videoId) {
            setUpdate({
              status: msg.status,
              hlsManifest: msg.hlsManifest,
              thumbnailUrl: msg.thumbnailUrl,
              duration: msg.duration,
              resolutions: msg.resolutions,
              vttUrl: msg.vttUrl,
              error: msg.error,
            });
          }
        } catch {
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectRef.current();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("WebSocket connection error:", err);
    }
  }, [videoId]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; 
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { update, connected };
}
