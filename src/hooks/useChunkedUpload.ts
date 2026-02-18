"use client";

import { useState, useCallback, useRef } from "react";
import * as tus from "tus-js-client";
import { API_BASE_URL } from "@/lib/constants";
import { getAccessToken } from "@/actions/auth";

export type ChunkedUploadStatus =
  | "idle"
  | "validating"
  | "uploading"
  | "paused"
  | "complete"
  | "error";

export interface ChunkedUploadState {
  status: ChunkedUploadStatus;
  progress: number; // 0-100
  bytesUploaded: number;
  bytesTotal: number;
  sessionId: string | null;
  videoId: string | null;
  error: string | null;
}

export interface UseChunkedUploadOptions {
  token?: string;
  chunkSizeMB?: number;
  parallelUploads?: number;
}

/**
 * Chunked upload hook using TUS protocol.
 * Handles server validation → TUS upload with progress tracking.
 */
export function useChunkedUpload(options: UseChunkedUploadOptions) {
  const { chunkSizeMB = 5, parallelUploads = 1 } = options;

  const [state, setState] = useState<ChunkedUploadState>({
    status: "idle",
    progress: 0,
    bytesUploaded: 0,
    bytesTotal: 0,
    sessionId: null,
    videoId: null,
    error: null,
  });

  const uploadRef = useRef<tus.Upload | null>(null);

  /**
   * Step 1: Validate file with backend and get a TUS session.
   */
  const validateWithServer = useCallback(
    async (file: File) => {
      // Ensure we hit the /api base even if NEXT_PUBLIC_API_URL doesn't include it
      const base = API_BASE_URL?.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;
      const res = await fetch(`${base}/vod-upload/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          sizeBytes: file.size,
          mimeType: file.type,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server validation failed (${res.status})`);
      }

      return res.json() as Promise<{
        sessionId: string;
        videoId: string;
        uploadUrl: string;
      }>;
    };,
    [],
  );

  /**
   * Step 2: Start TUS upload to the backend endpoint.
   */
  const startUpload = useCallback(
    async (file: File) => {
      setState((s) => ({
        ...s,
        status: "validating",
        error: null,
        progress: 0,
      }));

      try {
        const { sessionId, videoId } = await validateWithServer(file);

        setState((s) => ({
          ...s,
          sessionId,
          videoId,
          status: "uploading",
        }));

        // TUS upload
        const base = API_BASE_URL?.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;
        const upload = new tus.Upload(file, {
          endpoint: `${base}/vod-upload/tus`,
          chunkSize: chunkSizeMB * 1024 * 1024,
          retryDelays: [0, 1000, 3000, 5000, 10000],
          parallelUploads,
          metadata: {
            sessionId,
            filename: file.name,
            filetype: file.type,
          },
          headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
          },
          onProgress: (bytesUploaded: number, bytesTotal: number) => {
            const progress = Math.round((bytesUploaded / bytesTotal) * 100);
            setState(s => ({
              ...s,
              progress,
              bytesUploaded,
              bytesTotal,
            }));
          },
          onSuccess: () => {
            setState(s => ({
              ...s,
              status: "complete",
              progress: 100,
            }));
          },
          onError: (error: Error | tus.DetailedError) => {
            setState(s => ({
              ...s,
              status: "error",
              error: error.message || "Upload failed",
            }));
          },
          removeFingerprintOnSuccess: true,
        });

        uploadRef.current = upload;

        // Check for previous partial uploads to resume
        const prevUploads = await upload.findPreviousUploads();
        if (prevUploads.length > 0) {
          upload.resumeFromPreviousUpload(prevUploads[0]);
        }

        upload.start();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed";
        setState((s) => ({
          ...s,
          status: "error",
          error: message,
        }));
      }
    },
    [validateWithServer, chunkSizeMB, parallelUploads],
  );

  const pauseUpload = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      setState((s) => ({ ...s, status: "paused" }));
    }
  }, []);

  const resumeUpload = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.start();
      setState((s) => ({ ...s, status: "uploading" }));
    }
  }, []);

  const cancelUpload = useCallback(() => {
    if (uploadRef.current) {
      const canDeleteOnServer = 
        state.status === "uploading" || 
        state.status === "validating" || 
        state.status === "paused";

      uploadRef.current.abort(canDeleteOnServer);
      uploadRef.current = null;
    }

    setState({
      status: "idle",
      progress: 0,
      bytesUploaded: 0,
      bytesTotal: 0,
      sessionId: null,
      videoId: null,
      error: null,
    });
  }, [state.status]);

  return {
    ...state,
    startUpload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
  };
}
