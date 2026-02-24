import { notFound } from "next/navigation";
import Link from "next/link";
import { VideoPlayer } from "@/features/video/components/VideoPlayer";
import { getClipById, getVideoClips } from "@/actions/clips";
import { Clock, PlayCircle, Sparkles } from "lucide-react";
import Image from "next/image";

export default async function ClipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clip = await getClipById(id);

  if (!clip) {
    notFound();
  }

  const isVideoPopulated = typeof clip.parentVideoId === "object" && clip.parentVideoId !== null;
  const parentVideo = isVideoPopulated ? (clip.parentVideoId as { _id: string; title: string }) : null;
  const parentTitle = parentVideo ? parentVideo.title : "Unknown Video";
  const parentId = parentVideo ? parentVideo._id : (clip.parentVideoId as string);

  const moreClips = parentId ? (await getVideoClips(parentId)).filter(c => c.clipId !== clip.clipId).slice(0, 4) : [];

  return (
    <div className="bg-black flex flex-col">
      <div className="max-w-[1400px] w-full mx-auto p-0 md:p-6 lg:p-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {/* Player container */}
          <div className="relative aspect-video w-full bg-noir-terminal shadow-[0_0_100px_rgba(0,0,0,1)] md:rounded-[40px] overflow-hidden md:border-t md:border-x border-white/5 ring-1 ring-white/5">
            <VideoPlayer videoId={clip.clipId} type="clip" posterUrl={clip.thumbnailResolvedUrl || undefined} videoUrl={clip.playableUrl} resolutions={["720p", "1080p"]} />
          </div>

          <div className="px-6 md:px-0 space-y-10">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] text-shadow-xl">
                {clip.title || `Highlight #${clip.clipId.slice(-4).toUpperCase()}`}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl">
                  <PlayCircle className="w-5 h-5 text-electric-lime" />
                  <span className="text-xs font-black uppercase text-white tracking-widest">{Intl.NumberFormat("en-US", { notation: "compact" }).format(clip.viewCount)} Views</span>
                </div>

                <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-black uppercase text-white tracking-widest">00:{Math.floor(clip.duration).toString().padStart(2, "0")} Sec</span>
                </div>

                <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mr-1">Clipped</span>
                  <span className="text-xs font-black uppercase text-white tracking-widest">{new Date(clip.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Signals detected */}
            <div className="flex items-center gap-4 py-8 border-y border-white/5">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] whitespace-nowrap">Source Logic</span>
              <div className="flex flex-wrap items-center gap-3">
                {!!clip.signals?.chat && (
                  <div className="flex items-center gap-2.5 bg-electric-lime/10 border border-electric-lime/20 px-4 py-2 rounded-xl">
                    <div className="w-2 h-2 bg-electric-lime rounded-full animate-pulse shadow-[0_0_12px_rgba(163,230,53,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-electric-lime">Chat Activity</span>
                  </div>
                )}
                {!!clip.signals?.audio && (
                  <div className="flex items-center gap-2.5 bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Vocal Spike</span>
                  </div>
                )}
                {!!clip.signals?.ocr && (
                  <div className="flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.4)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Action Detected</span>
                  </div>
                )}
                {!!clip.signals?.scene && (
                  <div className="flex items-center gap-2.5 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.4)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Scene Change</span>
                  </div>
                )}
                {(!clip.signals || Object.values(clip.signals).every(v => !v)) && (
                  <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                    <div className="w-2 h-2 bg-white/20 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Base Probability</span>
                  </div>
                )}
              </div>
            </div>

            {/* Related highlights Rail */}
            {moreClips.length > 0 && (
              <div className="space-y-6 pt-4 pb-20">
                <div className="flex items-center gap-3 px-1">
                  <Sparkles className="w-5 h-5 text-electric-lime" />
                  <h3 className="text-[11px] font-black tracking-[0.4em] text-white/50 uppercase">More Highlights from Session</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {moreClips.map(c => (
                    <Link key={c.clipId} href={`/clips/${c.clipId}`} className="group relative glasswork p-2 rounded-3xl hover:border-white/20 transition-all">
                      <div className="flex gap-4">
                        <div className="w-32 aspect-video bg-noir-terminal rounded-2xl overflow-hidden relative shrink-0 border border-white/5">
                          {c.thumbnailResolvedUrl && (
                            <Image src={c.thumbnailResolvedUrl} fill sizes="150px" className="object-cover opacity-60 group-hover:opacity-100 transition-all scale-100 group-hover:scale-110" alt="" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle className="w-8 h-8 text-electric-lime" />
                          </div>
                        </div>
                        <div className="min-w-0 pr-2 py-1 flex flex-col justify-center">
                          <h4 className="font-black text-xs text-white uppercase tracking-tight line-clamp-1 group-hover:text-electric-lime transition-colors leading-tight">
                            {c.title || `Highlight #${c.clipId.slice(-4)}`}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">00:{Math.floor(c.duration)}S</span>
                            <span className="text-[8px] font-black text-electric-lime uppercase tracking-widest">+{c.viewCount}V</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[360px] shrink-0">
          <div className="sticky top-24 space-y-8">
            <div className="bg-noir-terminal/40 border border-white/5 p-8 rounded-[40px] shadow-2xl ring-1 ring-white/5 backdrop-blur-3xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 blur-3xl -mr-16 -mt-16 group-hover:bg-electric-lime/10 transition-colors" />

              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-4 bg-electric-lime rounded-full" />
                <h3 className="text-[11px] font-black tracking-[0.4em] text-white/40 uppercase">Origin Archive</h3>
              </div>

              <Link href={`/watch/${parentId}`} className="group block">
                <div className="relative aspect-video bg-black/50 rounded-3xl overflow-hidden mb-6 border border-white/5 ring-1 ring-white/5 shadow-inner">
                  {clip.thumbnailResolvedUrl && (
                    <Image
                      src={clip.thumbnailResolvedUrl}
                      fill
                      sizes="360px"
                      className="object-cover opacity-50 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-105"
                      alt=""
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-all">
                    <PlayCircle className="w-20 h-20 text-white/20 group-hover:text-electric-lime transition-all duration-500 group-hover:scale-110 drop-shadow-2xl" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-black text-xl text-white leading-[1.1] group-hover:text-electric-lime transition-all uppercase tracking-tighter line-clamp-3">{parentTitle}</h4>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5 group-hover:border-electric-lime/20 transition-colors">
                    <span className="text-[10px] font-black text-muted-text uppercase tracking-widest group-hover:text-white transition-colors">Full Broadcast Terminal</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-electric-lime transition-all group-hover:text-black group-hover:translate-x-1">
                      <span className="text-sm font-black">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] text-center">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Broadcast ID: {clip.clipId.slice(-12)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
