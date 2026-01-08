import { getChannelByHandle } from "@/actions/channel";
import { getLiveStreams } from "@/actions/stream";
import { getVideos } from "@/actions/video";
import { getChannelPlaylists } from "@/actions/playlist";
import { getSubscriptions } from "@/actions/subscription";
import { ChannelContent } from "@/features/channel/components/ChannelContent";
import { notFound } from "next/navigation";
import { getSession } from "@/actions/auth";

interface ChannelPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  
  const [channel, session, minSubscriptions] = await Promise.all([
    getChannelByHandle(decodedUsername),
    getSession(),
    getSubscriptions()
  ]);

  if (!channel) {
    notFound();
  }

  // Fetch videos for this channel
  const [videosResponse, liveStreams, playlists] = await Promise.all([
     getVideos({ channelId: channel.id, limit: 30, sort: "latest" }),
     getLiveStreams(),
     getChannelPlaylists(channel.id)
  ]);

  const ownerUsername = channel.owner?.username || channel.handle;
  const channelStreams = liveStreams.filter(s => {
    const streamUsername = s.streamer?.username || s.creator?.username;
    return streamUsername === channel.handle || streamUsername === ownerUsername;
  });

  const isOwner = Boolean(
      channel.isOwner || 
      (!!session && !!session.user && (
          session.user.username === ownerUsername || 
          session.user.username === channel.handle ||
          (channel.userId && session.user.id === channel.userId)
      ))
  );

  let isSubscribed = channel.isSubscribed;
  if (!isSubscribed && session && minSubscriptions.length > 0) {
      isSubscribed = minSubscriptions.some(sub => sub.channelId === channel.id);
  }
  const channelWithStatus = { ...channel, isSubscribed };

  return (
    <ChannelContent 
      channel={channelWithStatus} 
      videos={videosResponse.videos} 
      liveStreams={channelStreams}
      playlists={playlists}
      isOwner={isOwner}
    />
  );
}
