import { notFound } from "next/navigation";
import Link from "next/link";
import { VideoPlayer } from "@/features/video/components/VideoPlayer";
import { getClipById } from "@/actions/clips";
import { Clock, PlayCircle } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 max-w-[1200px] w-full mx-auto p-0 sm:p-4 lg:p-6 lg:py-8 flex flex-col md:flex-row gap-6 lg:gap-8">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Player container */}
          <div className="relative rounded-none sm:rounded-2xl overflow-hidden bg-noir-terminal aspect-video w-full shadow-2xl border border-white/5">
            <VideoPlayer
              videoId={clip.clipId}
              type="clip"
              posterUrl={clip.thumbnailResolvedUrl || undefined}
              videoUrl={clip.playableUrl}
              resolutions={["720p", "1080p"]}
            />
          </div>

          <div className="px-4 sm:px-0 space-y-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                {clip.title || `Highlight #${clip.clipId.slice(-4).toUpperCase()}`}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-text">
                <div className="flex items-center gap-1.5 bg-noir-terminal px-2.5 py-1 rounded-md border border-white/5">
                  <PlayCircle className="w-4 h-4" />
                  <span>{Intl.NumberFormat("en-US", { notation: "compact" }).format(clip.viewCount)} views</span>
                </div>
                
                <div className="flex items-center gap-1.5 bg-noir-terminal px-2.5 py-1 rounded-md border border-white/5">
                  <Clock className="w-4 h-4" />
                  <span>00:{Math.floor(clip.duration).toString().padStart(2, "0")}</span>
                </div>
                
                <div className="flex items-center gap-1.5 bg-noir-terminal px-2.5 py-1 rounded-md border border-white/5">
                  <span className="text-white/60">Clipped:</span>
                  <span className="text-white/90">{new Date(clip.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Signals detected */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-text font-medium mr-1 border-r border-white/10 pr-3 py-1">Auto-detected via:</span>
              {clip.signals?.chat && (
                <span className="text-[10px] font-bold tracking-wider uppercase text-black bg-electric-lime px-2 py-0.5 rounded shadow-[0_0_10px_rgba(204,255,0,0.2)]">
                  Chat Activity
                </span>
              )}
              {clip.signals?.audio && (
                <span className="text-[10px] font-bold tracking-wider uppercase text-white bg-purple-500 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  Audio Spike
                </span>
              )}
              {clip.signals?.ocr && (
                <span className="text-[10px] font-bold tracking-wider uppercase text-white bg-blue-500 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  Screen Action
                </span>
              )}
              {(!clip.signals?.chat && !clip.signals?.audio && !clip.signals?.ocr) && (
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/50 bg-white/10 px-2 py-0.5 rounded">
                  Algorithm Score
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-full md:w-[320px] lg:w-[360px] flex flex-col gap-4 px-4 sm:px-0">
          <div className="bg-noir-terminal/40 p-5 rounded-xl border border-white/5 shadow-lg">
            <h3 className="text-xs font-bold tracking-wider text-muted-text uppercase mb-4">Original Broadcast</h3>
            
            <Link href={`/watch/${parentId}`} className="group block">
              <div className="aspect-video bg-black/50 rounded-lg overflow-hidden relative mb-3 border border-white/5">
                {clip.thumbnailResolvedUrl ? (
                  <Image
                    src={clip.thumbnailResolvedUrl}
                    fill
                    sizes="256px"
                    className="object-cover group-hover:scale-105 transition-transform opacity-50"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full bg-noir-terminal flex items-center justify-center group-hover:scale-105 transition-transform" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                  <PlayCircle className="w-12 h-12 text-white/80 group-hover:text-electric-lime transition-colors" />
                </div>
              </div>
              
              <h4 className="font-semibold text-white leading-tight group-hover:text-electric-lime transition-colors line-clamp-2">
                {parentTitle}
              </h4>
              <p className="text-sm text-electric-lime/80 mt-1 block">Watch full video →</p>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
