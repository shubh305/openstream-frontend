import { getPlaylist } from "@/actions/playlist";
import { Button } from "@/components/ui/button";
import { Play, Shuffle, MoreVertical, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StreamThumbnail } from "@/components/StreamThumbnail";


export default async function PlaylistPage({ searchParams }: { searchParams: Promise<{ list: string }> }) {
  const { list } = await searchParams;
  
  if (!list) return <div>Invalid Playlist</div>;

  const isWatchLater = list === "WL";
  let playlist = null;
  
  if (!isWatchLater) {
      playlist = await getPlaylist(list);
      if (!playlist) {
          return (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                  <h1 className="text-2xl font-bold mb-2">Playlist Not Found</h1>
                  <p className="text-muted-text">The playlist you are looking for does not exist or has been removed.</p>
                  <Button asChild className="mt-6"><Link href="/">Go Home</Link></Button>
              </div>
          );
      }
  } else {
      // Mock Watch Later for now to match Sidebar link
      playlist = { 
          id: "WL", 
          title: "Watch Later", 
          description: "Your watch later list", 
          videoCount: 0, 
          videos: [], 
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
      };
  }

  const videos = playlist.videos || [];

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Playlist Sidebar Info */}
      <div className="w-full lg:w-96 p-6 shrink-0 lg:fixed lg:h-[calc(100vh-4rem)] lg:overflow-y-auto bg-gradient-to-b from-noir-terminal to-background border-r border-noir-border z-10">
        <div className="aspect-video w-full bg-noir-bg rounded-xl mb-6 relative group overflow-hidden border border-noir-border shadow-2xl">
          {playlist.thumbnailUrl ? (
            <Image src={playlist.thumbnailUrl} alt={playlist.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-noir-terminal">
              <Play className="w-12 h-12 text-muted-text/30" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-4 line-clamp-2">{playlist.title}</h1>

        <div className="space-y-4 mb-6">
          <div className="text-sm font-medium text-electric-lime">{playlist.description || "Playlist"}</div>
          <div className="text-xs text-muted-text uppercase tracking-widest flex items-center gap-2">
            <span>{playlist.videoCount} videos</span>
            <span>•</span>
            <span>Updated {new Date(playlist.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 bg-white text-black hover:bg-electric-lime font-bold uppercase tracking-widest">
            <Play className="w-4 h-4 mr-2" /> Play All
          </Button>
          <Button variant="outline" className="flex-1 border-noir-border hover:bg-noir-bg text-muted-text hover:text-foreground font-bold uppercase tracking-widest">
            <Shuffle className="w-4 h-4 mr-2" /> Shuffle
          </Button>
        </div>
      </div>

      {/* Playlist Items */}
      <div className="flex-1 lg:ml-96 p-6">
        <div className="space-y-2">
          {videos.length === 0 ? (
            <div className="text-muted-text text-center py-10">No videos in this playlist yet.</div>
          ) : (
            videos.map((video, index) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}`}
                className="group flex gap-4 p-2 rounded-lg hover:bg-noir-terminal border border-transparent hover:border-noir-border transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center w-8 text-muted-text text-sm font-mono group-hover:hidden">{index + 1}</div>
                <div className="hidden group-hover:flex items-center justify-center w-8 text-muted-text">
                  <Play className="w-4 h-4 text-white" />
                </div>

                <div className="relative w-40 aspect-video bg-noir-bg rounded overflow-hidden shrink-0 border border-noir-border">
                  <StreamThumbnail
                    url={video.thumbnailUrl}
                    title={video.title}
                    avatarUrl={video.creator?.avatarUrl}
                    avatarFallback={(video.creator?.username || video.title || "V")[0].toUpperCase()}
                  />
                  <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 text-[10px] text-white font-medium rounded z-10">{video.duration || "00:00"}</div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-foreground truncate">{video.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-text mt-1">
                    <span>{video.creator?.username || "Unknown"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-text hover:text-white">
                    <X className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-text hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
