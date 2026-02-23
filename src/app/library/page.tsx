import { getUserPlaylists } from "@/actions/playlist";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ListPlus, Play, Clock, Heart } from "lucide-react";
import Image from "next/image";
import { CreatePlaylistButton } from "@/components/CreatePlaylistButton";

export default async function LibraryPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const playlists = await getUserPlaylists();

  return (
    <div className="p-6 md:p-10 space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Playlists</h1>
          <p className="text-muted-text mt-1">Manage your saved collections and watch history.</p>
        </div>
        <CreatePlaylistButton />
      </header>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/playlist?list=WL" className="group p-6 rounded-3xl bg-noir-terminal border border-white/5 hover:border-violet-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Watch Later</h3>
          <p className="text-xs text-muted-text mt-1">Saved for later</p>
        </Link>
        <div className="group p-6 rounded-3xl bg-noir-terminal border border-white/5 hover:border-signal-red/30 transition-all opacity-50">
          <div className="w-12 h-12 rounded-2xl bg-signal-red/10 flex items-center justify-center text-signal-red mb-4 group-hover:scale-110 transition-transform">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Liked Videos</h3>
          <p className="text-xs text-muted-text mt-1">Coming Soon</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Your Collections</h2>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-noir-terminal/20 rounded-3xl border border-dashed border-white/10">
            <ListPlus className="w-12 h-12 text-muted-text/20 mb-4" />
            <h3 className="text-lg font-bold text-white">No playlists yet</h3>
            <p className="text-muted-text text-sm mt-1 max-w-xs">Create your first playlist to organize your favorite content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <Link key={playlist.id} href={`/playlist?list=${playlist.id}`} className="group space-y-3">
                <div className="aspect-video relative rounded-2xl overflow-hidden bg-noir-terminal border border-white/5 shadow-2xl group-hover:border-electric-lime/40 transition-all">
                  {playlist.thumbnailUrl ? (
                    <Image src={playlist.thumbnailUrl} alt={playlist.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : playlist.videos && playlist.videos.length > 0 ? (
                    <Image src={playlist.videos[0].thumbnailUrl} alt={playlist.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ListPlus className="w-10 h-10 text-muted-text/20" />
                    </div>
                  )}
                  {/* Playlist Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-electric-lime text-black flex items-center justify-center scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 fill-black" />
                    </div>
                  </div>
                  {/* Video Count Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded-lg text-[10px] font-black text-white backdrop-blur-md border border-white/10">
                    {playlist.videoCount} VIDEOS
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-electric-lime transition-colors line-clamp-1">{playlist.title}</h4>
                  <p className="text-[10px] text-muted-text uppercase font-black tracking-widest mt-1">
                    {playlist.updatedAt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
