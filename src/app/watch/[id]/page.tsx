import { getVideo, getRelatedVideos } from "@/actions/video";
import { getComments } from "@/actions/comment";
import { getSession } from "@/actions/auth";
import { notFound } from "next/navigation";
import { getChannelByHandle } from "@/actions/channel";
import { getSubscriptions } from "@/actions/subscription";
import { getVideoClips } from "@/actions/clips";
import { getPlaylist } from "@/actions/playlist";
import { WatchClient } from "@/features/video/components/WatchClient";

export default async function WatchPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ list?: string; shuffle?: string }> }) {
  const { id } = await params;
  const { list, shuffle } = await searchParams;

  const [video, recommendations, comments, session, clips, playlist] = await Promise.all([
    getVideo(id),
    getRelatedVideos(id),
    getComments(id),
    getSession(),
    getVideoClips(id),
    list ? getPlaylist(list) : Promise.resolve(null),
  ]);

  if (!video) {
    notFound();
  }

  let channelId = "";
  let isOwner = false;
  let initialIsSubscribed = video.userInteraction?.subscribed || false;

  try {
    const channel = await getChannelByHandle(video.creator.username);
    if (channel) {
      channelId = channel.id;
      isOwner = session?.user?.id === channel.userId;

      if (channel.isSubscribed) {
        initialIsSubscribed = true;
      } else if (session && !initialIsSubscribed) {
        const subs = await getSubscriptions();
        if (subs.some(s => s.channelId === channel.id)) {
          initialIsSubscribed = true;
        }
      }
    }
  } catch (e) {
    console.error("Failed to fetch channel for video", e);
  }

  return (
    <WatchClient
      video={video}
      recommendations={recommendations}
      comments={comments}
      session={session}
      clips={clips}
      playlist={playlist}
      isShuffle={shuffle === "1"}
      channelId={channelId}
      isOwner={isOwner}
      initialIsSubscribed={initialIsSubscribed}
    />
  );
}
