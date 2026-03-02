import { getChannelAnalytics, getRealtimeStats, getTopContent, getEngagementAnalytics } from "@/actions/analytics";
import { EngagementChart } from "@/features/studio/components/EngagementChart";
import { MainPerformanceChart } from "@/features/studio/components/MainPerformanceChart";
import Image from "next/image";
import { cn, formatWatchTime, formatMetric } from "@/lib/utils";
import Link from "next/link";
import { StudioCard } from "@/features/studio/components/StudioCard";

interface AnalyticsPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const { period = "last28days" } = await searchParams;

  const [analytics, realtime, topContentRes, engagement] = await Promise.all([getChannelAnalytics(period), getRealtimeStats(), getTopContent(period), getEngagementAnalytics(period)]);

  const topContent = topContentRes?.videos || [];
  const overview = analytics?.overview || { views: 0, watchTimeHours: 0, subscribers: 0, subscriberChange: 0, avgViewDuration: "0:00" };
  const trends = analytics?.trends || { views: 0, watchTime: 0, subscribers: 0 };

  const periods = [
    { label: "7D", value: "last7days" },
    { label: "28D", value: "last28days" },
    { label: "Today", value: "today" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 p-4 md:p-8">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-electric-lime shadow-[0_0_12px_rgba(163,251,1,0.5)] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-electric-lime/80">Active Intel Feed</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
            Creator <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Studio</span>
          </h1>
          <p className="text-muted-text font-medium text-lg max-w-2xl">Advanced performance forensics for your digital footprint. Analyzing reach, retention, and viewer velocity.</p>
        </div>

        <div className="flex bg-noir-terminal border border-white/5 p-1 rounded-2xl backdrop-blur-3xl shadow-2xl">
          {periods.map(p => (
            <Link
              key={p.value}
              href={`/studio/analytics?period=${p.value}`}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                period === p.value ? "bg-electric-lime text-black shadow-[0_0_20px_rgba(163,251,1,0.3)]" : "text-muted-text hover:text-white hover:bg-white/5",
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Primary KPI Stream */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Reach",
            sublabel: "Views",
            value: formatMetric(overview.views),
            trend: `${trends.views > 0 ? "+" : ""}${formatMetric(trends.views)}%`,
            status: trends.views >= 0 ? "positive" : "negative",
          },
          {
            label: "Retention",
            sublabel: "Watch Duration",
            value: formatWatchTime(overview.watchTimeHours),
            trend: `${trends.watchTime > 0 ? "+" : ""}${formatMetric(trends.watchTime)}%`,
            status: trends.watchTime >= 0 ? "positive" : "negative",
          },
          {
            label: "Audience",
            sublabel: "Subscribers",
            value: formatMetric(overview.subscribers),
            trend: `${overview.subscriberChange >= 0 ? "+" : ""}${formatMetric(overview.subscriberChange)}`,
            status: overview.subscriberChange >= 0 ? "positive" : "negative",
          },
          {
            label: "Fidelity",
            sublabel: "Avg View Time",
            value: overview.avgViewDuration || "0:00",
            trend: "+12s",
            status: "positive",
          },
        ].map((item, i) => (
          <StudioCard key={i} variant="glass" padding="xl" className="group relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent duration-500">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-electric-lime/5 blur-[80px] group-hover:bg-electric-lime/10 transition-all duration-700" />

            <div className="flex items-start justify-between mb-8">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-muted-text uppercase tracking-widest">{item.label}</div>
                <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{item.sublabel}</div>
              </div>
              <div
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                  item.status === "positive" ? "text-electric-lime bg-electric-lime/10" : item.status === "negative" ? "text-signal-red bg-signal-red/10" : "text-muted-text bg-white/5",
                )}
              >
                {item.trend}
              </div>
            </div>

            <div className="text-6xl font-black text-white tracking-tighter group-hover:scale-105 origin-left transition-transform duration-500">{item.value}</div>
          </StudioCard>
        ))}
      </div>

      {/* Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <StudioCard
            title="Core Performance Chronograph"
            headerAction={<span className="text-[10px] text-muted-text font-bold uppercase tracking-widest">{analytics?.period === "today" ? "Hourly View Traffic" : "Daily Temporal Footprint"}</span>}
            variant="glass"
            padding="sm"
            rounded="full"
            className="shadow-2xl bg-noir-terminal/50 backdrop-blur-3xl"
          >
            <MainPerformanceChart data={analytics} />
          </StudioCard>
        </div>

        {/* Top Content */}
        <StudioCard
          title="High Impact"
          headerAction={<div className="w-1.5 h-1.5 rounded-full bg-electric-lime shadow-[0_0_8px_rgba(163,251,1,1)]" />}
          variant="glass"
          padding="xl"
          rounded="full"
          className="shadow-2xl relative overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent"
        >
          <div className="space-y-8 flex-1">
            {topContent.length === 0 ? (
              <div className="py-20 text-center text-muted-text text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Zero recorded impact sequences.</div>
            ) : (
              topContent.slice(0, 4).map((video: { id: string; title: string; views: number; thumbnailUrl?: string; avgViewDuration?: string }, i: number) => (
                <div key={video.id || i} className="flex items-center gap-6 group cursor-pointer">
                  <div className="relative">
                    <div className="w-24 aspect-video bg-noir-terminal rounded-2xl border border-white/5 overflow-hidden relative shrink-0 shadow-lg">
                      {video.thumbnailUrl && (
                        <Image src={video.thumbnailUrl} alt="" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-xl bg-noir-terminal border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40 group-hover:text-electric-lime group-hover:border-electric-lime/30 transition-all shadow-xl z-20">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-black text-white uppercase tracking-tight truncate group-hover:text-electric-lime transition-colors duration-300">
                      {video.title || "Untitled Sequence"}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white font-black leading-none">{formatMetric(video.views)}</span>
                        <span className="text-[7px] text-muted-text font-black uppercase tracking-widest mt-1">Impacts</span>
                      </div>
                      <div className="w-px h-6 bg-white/5" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-electric-lime font-black leading-none">{video.avgViewDuration || "0:00"}</span>
                        <span className="text-[7px] text-muted-text font-black uppercase tracking-widest mt-1">Dwell</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            href="/studio/content"
            className="block w-full py-4 rounded-2xl border border-white/5 text-center text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors mt-10"
          >
            View Complete Catalog
          </Link>
        </StudioCard>
      </div>

      {/* Realtime Summary Strip */}
      <StudioCard variant="glass" padding="xl" rounded="large" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-lime/[0.02] to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-4 text-center md:text-left relative z-10">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-2 h-2 rounded-full bg-signal-red animate-ping" />
              <div className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Synchronous Presence</div>
            </div>
            <div className="flex items-baseline gap-4 justify-center md:justify-start">
              <span className="text-8xl font-black text-white tracking-tighter leading-none">{realtime?.currentViewers || 0}</span>
              <span className="text-[10px] font-black text-muted-text uppercase tracking-[0.3em]">Active Observers</span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl w-full relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">
                {period === "today" ? "48-Hour Network Velocity" : `${period === "last7days" ? "7-Day" : "28-Day"} Temporal Magnitude`}
              </span>
              <div className="text-[9px] font-black text-electric-lime uppercase tracking-widest leading-none bg-electric-lime/10 px-3 py-1 rounded-full">
                {period === "today" ? "Automated Pulse" : "Historical Context"}
              </div>
            </div>
            <div className="h-24 flex items-end gap-1.5 px-6 py-4 rounded-3xl bg-white/[0.02] border border-white/5 shadow-inner">
              {(period === "today" ? realtime?.views48Hours || [] : analytics?.trend || []).map((d: { hour?: string; bucket?: string; views: number | string }, i: number) => {
                const dataPool = (period === "today" ? realtime?.views48Hours || [] : analytics?.trend || []) as { hour?: string; bucket?: string; views: number | string }[];
                const val = Number(d.views || 0);
                const maxVal = Math.max(...dataPool.map(x => Number(x.views || 0)), 1);
                const dateObj = new Date(d.hour || d.bucket || "");
                const formattedTime =
                  period === "today"
                    ? dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
                    : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                return (
                  <div
                    key={i}
                    className="flex-1 bg-electric-lime/20 rounded-t-sm transition-all duration-700 hover:bg-electric-lime/60 hover:h-full cursor-default relative group/bar"
                    style={{ height: `${Math.max((val / maxVal) * 100, 8)}%` }}
                  >
                    <div
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black text-white text-[7px] font-black rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-white/10",
                        val / maxVal > 0.4 ? "top-1" : "bottom-full mb-1",
                      )}
                    >
                      {formatMetric(val)} VIEW{val !== 1 ? "S" : ""} @ {formattedTime}
                    </div>
                  </div>
                );
              })}
              {((period === "today" && (!realtime?.views48Hours || realtime.views48Hours.length === 0)) || (period !== "today" && (!analytics?.trend || analytics.trend.length === 0))) && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-muted-text uppercase tracking-[0.4em] animate-pulse italic">
                  Negotiating Data Stream...
                </div>
              )}
            </div>
          </div>
        </div>
      </StudioCard>

      {/* Engagement & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
        {/* Social Engagement */}
        <StudioCard
          title="Social Resonance"
          headerAction={<span className="text-[10px] text-muted-text font-bold uppercase tracking-widest">Interaction Pulse</span>}
          variant="glass"
          padding="none"
          rounded="full"
          className="shadow-2xl bg-noir-terminal/50 backdrop-blur-3xl min-h-[400px]"
        >
          <div className="flex-1 flex flex-col justify-center">
            <EngagementChart data={engagement} />
          </div>
        </StudioCard>

        {/* Search */}
        <StudioCard
          title="Inbound Intelligence"
          headerAction={<span className="text-[10px] text-muted-text font-bold uppercase tracking-widest">Top Search Forensics</span>}
          variant="glass"
          padding="xl"
          rounded="full"
          className="shadow-2xl bg-noir-terminal/50 backdrop-blur-3xl min-h-[400px]"
        >
          <div className="space-y-4">
            {!engagement?.topSearches || engagement.topSearches.length === 0 ? (
              <div className="py-20 text-center text-muted-text text-[10px] font-black uppercase tracking-[0.3em] opacity-40">No search forensics recorded for this cycle.</div>
            ) : (
              engagement.topSearches.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[10px] font-black text-white/20 group-hover:text-electric-lime group-hover:bg-electric-lime/10 transition-all">
                      #{i + 1}
                    </div>
                    <span className="text-sm font-black text-white uppercase tracking-tight group-hover:translate-x-1 transition-transform">{s.query}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-white">{formatMetric(s.count)}</span>
                    <span className="text-[8px] font-black text-muted-text uppercase tracking-widest">Inquiries</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </StudioCard>
      </div>
    </div>
  );
}
