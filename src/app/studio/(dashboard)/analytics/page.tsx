import { getChannelAnalytics, getRealtimeStats, getTopContent } from "@/actions/analytics";
import { RealtimeChart } from "@/features/studio/components/RealtimeChart";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default async function AnalyticsPage() {
    const [analytics, realtime, topContentRes] = await Promise.all([
        getChannelAnalytics("last28days"),
        getRealtimeStats(),
        getTopContent("last28days"),
    ]);

    const topContent = topContentRes?.videos || [];

    const overview = analytics?.overview || { views: 0, watchTimeHours: 0, subscribers: 0, subscriberChange: 0 };
    const trends = analytics?.trends || { views: 0, watchTime: 0, subscribers: 0 };

    return (
      <div className="max-w-[1600px] mx-auto space-y-10 p-4 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-electric-lime animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-electric-lime">Growth Forensics</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase">Channel Intelligence</h1>
            <p className="text-muted-text font-medium">Real-time performance metrics and audience behavior analysis.</p>
          </div>
          <div className="text-[10px] font-black text-white bg-white/5 border border-white/10 px-6 py-3 rounded-2xl uppercase tracking-[0.2em] backdrop-blur-md">Cycle: Last 28 Days</div>
        </div>

        {/* Primary KPI Stream */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10 border-b border-white/5">
          {[
            {
              label: "Reach (Views)",
              value: Intl.NumberFormat("en-US", { notation: "compact" }).format(Number(overview.views)),
              trend: `${trends.views > 0 ? "+" : ""}${trends.views}%`,
              status: trends.views >= 0 ? "positive" : "negative",
            },
            {
              label: "Retention (Hours)",
              value: Intl.NumberFormat("en-US", { notation: "compact" }).format(Number(overview.watchTimeHours)),
              trend: `${trends.watchTime > 0 ? "+" : ""}${trends.watchTime}%`,
              status: trends.watchTime >= 0 ? "positive" : "negative",
            },
            {
              label: "Loyalty (Subs)",
              value: overview.subscribers,
              trend: `${overview.subscriberChange >= 0 ? "+" : ""}${overview.subscriberChange}`,
              status: overview.subscriberChange >= 0 ? "positive" : "negative",
            },
            { label: "Econ (Revenue)", value: "$—", trend: "RESTRICTED", status: "neutral" },
          ].map((item, i) => (
            <div key={i} className="glasswork border border-white/5 p-8 rounded-[32px] hover:border-white/20 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-electric-lime/5 blur-3xl -mr-10 -mt-10 group-hover:bg-electric-lime/10 transition-all" />
              <div className="text-[10px] font-black text-muted-text uppercase tracking-widest relative z-10">{item.label}</div>
              <div className="text-4xl font-black text-white mt-3 tracking-tighter relative z-10">{item.value}</div>
              <div
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest mt-2 px-2 py-0.5 rounded-full w-fit relative z-10",
                  item.status === "positive" ? "text-electric-lime bg-electric-lime/10" : item.status === "negative" ? "text-signal-red bg-signal-red/10" : "text-muted-text bg-white/5",
                )}
              >
                {item.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Data Visualization Section */}
        <div className="space-y-6">
          <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.4em] px-2">Temporal Engagement</h2>
          <div className="glasswork border border-white/5 p-2 md:p-6 rounded-[40px] shadow-2xl">
            <RealtimeChart initialData={realtime} />
          </div>
        </div>

        {/* Intelligence Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glasswork border border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">High Impact Content</h3>
              <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">Top Performers</span>
            </div>
            <div className="space-y-6">
              {topContent.length === 0 ? (
                <div className="py-20 text-center text-muted-text text-[10px] font-black uppercase tracking-[0.2em]">No impact data recorded.</div>
              ) : (
                topContent.slice(0, 5).map((video: { id: string; title: string; views: number; thumbnailUrl?: string }, i: number) => (
                  <div key={video.id || i} className="flex items-center gap-6 group">
                    <div className="w-24 aspect-video bg-noir-terminal rounded-2xl border border-white/5 overflow-hidden relative shrink-0">
                      {video.thumbnailUrl && <Image src={video.thumbnailUrl} alt="" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-electric-lime transition-colors">{video.title || "Untitled Sequence"}</div>
                      <div className="text-[10px] text-muted-text font-black uppercase tracking-[0.2em] mt-1">{video.views.toLocaleString()} Total Impressions</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glasswork border border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-electric-lime/5 blur-3xl -mr-32 -mt-32" />
            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Synchronous Reach</h3>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-signal-red animate-ping" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Live</span>
              </div>
            </div>
            <div className="space-y-8 relative z-10">
              <div className="space-y-1">
                <div className="text-7xl font-black text-white tracking-tighter">{realtime?.currentViewers || 0}</div>
                <div className="text-[10px] font-black text-muted-text uppercase tracking-widest">Active Observers</div>
              </div>

              <div className="space-y-4">
                <div className="text-[10px] font-black text-white uppercase tracking-widest opacity-40">System Velocity • Last 48H</div>
                <div className="h-40 flex items-end gap-1 px-4 py-8 rounded-3xl bg-white/5 border border-white/5 relative group">
                  {(realtime?.views48Hours || []).slice(-40).map((d, i) => (
                    <div key={i} className="flex-1 bg-electric-lime transition-all duration-500 hover:bg-white" style={{ height: `${Math.max(Math.min(d.views * 10, 100), 4)}%` }} />
                  ))}
                  {(!realtime?.views48Hours || realtime.views48Hours.length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-muted-text uppercase tracking-[0.3em]">Awaiting Data Stream</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
