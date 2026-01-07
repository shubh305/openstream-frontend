import { Video, Stream } from "@/types/api";

export const DUMMY_VIDEOS: Video[] = [
  {
    id: "v1",
    title: "Building a Clone of Twitch in Next.js 14",
    thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: "12:45",
    views: 120500,
    uploadedAt: "2 days ago",
    creator: {
      username: "TechMaster",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=TechMaster"
    }
  },
  {
    id: "v2",
    title: "Top 10 Gaming Moments of 2025",
    thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: "8:20",
    views: 85000,
    uploadedAt: "5 days ago",
    creator: {
      username: "GamerPro",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=GamerPro"
    }
  },
  {
    id: "v3",
    title: "Lo-Fi Beats to Code/Relax To",
    thumbnailUrl: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800&q=80",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: "1:00:00",
    views: 1200000,
    uploadedAt: "1 week ago",
    creator: {
      username: "ChillVibes",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=ChillVibes"
    }
  },
  {
    id: "v4",
    title: "SpaceX Starship Launch Highlights",
    thumbnailUrl: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&q=80",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    duration: "15:30",
    views: 450000,
    uploadedAt: "2 weeks ago",
    creator: {
      username: "SpaceFans",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=SpaceFans"
    }
  }
];

export const DUMMY_STREAMS: Stream[] = [
  {
    id: "s1",
    title: "Late Night Coding Session ☕️",
    category: "Technology",
    status: "live",
    viewerCount: 1250,
    thumbnailUrl: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=80",
    hlsPlaybackUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    creator: {
      username: "CodeNinja",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=CodeNinja",
    },
    streamer: {
      username: "CodeNinja",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=CodeNinja",
    },
  },
  {
    id: "s2",
    title: "Ranked Matches - Road to Diamond",
    category: "Gaming",
    status: "live",
    viewerCount: 850,
    thumbnailUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
    hlsPlaybackUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    creator: {
      username: "EsportsChamp",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=EsportsChamp",
    },
    streamer: {
      username: "EsportsChamp",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=EsportsChamp",
    },
  },
];
