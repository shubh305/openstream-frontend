import { search } from "@/actions/search";
import Image from "next/image";
import Link from "next/link";
import { SearchIcon, Users, Video as VideoIcon } from "lucide-react";
import { StreamCard } from "@/components/StreamCard";
import { SearchToggle } from "./_components/SearchToggle";
import { PlaylistAction } from "@/components/PlaylistAction";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { StudioCard } from "@/features/studio/components/StudioCard";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; ai?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const isAI = params.ai === "true";

  if (!query) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchIcon className="w-16 h-16 text-muted-text mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Search OpenStream</h1>
          <p className="text-muted-text">Enter a search term to find videos, channels, and live streams.</p>
        </div>
      </div>
    );
  }

  const results = await search(query, "all", isAI);
  const totalResults = results.videos.length + results.channels.length + results.streams.length;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12 mb-20 md:mb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12 noir-reveal">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight">
            Search results for <span className="text-white/40 italic">&ldquo;{query}&rdquo;</span>
          </h1>
          <p className="text-sm md:text-base text-muted-text font-medium">
            {totalResults} {totalResults === 1 ? "result" : "results"} found
          </p>
        </div>
        <div className="flex items-center">
          <SearchToggle />
        </div>
      </div>

      {totalResults === 0 ? (
        <div className="noir-reveal max-w-2xl mx-auto py-12">
          <StudioCard variant="glass" padding="xl" rounded="large" className="text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <SearchIcon className="w-8 h-8 text-muted-text" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">No results found</h2>
              <p className="text-muted-text px-8">Try different keywords or check your spelling. We couldn&apos;t find a match for &ldquo;{query}&rdquo;.</p>
            </div>
          </StudioCard>
        </div>
      ) : (
        <div className="space-y-16 md:space-y-24">
          {/* Live Streams Section */}
          {results.streams.length > 0 && (
            <section className="noir-reveal">
              <h2 className="flex items-center gap-3 text-[10px] md:text-xs font-black tracking-[0.2em] text-signal-red mb-6 uppercase">
                <div className="w-2 h-2 rounded-full bg-signal-red animate-pulse shadow-[0_0_8px_rgba(255,51,51,0.6)]" />
                Live Streams ({results.streams.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.streams.map(stream => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            </section>
          )}

          {/* Channels Section */}
          {results.channels.length > 0 && (
            <section className="noir-reveal" style={{ animationDelay: "0.1s" }}>
              <h2 className="flex items-center gap-3 text-[10px] md:text-xs font-black tracking-[0.2em] text-white/40 mb-6 uppercase">
                <Users className="w-4 h-4" />
                Channels ({results.channels.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.channels.map(channel => (
                  <Link key={channel.id} href={`/@${channel.handle}`} className="block active:scale-95 transition-transform touch-none">
                    <StudioCard variant="glass" padding="sm" rounded="default" className="hover:border-white/20">
                      <div className="flex items-center gap-5">
                        <div className="relative w-16 h-16 md:w-14 md:h-14 rounded-full overflow-hidden bg-noir-deep border border-white/10 shrink-0">
                          <Image
                            src={channel.avatarUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=${channel.handle}`}
                            alt={channel.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-110 duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base md:text-sm text-white truncate group-hover:text-white/80 transition-colors uppercase tracking-tight">{channel.name}</h3>
                          <p className="text-xs md:text-[11px] text-muted-text mt-0.5 font-medium">@{channel.handle}</p>
                          <p className="text-[10px] text-muted-text/50 font-black tracking-widest uppercase mt-2">
                            {Intl.NumberFormat("en-US", { notation: "compact" }).format(channel.subscriberCount)} Fans
                          </p>
                        </div>
                      </div>
                    </StudioCard>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Videos Section */}
          {results.videos.length > 0 && (
            <section className="noir-reveal" style={{ animationDelay: "0.2s" }}>
              <h2 className="flex items-center gap-3 text-[10px] md:text-xs font-black tracking-[0.2em] text-white/40 mb-6 uppercase">
                <VideoIcon className="w-4 h-4" />
                Videos ({results.videos.length})
              </h2>
              <div className="flex flex-col gap-8 md:gap-6">
                {results.videos.map(video => (
                  <Link
                    key={video.id}
                    href={`/watch/${video.id}`}
                    className="flex flex-col sm:flex-row gap-6 md:gap-8 p-4 md:p-2 -m-4 md:-m-2 rounded-2xl hover:bg-white/5 transition-all duration-500 group active:scale-[0.98] sm:active:scale-100"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full sm:w-80 sm:min-w-[20rem] aspect-video rounded-2xl overflow-hidden bg-noir-deep border border-white/5 glass-border shadow-lg shadow-black/20">
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                      />
                      {video.duration && (
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md z-20 glass-border font-bold text-[10px] text-white tracking-widest uppercase">
                          {video.duration}
                        </div>
                      )}

                      {/* Playlist Action */}
                      <div className="absolute top-3 right-3 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlaylistAction videoId={video.id} />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col gap-3 md:gap-2 py-1 flex-1">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-bold text-lg md:text-base text-white line-clamp-2 md:line-clamp-1 group-hover:text-white/90 transition-colors leading-snug md:leading-tight">
                            {video.title}
                          </h3>
                          {video.isSemantic && (
                            <Badge variant="outline" className="text-[10px] font-black h-5 border-white/10 text-white bg-white/5 gap-1.5 shrink-0 px-2 tracking-widest rounded-full">
                              <Sparkles className="w-3 h-3 text-electric-lime" />
                              MATCH
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-sm md:text-xs text-muted-text font-bold">
                          <span className="hover:text-white transition-colors">{video.creator.username}</span>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span>{Intl.NumberFormat("en-US", { notation: "compact" }).format(video.views)} views</span>
                          <span className="w-1 h-1 rounded-full bg-white/10 hidden sm:block" />
                          <span className="hidden sm:block">{video.uploadedAt}</span>
                        </div>
                      </div>

                      {video.isSemantic && video.matchedExcerpt && (
                        <div className="space-y-4 mt-2">
                          <div className="relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-4 md:p-3">
                            <div className="text-[12px] md:text-[11px] leading-relaxed text-white/60 font-medium italic line-clamp-3 md:line-clamp-2">
                              &ldquo;...{video.matchedExcerpt.replace(/<[^>]*>/g, "")}...&rdquo;
                            </div>
                          </div>

                          {video.keyMoments && video.keyMoments.length > 0 && (
                            <div className="flex flex-wrap gap-2 md:gap-1.5">
                              {video.keyMoments.slice(0, 3).map((moment, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 px-3 py-1.5 md:px-2 md:py-1 rounded-lg bg-electric-lime/10 border border-electric-lime/20 text-[11px] md:text-[10px] text-electric-lime font-bold tracking-tight active:scale-95 transition-transform"
                                >
                                  <span className="opacity-80">
                                    {typeof moment.time === "number" ? Math.floor(moment.time / 60) + ":" + (moment.time % 60).toString().padStart(2, "0") : moment.time}
                                  </span>
                                  <span className="truncate max-w-[150px] md:max-w-[120px]">{moment.description}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
