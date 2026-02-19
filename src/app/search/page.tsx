import { search } from "@/actions/search";
import Image from "next/image";
import Link from "next/link";
import { SearchIcon, Users, Video as VideoIcon, Radio } from "lucide-react";
import { StreamCard } from "@/components/StreamCard";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

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

  const results = await search(query);
  const totalResults = results.videos.length + results.channels.length + results.streams.length;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Search results for &ldquo;{query}&rdquo;</h1>
        <p className="text-muted-text">
          {totalResults} {totalResults === 1 ? "result" : "results"} found
        </p>
      </div>

      {totalResults === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchIcon className="w-12 h-12 text-muted-text mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">No results found</h2>
          <p className="text-muted-text">Try different keywords or check your spelling.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Live Streams Section */}
          {results.streams.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold tracking-widest text-signal-red mb-4 uppercase">
                <Radio className="w-4 h-4 animate-pulse" />
                Live Streams ({results.streams.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.streams.map(stream => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            </section>
          )}

          {/* Channels Section */}
          {results.channels.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold tracking-widest text-muted-text mb-4">
                <Users className="w-4 h-4" />
                Channels ({results.channels.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.channels.map(channel => (
                  <Link
                    key={channel.id}
                    href={`/@${channel.handle}`}
                    className="flex items-center gap-4 p-4 rounded-lg border border-noir-border bg-noir-terminal hover:border-electric-lime transition-colors group"
                  >
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-noir-bg border border-noir-border">
                      <Image src={channel.avatarUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=${channel.handle}`} alt={channel.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate group-hover:text-electric-lime transition-colors">{channel.name}</h3>
                      <p className="text-sm text-muted-text">@{channel.handle}</p>
                      <p className="text-xs text-muted-text">{Intl.NumberFormat("en-US", { notation: "compact" }).format(channel.subscriberCount)} subscribers</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Videos Section */}
          {results.videos.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold tracking-widest text-muted-text mb-4">
                <VideoIcon className="w-4 h-4" />
                Videos ({results.videos.length})
              </h2>
              <div className="space-y-4">
                {results.videos.map(video => (
                  <Link key={video.id} href={`/watch/${video.id}`} className="flex flex-col sm:flex-row gap-4 p-2 -m-2 rounded-lg hover:bg-noir-terminal/50 transition-colors group">
                    {/* Thumbnail */}
                    <div className="relative w-full sm:w-64 sm:min-w-[16rem] aspect-video rounded-lg overflow-hidden bg-noir-terminal">
                      <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      {video.duration && <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs font-medium text-white">{video.duration}</div>}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col gap-2 py-1">
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-electric-lime transition-colors">{video.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-text">
                        <span>{video.creator.username}</span>
                        <span>•</span>
                        <span>{Intl.NumberFormat("en-US", { notation: "compact" }).format(video.views)} views</span>
                        <span>•</span>
                        <span>{video.uploadedAt}</span>
                      </div>
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
