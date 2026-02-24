"use client";

import { AnalyticsOverview } from "@/actions/analytics";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface MainPerformanceChartProps {
  data?: AnalyticsOverview | null;
}

export function MainPerformanceChart({ data }: MainPerformanceChartProps) {
  const trend = useMemo(() => data?.trend || [], [data]);
  const period = data?.period || "last28days";

  const max = useMemo(() => {
    if (trend.length === 0) return 100;
    return Math.max(...trend.map(p => Number(p.views)), 1);
  }, [trend]);

  const labels = useMemo(() => {
    if (trend.length === 0 || trend.length === 1) return [];
    
    if (period === "today") {
      // Show hours
      return trend.filter((_, i: number) => i % 6 === 0).map(p => ({
        index: trend.indexOf(p),
        label: new Date(p.bucket).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      }));
    }

    if (period === "last7days") {
      // Show every day
      return trend.map((p, i: number) => ({
        index: i,
        label: new Date(p.bucket).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
    }

    // 28 days
    return trend.filter((_, i: number) => i % 5 === 0).map(p => ({
      index: trend.indexOf(p),
      label: new Date(p.bucket).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [trend, period]);

  return (
    <div className="relative h-[400px] w-full p-8 flex flex-col justify-end">
      {/* Grid Lines */}
      <div className="absolute inset-x-0 bottom-[80px] top-8 px-8 flex flex-col justify-between pointer-events-none opacity-20">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="w-full h-px bg-white/10" />
        ))}
      </div>

      <div className="flex items-end gap-1.5 h-[260px] relative z-10 px-2">
        {trend.map((p, i: number) => {
          const h = (Number(p.views) / max) * 100;
          return (
            <div key={i} className="group relative flex-1 flex flex-col justify-end h-full">
               <div
                className={cn(
                  "w-full rounded-t-sm transition-all duration-700 bg-gradient-to-t from-electric-lime to-electric-lime/40",
                  "opacity-80 group-hover:opacity-100 group-hover:shadow-[0_0_20px_rgba(163,251,1,0.4)]",
                )}
                style={{
                  height: `${Math.max(h, 2)}%`,
                }}
              />
              {/* Smart Tooltip */}
              <div className={cn(
                "absolute left-1/2 -translate-x-1/2 bg-noir-terminal border border-white/10 text-[10px] font-bold p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl whitespace-nowrap",
                h > 60 ? "top-4" : "bottom-full mb-4"
              )}>
                <div className="text-white/40 uppercase text-[8px] tracking-[0.2em] font-black mb-1">
                  {new Date(p.bucket).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' })}
                </div>
                <div className="text-white font-black text-xs">
                  {p.views} Views
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* X-Axis Labels */}
      <div className="relative h-6 mt-6 border-t border-white/5">
        {labels.map((l: { index: number, label: string }, i: number) => (
          <div 
            key={i} 
            className="absolute text-[9px] font-black text-white/20 uppercase tracking-widest -translate-x-1/2 pt-3 whitespace-nowrap"
            style={{ left: `${(l.index / Math.max(trend.length - 1, 1)) * 100}%` }}
          >
            {l.label}
          </div>
        ))}
      </div>

      {trend.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-white/5 px-8 py-4 rounded-3xl text-[10px] font-black text-electric-lime uppercase tracking-[0.4em] shadow-2xl">
            Initializing Chronograph...
          </div>
        </div>
      )}
    </div>
  );
}
