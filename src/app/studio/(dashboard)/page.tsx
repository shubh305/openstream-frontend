import { Button } from "@/components/ui/button";
import { Video, BarChart2, Eye, TrendingUp, Users, Clock, Plus, LayoutDashboard, Play } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/actions/auth";
import { getChannelByHandle } from "@/actions/channel";
import { getVideos } from "@/actions/video";
import { getChannelAnalytics, getRealtimeStats } from "@/actions/analytics";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { StudioCard } from "@/features/studio/components/StudioCard";

export default async function StudioDashboardPage() {
  const session = await getSession();
  const username = session?.user?.username;

  const [channel, analytics, realtime] = await Promise.all([username ? getChannelByHandle(username) : null, getChannelAnalytics("last28days"), getRealtimeStats()]);

  let realLatestVideo = null;
  if (channel) {
    const v = await getVideos({ channelId: channel.id, limit: 1, sort: "latest" });
    if (v.videos.length > 0) realLatestVideo = v.videos[0];
  }

  const stats = analytics?.overview || {
    views: "0",
    watchTimeHours: "0",
    subscribers: channel?.subscriberCount || 0,
    subscriberChange: 0,
    avgViewDuration: "0:00",
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-noir-terminal/40 border border-white/5 p-5 md:p-6 rounded-[2rem] backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl">
            <LayoutDashboard className="w-6 h-6 text-electric-lime" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Studio Dashboard</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1 h-1 rounded-full bg-electric-lime animate-pulse" />
              <p className="text-[10px] text-muted-text font-black uppercase tracking-[0.2em] opacity-60 line-clamp-1">{channel?.name} Command Center</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/studio/stream" className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              className="w-full h-12 px-6 border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/5 gap-3 group transition-all active:scale-95"
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-red"></span>
              </div>
              Go Live
            </Button>
          </Link>
          <Link href="/upload" className="flex-1 sm:flex-none">
            <Button className="w-full h-12 px-6 bg-electric-lime text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white transition-all active:scale-95 gap-2 shadow-xl shadow-electric-lime/10">
              <Plus className="w-4 h-4 stroke-[3]" />
              Create
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
        {/* Left Column: Latest Performance */}
        <div className="lg:col-span-4">
          <StudioCard
            title="Latest Content"
            headerAction={
              <Link href="/studio/content" className="text-[9px] font-black text-electric-lime uppercase tracking-widest hover:text-white transition-colors">
                View All
              </Link>
            }
            padding="none"
          >
            {realLatestVideo ? (
              <div className="flex flex-col h-full">
                <div className="relative aspect-video w-full shrink-0">
                  <Image src={realLatestVideo.thumbnailUrl} alt={realLatestVideo.title} fill className="object-cover transition-all duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                      <span className="text-[8px] font-black text-white uppercase tracking-widest">Newest</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-6 right-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter line-clamp-2 leading-[1.1]">{realLatestVideo.title}</h3>
                    <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest mt-1">Published {realLatestVideo.uploadedAt}</p>
                  </div>
                </div>

                <div className="p-8 space-y-8 bg-noir-terminal/40 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">Views</span>
                        <TrendingUp className="w-3 h-3 text-electric-lime" />
                      </div>
                      <div className="text-2xl font-black text-white">{realLatestVideo.views}</div>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[10px) font-black text-muted-text uppercase tracking-widest">Likes</span>
                      <div className="text-2xl font-black text-white">{realLatestVideo.likes || 0}</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href={`/watch/${realLatestVideo.id}`}>
                      <Button className="w-full h-12 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-electric-lime transition-all active:scale-95">
                        Deep Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/5">
                  <Video className="w-8 h-8 text-muted-text opacity-20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">No transmissions</h3>
                  <p className="text-[10px] text-muted-text max-w-[200px] mx-auto uppercase tracking-widest leading-relaxed opacity-50 font-bold">
                    Initialize your first broadcast to generate performance forensics.
                  </p>
                </div>
              </div>
            )}
          </StudioCard>
        </div>

        {/* Middle Column: Channel Analytics */}
        <div className="lg:col-span-5">
          <StudioCard title="Channel Forensics" padding="xl">
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5 text-left">
                    <div className="text-[10px] font-black text-muted-text uppercase tracking-widest opacity-60">Subscriber Base</div>
                    <div className="text-5xl font-black text-white tracking-tighter leading-none">{stats.subscribers}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="px-3 py-1 rounded-full bg-electric-lime/10 border border-electric-lime/20 flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-electric-lime" />
                      <span className="text-[10px] text-electric-lime font-black">{stats.subscriberChange > 0 ? `+${stats.subscriberChange}` : stats.subscriberChange}</span>
                    </div>
                    <span className="text-[8px] text-muted-text uppercase tracking-[0.2em] font-black">28D Variance</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10 pt-8 border-t border-white/5">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 text-muted-text mb-1">
                      <Eye className="w-3.5 h-3.5 opacity-40" />
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Gross Views</span>
                    </div>
                    <div className="text-2xl font-black text-white">{stats.views}</div>
                  </div>
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 text-muted-text mb-1">
                      <Clock className="w-3.5 h-3.5 opacity-40" />
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Watch Duration</span>
                    </div>
                    <div className="text-2xl font-black text-white">{stats.watchTimeHours}h</div>
                  </div>
                </div>

                <div className="space-y-4 pt-10 border-t border-white/5">
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Summary Insights</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/5 transition-all">
                      <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Retention Average</span>
                      <span className="text-xs font-black text-electric-lime">{stats.avgViewDuration}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/5 transition-all">
                      <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Platform Rank</span>
                      <span className="text-xs font-black text-white uppercase tracking-tighter">Verified Creator</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link href="/studio/analytics" className="block">
                  <Button
                    variant="ghost"
                    className="w-full h-14 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl border border-white/5 hover:bg-white hover:text-black transition-all active:scale-95"
                  >
                    Full Diagnostics
                  </Button>
                </Link>
              </div>
            </div>
          </StudioCard>
        </div>

        {/* Right Column: Real-time & Activity */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-6 md:gap-8">
          <div className="flex-1">
            <StudioCard title="Live Sensors" variant="glass" className="bg-noir-terminal/60 backdrop-blur-3xl">
              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-signal-red animate-pulse" />
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Active</span>
                    </div>
                    <span className="text-[9px] text-muted-text font-black uppercase tracking-[0.2em] opacity-40 italic">Real-time</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-5xl font-black text-white tracking-tighter leading-none">{realtime?.currentViewers || 0}</div>
                    <div className="text-[9px] text-muted-text font-black uppercase tracking-widest opacity-60 leading-relaxed">Global Watchers</div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">Velocity / 48H</div>
                    <TrendingUp className="w-3 h-3 text-electric-lime" />
                  </div>
                  <div className="flex items-end gap-1 h-14 px-1">
                    {(realtime?.views48Hours || []).slice(-15).map((p, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-electric-lime/20 rounded-t-sm hover:bg-electric-lime transition-all cursor-crosshair group relative"
                        style={{ height: `${Math.max(10, (p.views / Math.max(...(realtime?.views48Hours.map(v => v.views) || [1]))) * 100)}%` }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[8px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {p.views} VIEWS
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </StudioCard>
          </div>

          <div className="flex-1">
            <StudioCard title="Terminal Logs" padding="md">
              <div className="space-y-5">
                {[
                  { icon: Users, title: "New Follower", meta: "1h ago", color: "text-electric-lime" },
                  { icon: BarChart2, title: "Sensor Log OK", meta: "System", color: "text-white/40" },
                  { icon: Play, title: "Stream End", meta: "5h ago", color: "text-signal-red/60" },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:bg-white/[0.08] transition-all">
                        <log.icon className={cn("w-4 h-4", log.color)} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest group-hover:text-white transition-colors">{log.title}</span>
                        <span className="text-[8px] font-mono text-muted-text mt-0.5 opacity-50">{log.meta}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </StudioCard>
          </div>
        </div>
      </div>
    </div>
  );
}
