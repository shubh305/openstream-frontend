"use client";

import { RealtimeStats } from "@/actions/analytics";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface RealtimeChartProps {
    initialData?: RealtimeStats | null;
}

export function RealtimeChart({ initialData }: RealtimeChartProps) {
  const views48h = useMemo(() => initialData?.views48Hours || [], [initialData]);

  const displayData = useMemo(() => {
    if (views48h.length > 0) return views48h;
    return Array.from({ length: 48 }).map((_, i) => ({
      hour: i,
      views: 2 + Math.floor(Math.abs(Math.sin(i)) * 10),
    }));
  }, [views48h]);

  const max = Math.max(...displayData.map(d => Number(d.views)), 1);

  return (
    <div className="relative h-[400px] w-full p-8 flex flex-col justify-end">
      {/* Grid Lines */}
      <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none opacity-20">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="w-full h-px bg-white/10" />
        ))}
      </div>

      <div className="flex items-end gap-1.5 h-full relative z-10">
        {displayData.map((d, i) => (
          <div key={i} className="group relative flex-1 flex flex-col justify-end h-full">
            <div
              className={cn(
                "w-full rounded-t-lg transition-all duration-700 bg-gradient-to-t from-electric-lime to-electric-lime/40",
                views48h.length === 0 ? "opacity-20 grayscale" : "opacity-80 group-hover:opacity-100 group-hover:shadow-[0_0_20px_rgba(163,251,1,0.4)]",
              )}
              style={{
                height: `${(Number(d.views) / max) * 100}%`,
              }}
            />

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white text-black text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {d.views} Views
            </div>
          </div>
        ))}
      </div>

      {/* X-Axis labels */}
      <div className="relative h-6 mt-6 border-t border-white/5">
        {[0, 12, 24, 36, 47].map(hourIdx => {
          const divisor = Math.max(displayData.length - 1, 1);
          return (
            <div key={hourIdx} className="absolute text-[8px] font-black text-white/20 uppercase tracking-widest -translate-x-1/2 pt-2" style={{ left: `${(hourIdx / divisor) * 100}%` }}>
              {hourIdx === 47 ? "Now" : `-${48 - hourIdx}h`}
            </div>
          );
        })}
      </div>

      {!initialData && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-white/5 px-8 py-4 rounded-3xl text-[10px] font-black text-electric-lime uppercase tracking-[0.4em] shadow-2xl">
            Awaiting Sync...
          </div>
        </div>
      )}
    </div>
  );
}
