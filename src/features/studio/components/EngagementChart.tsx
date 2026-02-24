"use client";

import { EngagementAnalytics } from "@/actions/analytics";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface EngagementChartProps {
  data?: EngagementAnalytics | null;
}

export function EngagementChart({ data }: EngagementChartProps) {
  const trend = useMemo(() => data?.trend || [], [data]);
  const period = data?.period || "last28days";

  const max = useMemo(() => {
    if (trend.length === 0) return 100;
    const peak = Math.max(...trend.map(p => p.comments + p.likes + p.shares), 1);
    return peak;
  }, [trend]);

  const labels = useMemo(() => {
    if (trend.length === 0) return [];
    
    if (period === "today") {
      return trend.filter((_, i) => i % 6 === 0).map(p => ({
        index: trend.indexOf(p),
        label: new Date(p.bucket).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      }));
    }

    if (period === "last7days") {
      return trend.map((p, i) => ({
        index: i,
        label: new Date(p.bucket).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
    }

    // 28 days
    return trend.filter((_, i) => i % 5 === 0).map(p => ({
      index: trend.indexOf(p),
      label: new Date(p.bucket).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [trend, period]);

  return (
    <div className="relative h-[340px] w-full p-6 flex flex-col justify-end">
      {/* Grid Lines */}
      <div className="absolute inset-x-0 bottom-[60px] top-6 px-6 flex flex-col justify-between pointer-events-none opacity-20">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="w-full h-px border-b border-dashed border-white/20" />
        ))}
      </div>

      <div className="flex items-end gap-2 h-[240px] relative z-10 px-2">
        {trend.length > 0 ? (
          trend.map((p, i) => {
            const total = p.likes + p.comments + p.shares;
            const h = (total / max) * 100;
            
            return (
              <div key={i} className="group relative flex-1 flex flex-col justify-end h-full">
                <div 
                  className="w-full rounded-t-sm overflow-hidden flex flex-col justify-end transition-all duration-500 group-hover:ring-2 group-hover:ring-white/20"
                  style={{ height: `${Math.max(h, 2)}%` }}
                >
                  {/* Stacked Bars */}
                  <div 
                    className="w-full bg-blue-500/40 relative group-hover:bg-blue-500/60 transition-colors"
                    style={{ height: `${(p.shares / (total || 1)) * 100}%` }}
                    title="Shares"
                  />
                  <div 
                    className="w-full bg-purple-500/50 relative group-hover:bg-purple-500/70 transition-colors border-t border-white/5"
                    style={{ height: `${(p.comments / (total || 1)) * 100}%` }}
                    title="Comments"
                  />
                  <div 
                    className="w-full bg-electric-lime/80 relative group-hover:bg-electric-lime transition-colors border-t border-white/5"
                    style={{ height: `${(p.likes / (total || 1)) * 100}%` }}
                    title="Likes"
                  />
                </div>
                
                {/* Smart Tooltip */}
                <div className={cn(
                  "absolute left-1/2 -translate-x-1/2 bg-noir-terminal border border-white/10 text-[10px] font-bold p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl min-w-[140px]",
                  h > 60 ? "top-4" : "bottom-full mb-4"
                )}>
                  <div className="text-white/40 uppercase text-[8px] tracking-[0.2em] font-black mb-2 border-b border-white/5 pb-2">
                    {new Date(p.bucket).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' })}
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-electric-lime" />
                        <span className="text-white/60 font-medium">Likes</span>
                      </div>
                      <span className="text-white font-black">{p.likes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span className="text-white/60 font-medium">Comments</span>
                      </div>
                      <span className="text-white font-black">{p.comments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-white/60 font-medium">Shares</span>
                      </div>
                      <span className="text-white font-black">{p.shares}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] animate-pulse">
              Observing Social Signals...
            </div>
          </div>
        )}
      </div>

      {/* X-Axis Labels */}
      <div className="relative h-6 mt-4 border-t border-white/5">
        {labels.map((l, i) => (
          <div 
            key={i} 
            className="absolute text-[8px] font-black text-white/20 uppercase tracking-widest -translate-x-1/2 pt-2 transition-colors hover:text-white/40"
            style={{ left: `${(l.index / (trend.length - 1)) * 100}%` }}
          >
            {l.label}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8 px-1 border-t border-white/5 pt-4">
        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Temporal Trace</span>
        <div className="flex gap-4">
           <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-electric-lime" />
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Likes</span>
           </div>
           <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-purple-500" />
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Comments</span>
           </div>
           <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-blue-500" />
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Shares</span>
           </div>
        </div>
      </div>
    </div>
  );
}
