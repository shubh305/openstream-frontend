"use client";

import { useCallback } from "react";

/** Magic number signatures for common video containers */
const MAGIC_NUMBERS: Record<string, number[][]> = {
  mp4: [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
    [0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70],
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
  ],
  webm: [[0x1a, 0x45, 0xdf, 0xa3]],
  mkv: [[0x1a, 0x45, 0xdf, 0xa3]],
  avi: [[0x52, 0x49, 0x46, 0x46]],
  mov: [
    [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70],
    [0x6d, 0x6f, 0x6f, 0x76],
  ],
};

/** Flatten all magic arrays into a set for quick checking */
const ALL_SIGNATURES = Object.values(MAGIC_NUMBERS).flat();

const ALLOWED_EXTENSIONS = [".mp4", ".webm", ".mkv", ".avi", ".mov"];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface UseFileValidatorOptions {
  maxSizeBytes?: number;
}

/**
 * Client-side file validation hook.
 * Performs deep validation using magic number bytes
 */
export function useFileValidator(options?: UseFileValidatorOptions) {
  const maxSizeBytes =
    options?.maxSizeBytes ??
    parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_BYTES || "5368709120", 10);

  const validate = useCallback(
    async (file: File): Promise<FileValidationResult> => {
      // 1. Extension check
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return {
          valid: false,
          error: `Unsupported file type: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
        };
      }

      // 2. Size check
      if (file.size > maxSizeBytes) {
        const maxGB = (maxSizeBytes / (1024 * 1024 * 1024)).toFixed(1);
        return {
          valid: false,
          error: `File size exceeds maximum allowed (${maxGB} GB)`,
        };
      }

      // 3. Magic number validation (read first 12 bytes)
      try {
        const slice = file.slice(0, 12);
        const buffer = await slice.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        const isValidMagic = ALL_SIGNATURES.some((sig) =>
          sig.every((byte, i) => bytes[i] === byte),
        );

        // For MP4/MOV, also check for ftyp anywhere in first 12 bytes
        const hasFtyp =
          bytes[4] === 0x66 &&
          bytes[5] === 0x74 &&
          bytes[6] === 0x79 &&
          bytes[7] === 0x70;

        if (!isValidMagic && !hasFtyp) {
          return {
            valid: false,
            error:
              "File does not appear to be a valid video. The file header does not match any known video format.",
          };
        }
      } catch {
        return {
          valid: false,
          error: "Unable to read file for validation.",
        };
      }

      return { valid: true };
    },
    [maxSizeBytes],
  );

  return { validate, maxSizeBytes };
}
