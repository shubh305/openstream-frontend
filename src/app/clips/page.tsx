import Link from "next/link";
import { getClips } from "@/actions/clips";
import { PlayCircle, Clock } from "lucide-react";
import Image from "next/image";

export default async function ClipsFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page as string, 10) : 1;
  const signal = (resolvedParams.signal as string) || "";

  const { data: clips, lastPage } = await getClips({ page, limit: 20, signal });

  return (
    <div className="min-h-screen bg-black px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Discovery Highlights</h1>
            <p className="text-muted-text max-w-2xl">
              Watch automatic, bite-sized highlight clips captured straight from OpenStream VODs.
            </p>
          </div>
        </div>

        {clips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-noir-terminal/30 rounded-2xl border border-white/5">
            <PlayCircle className="w-16 h-16 text-white/20 mb-4" />
            <h3 className="text-xl font-semibold text-white">No clips found</h3>
            <p className="text-muted-text mt-2 block">Check back later for new highlights.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {clips.map((clip) => (
                <Link
                  key={clip.clipId}
                  href={`/clips/${clip.clipId}`}
                  className="group flex flex-col gap-3 rounded-xl bg-noir-terminal/40 p-3 hover:bg-noir-terminal/80 transition-colors border border-transparent hover:border-white/10"
                >
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-black/50">
                    {clip.thumbnailResolvedUrl ? (
                      <Image
                        src={clip.thumbnailResolvedUrl}
                        alt={`Clip ${clip.clipId}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900 group-hover:scale-105 transition-transform duration-400">
                        <PlayCircle className="w-12 h-12 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <PlayCircle className="w-16 h-16 text-white shadow-xl" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 rounded text-xs font-medium text-white shadow-sm flex items-center gap-1 backdrop-blur-sm">
                      <Clock className="w-3 h-3" />
                      00:{Math.floor(clip.duration).toString().padStart(2, "0")}
                    </div>
                    
                    {/* Signals overlay */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {clip.signals?.chat && <div className="w-2.5 h-2.5 rounded-full bg-electric-lime shadow-[0_0_8px_rgba(204,255,0,0.8)]" title="High Chat Activity" />}
                      {clip.signals?.audio && <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" title="Audio Spike" />}
                      {clip.signals?.ocr && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" title="Key Action Read" />}
                    </div>
                  </div>
                  <div className="px-1">
                    <h3 className="font-bold text-white group-hover:text-electric-lime transition-colors">
                      {clip.title || `Highlight #${clip.clipId.slice(-4).toUpperCase()}`}
                    </h3>
                    <div className="text-sm text-muted-text mt-1 flex items-center justify-between">
                      {typeof clip.parentVideoId === "object" && clip.parentVideoId !== null && "title" in clip.parentVideoId ? (
                         <span className="truncate pr-4 border-l-2 border-electric-lime/40 pl-2 text-xs italic">
                           From: {(clip.parentVideoId as { title: string }).title}
                         </span>
                      ) : (
                         <span>OpenStream VOD</span>
                      )}
                      <span className="shrink-0">{Intl.NumberFormat("en-US", { notation: "compact" }).format(clip.viewCount)} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/clips?page=${page - 1}${signal ? `&signal=${signal}` : ""}`}
                    className="px-4 py-2 rounded-lg bg-noir-terminal text-white hover:bg-white/10 transition-colors"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-muted-text font-medium">
                  Page {page} of {lastPage}
                </span>
                {page < lastPage && (
                  <Link
                    href={`/clips?page=${page + 1}${signal ? `&signal=${signal}` : ""}`}
                    className="px-4 py-2 rounded-lg bg-noir-terminal text-white hover:bg-white/10 transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
