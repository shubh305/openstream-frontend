import { PLACEHOLDER_IMAGES, SAMPLE_VIDEO_URL } from "@/lib/constants";

export const MOCK_USER = {
    id: "u_123",
    username: "DemoUser",
    email: "user@example.com",
    avatarUrl: PLACEHOLDER_IMAGES.AVATAR_DEFAULT,
};

export const MOCK_VIDEOS = [
    {
      id: "1",
      title: "Building a YouTube Clone with Next.js 15 & Tailwind CSS",
      thumbnailUrl: PLACEHOLDER_IMAGES.THUMBNAIL_1,
      duration: "12:45",
      views: 120500,
      uploadedAt: "2 days ago",
      creator: {
        username: "CodeWithShubh",
        avatarUrl: PLACEHOLDER_IMAGES.AVATAR_DEFAULT,
      },
    },
    {
      id: "2",
      title: "Understanding System Design: Scalable Architecture",
      thumbnailUrl: PLACEHOLDER_IMAGES.THUMBNAIL_2,
      duration: "45:20",
      views: 8900,
      uploadedAt: "1 week ago",
      creator: {
        username: "SystemDesignDaily",
      },
    },
    {
      id: "3",
      title: "Live: Gaming Marathon - 24 Hours Stream!",
      thumbnailUrl: PLACEHOLDER_IMAGES.THUMBNAIL_3,
      duration: "LIVE",
      views: 3400,
      uploadedAt: "Live",
      isLive: true,
      creator: {
        username: "GamerPro",
      },
    },
     {
      id: "4",
      title: "Top 10 VS Code Extensions for 2024",
      thumbnailUrl: PLACEHOLDER_IMAGES.THUMBNAIL_4,
      duration: "8:15",
      views: 56000,
      uploadedAt: "3 weeks ago",
      creator: {
        username: "TechTrends",
      },
    },
];

export const MOCK_VIDEO_DETAILS = {
    id: "1",
    title: "Building a YouTube Clone with Next.js 15 & Tailwind CSS",
    description: "In this comprehensive tutorial, we will build a full-stack streaming application...\n\nTimestamps:\n00:00 Intro\n05:30 Setup",
    views: 120500,
    uploadedAt: "2 days ago",
    posterUrl: SAMPLE_VIDEO_URL,
    videoUrl: SAMPLE_VIDEO_URL,
    creator: {
        username: "CodeWithShubh",
        avatarUrl: PLACEHOLDER_IMAGES.AVATAR_DEFAULT,
        subscribers: "1.2M"
    }
};

export const MOCK_CHAT_MESSAGES = [
    { id: "1", user: "Alice", text: "Hyped for this!", timestamp: "12:00" },
    { id: "2", user: "Bob", text: "Is the audio sync okay?", timestamp: "12:01" },
    { id: "3", user: "Charlie", text: "Yes it sounds good", timestamp: "12:01" },
    { id: "4", user: "Dave", text: "React 19 is wild", timestamp: "12:02" },
    { id: "5", user: "Eve", text: "Can you zoom in a bit?", timestamp: "12:03" },
];
