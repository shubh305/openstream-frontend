import { Button } from "@/components/ui/button";
import { Upload, Pencil, Video, BarChart2, Settings } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/actions/auth";
import { getChannelByHandle } from "@/actions/channel";
import { getVideos } from "@/actions/video";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default async function StudioDashboardPage() {
  const session = await getSession();
  const username = session?.user?.username;

  const [channel] = await Promise.all([
    username ? getChannelByHandle(username) : null,
  ]);
  
  let realLatestVideo = null;
  if (channel) {
     const v = await getVideos({ channelId: channel.id, limit: 1, sort: "latest" });
     if (v.videos.length > 0) realLatestVideo = v.videos[0];
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-electric-lime animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-electric-lime">Command Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase">Studio Overview</h1>
          <p className="text-muted-text font-medium">Analyze your growth, manage your content, and broadcast to the world.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/studio/stream">
            <Button className="h-14 px-8 bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-signal-red shadow-[0_0_10px_rgba(255,59,48,0.5)] animate-pulse" />
              Go Live
            </Button>
          </Link>
          <Link href="/upload">
            <Button className="h-14 px-8 bg-electric-lime text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all gap-3 shadow-2xl shadow-electric-lime/20">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Subscribers", value: channel?.subscriberCount || 0, trend: "+12%", color: "text-electric-lime" },
          { label: "Total Views", value: channel?.totalViews.toLocaleString() || 0, trend: "+5.4%", color: "text-white" },
          { label: "Video Count", value: channel?.videoCount || 0, trend: "Stable", color: "text-white" },
          { label: "Estimated Revenue", value: "—", trend: "N/A", color: "text-muted-text" },
        ].map((stat, i) => (
          <div key={i} className="glasswork border border-white/5 p-6 rounded-3xl hover:border-white/20 transition-all group">
            <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">{stat.label}</span>
            <div className="flex items-end justify-between mt-2">
              <div className={cn("text-3xl font-black tracking-tighter", stat.color)}>{stat.value}</div>
              <div className="text-[10px] font-bold text-electric-lime bg-electric-lime/10 px-2 py-1 rounded-full">{stat.trend}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Video Performance */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.4em] px-2">Primary Performance</h2>
          <div className="relative group rounded-[32px] overflow-hidden border border-white/5 bg-noir-terminal shadow-2xl transition-all hover:border-white/10">
            {realLatestVideo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative aspect-video md:aspect-auto">
                  <Image src={realLatestVideo.thumbnailUrl} alt={realLatestVideo.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent md:hidden" />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Latest Upload</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-between space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{realLatestVideo.title}</h3>
                    <p className="text-xs text-muted-text font-medium uppercase tracking-widest">Published {realLatestVideo.uploadedAt}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-2xl font-black text-white">{realLatestVideo.views.toLocaleString()}</div>
                      <div className="text-[9px] font-black text-muted-text uppercase tracking-widest mt-1">Total Views</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-2xl font-black text-white font-mono">{realLatestVideo.likes || 0}</div>
                      <div className="text-[9px] font-black text-muted-text uppercase tracking-widest mt-1">Likes</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <Link href={`/watch/${realLatestVideo.id}`} className="flex-1">
                      <Button className="w-full h-12 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-electric-lime transition-all">Go to Video</Button>
                    </Link>
                    <Link href="/studio/content">
                      <Button variant="outline" className="h-12 w-12 rounded-xl border-white/10 hover:bg-white/5 text-white">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 p-12">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                  <Video className="w-6 h-6 text-muted-text opacity-20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-black uppercase tracking-widest">No Active Broadcasts</h3>
                  <p className="text-sm text-muted-text max-w-xs mx-auto leading-relaxed">Your creative journey starts with your first upload. Ready to inspire the world?</p>
                </div>
                <Link href="/upload">
                  <Button className="mt-4 h-12 px-8 bg-electric-lime text-black font-black text-xs uppercase tracking-widest rounded-xl">Initialize Upload</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.4em] px-2">Growth Insight</h2>
            <div className="p-8 rounded-[32px] border border-white/5 bg-noir-terminal flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-electric-lime/20 flex items-center justify-center">
                  <span className="text-3xl font-black text-white">{channel?.subscriberCount || 0}</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-electric-lime border-4 border-noir-terminal flex items-center justify-center">
                  <BarChart2 className="w-2.5 h-2.5 text-black" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-white font-black uppercase tracking-widest text-sm">Audience Reach</h3>
                <p className="text-[10px] text-muted-text font-medium uppercase tracking-widest">Lifetime Loyalists</p>
              </div>
              <Link href="/studio/analytics" className="w-full">
                <Button variant="ghost" className="w-full text-electric-lime font-black text-[10px] uppercase tracking-widest hover:bg-electric-lime/10">
                  Full Forensics
                </Button>
              </Link>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.4em] px-2">System Logs</h2>
            <div className="p-6 rounded-[32px] border border-white/5 bg-noir-terminal space-y-4">
              {[
                { icon: Upload, title: "Last Upload", meta: "2h ago", color: "text-electric-lime" },
                { icon: Settings, title: "Theme Sync", meta: "System", color: "text-white" },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <log.icon className={cn("w-3.5 h-3.5", log.color)} />
                    </div>
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest group-hover:text-white transition-colors">{log.title}</span>
                  </div>
                  <span className="text-[9px] font-mono text-muted-text">{log.meta}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
