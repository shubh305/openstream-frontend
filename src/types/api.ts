export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  subscribers?: string | number;
  isVerified?: boolean;
}

export interface Channel {
  id: string;
  userId: string;
  name: string;
  handle: string;
  description?: string;
  bannerUrl?: string;
  avatarUrl?: string;
  subscriberCount: number;
  videoCount: number;
  totalViews: number;
  socialLinks?: {
    twitter?: string | null;
    instagram?: string | null;
    discord?: string | null;
  };
  owner?: {
    username: string;
    avatarUrl?: string;
  };
  isOwner?: boolean;
  isSubscribed?: boolean;
  joinedDate?: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  posterUrl?: string;
  videoUrl?: string;
  duration: string;
  views: number;
  likes?: number;
  dislikes?: number;
  commentsCount?: number;
  uploadedAt: string;
  publishedAt?: string;
  visibility?: "public" | "private" | "unlisted";
  category?: string;
  isLive?: boolean;
  creator: {
    username: string;
    avatarUrl?: string;
    subscribers?: string;
    isVerified?: boolean;
  };
  userInteraction?: {
    liked: boolean;
    disliked: boolean;
    subscribed: boolean;
  };
  resolutions?: string[];
}

export interface Stream {
  id: string;
  title: string;
  description?: string;
  category: string;
  visibility?: "public" | "private" | "unlisted";
  status: "live" | "offline";
  viewerCount: number;
  startedAt?: string;
  hlsPlaybackUrl?: string;
  thumbnailUrl?: string;
  creator: {
    username: string;
    avatarUrl?: string;
    subscribers?: string;
  };
  streamer?: {
    username: string;
    avatarUrl?: string;
    subscribers?: string;
  };
}

export interface Comment {
  id: string;
  text: string;
  timestamp: string;
  likes: number;
  replyCount: number;
  isLiked: boolean;
  author: {
    username: string;
    avatarUrl?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface VideoListResponse {
  videos: Video[];
  pagination: PaginatedResponse<unknown>["pagination"];
}

export interface StreamListResponse {
  streams: Stream[];
  pagination: PaginatedResponse<unknown>["pagination"];
}

export interface CommentListResponse {
  comments: Comment[];
  pagination: PaginatedResponse<unknown>["pagination"];
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  videoCount?: number;
  thumbnailUrl?: string;
  videos?: Video[];
}

export interface PlaylistListResponse {
  playlists: Playlist[];
  pagination: PaginatedResponse<unknown>["pagination"];
}

export interface LoginResponse {
  access_token: string;
  user: User;
  streamKey?: string; // Sometimes returned
}
