import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatWatchTime(hours: number | string): string {
  const h = Number(hours);
  if (isNaN(h)) return "0s";

  if (h >= 1) {
    return `${h.toFixed(2)}H`;
  }

  const minutes = h * 60;
  if (minutes >= 1) {
    return `${minutes.toFixed(2)}M`;
  }

  const seconds = h * 3600;
  return `${seconds.toFixed(2)}S`;
}

export function formatMetric(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) return "0";

  if (num >= 1000) {
    return Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(num);
  }

  if (num % 1 !== 0) {
    return num.toFixed(2);
  }

  return num.toString();
}
