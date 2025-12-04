export const APP_NAME = "OpenStream";
export const API_BASE_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export const SAMPLE_VIDEO_URL = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const PLACEHOLDER_IMAGES = {
    THUMBNAIL_1: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
    THUMBNAIL_2: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60",
    THUMBNAIL_3: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60",
    THUMBNAIL_4: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=60",
    AVATAR_DEFAULT: "https://github.com/shadcn.png",
};
