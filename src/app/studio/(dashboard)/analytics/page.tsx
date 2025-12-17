import { getChannelAnalytics, getRealtimeStats, getTopContent } from "@/actions/analytics";
import { RealtimeChart } from "@/features/studio/components/RealtimeChart";
import Image from "next/image";

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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Channel analytics</h1>
        <div className="text-sm font-medium text-electric-lime bg-electric-lime/10 px-4 py-2 rounded-full">
          Last 28 Days
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4 border-b border-noir-border pb-8">
        {[
          { label: "Views", value: Intl.NumberFormat("en-US", { notation: "compact" }).format(Number(overview.views)), sub: `${trends.views > 0 ? "+" : ""}${trends.views}% vs prev period` },
          { label: "Watch time (hours)", value: Intl.NumberFormat("en-US", { notation: "compact" }).format(Number(overview.watchTimeHours)), sub: `${trends.watchTime > 0 ? "+" : ""}${trends.watchTime}% vs prev period` },
          { label: "Subscribers", value: overview.subscribers, sub: `${overview.subscriberChange >= 0 ? "+" : ""}${overview.subscriberChange} in period` },
          { label: "Est. Revenue", value: "---", sub: "Not eligible" },
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-lg hover:bg-noir-terminal border border-transparent hover:border-noir-border transition-all cursor-pointer">
            <div className="text-sm text-muted-text">{item.label}</div>
            <div className="text-2xl font-bold text-foreground mt-2">{item.value}</div>
            <div className="text-xs text-muted-text mt-1">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Chart (Realtime) */}
      <RealtimeChart initialData={realtime} />

      {/* Top Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-noir-border rounded-lg p-6 bg-noir-terminal">
            <h3 className="text-lg font-medium text-foreground mb-4">Your top content in this period</h3>
            <div className="space-y-4">
                {topContent.length === 0 ? (
                    <div className="text-muted-text text-sm">No data available</div>
                ) : (
                    topContent.slice(0, 5).map((video: { id: string; title: string, views: number, thumbnailUrl?: string }, i: number) => (
                        <div key={video.id || i} className="flex items-center gap-4">
                            <div className="w-16 h-9 bg-noir-bg rounded border border-noir-border overflow-hidden relative">
                                {video.thumbnailUrl && <Image src={video.thumbnailUrl} alt="" fill className="object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-foreground truncate">{video.title || "Unknown Video"}</div>
                                <div className="text-xs text-muted-text">{video.views} views</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="border border-noir-border rounded-lg p-6 bg-noir-terminal">
            <h3 className="text-lg font-medium text-foreground mb-4">Realtime</h3>
            <div className="space-y-4">
                 <div className="text-4xl font-bold text-foreground">{realtime?.currentViewers || 0}</div>
                 <div className="text-sm text-muted-text">Subscribers see live counts</div>
                 <div className="h-px bg-noir-border my-4" />
                 <div className="text-sm font-medium text-foreground">Views • Last 48 hours</div>
                 <div className="h-32 flex items-end gap-0.5 opacity-50">
                    {/* Simplified mini-bar chart for sidebar */}
                    {(realtime?.views48Hours || []).slice(-20).map((d, i) => (
                         <div key={i} className="flex-1 bg-electric-lime" style={{ height: `${Math.min(d.views * 10, 100)}%` }} />
                    ))}
                    {(!realtime?.views48Hours || realtime.views48Hours.length === 0) && (
                        <div className="text-xs text-muted-text w-full text-center">No recent data</div>
                    )}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
