import { getPlaylist, getWatchLater, Playlist } from "@/actions/playlist";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlaylistView } from "@/components/PlaylistView";

export default async function PlaylistPage({ searchParams }: { searchParams: Promise<{ list: string }> }) {
  const { list } = await searchParams;

  if (!list) return <div className="p-10 text-white font-bold">Invalid Playlist</div>;

  return <PlaylistClient listId={list} />;
}

async function PlaylistClient({ listId }: { listId: string }) {
  const isWatchLater = listId === "WL";
  let initialPlaylist: Playlist | null = null;

  if (isWatchLater) {
    initialPlaylist = await getWatchLater();
    if (!initialPlaylist) {
      initialPlaylist = {
        id: "WL",
        title: "Watch Later",
        description: "Your watch later list",
        videoCount: 0,
        videos: [],
        updatedAt: "Just now",
        createdAt: new Date().toISOString(),
      };
    }
  } else {
    initialPlaylist = await getPlaylist(listId);
    if (!initialPlaylist) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <h1 className="text-2xl font-bold mb-2 text-white">Playlist Not Found</h1>
          <p className="text-muted-text">The playlist you are looking for does not exist or has been removed.</p>
          <Button asChild className="mt-6 bg-white text-black hover:bg-white/90 font-bold">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      );
    }
  }

  return <PlaylistView initialPlaylist={initialPlaylist} isWatchLater={isWatchLater} />;
}
