import { fetchApi } from "./api-client";

export enum AnalyticsEvent {
    // Discovery
    PAGE_VIEW = "page_view",
    SEARCH_QUERY = "search_query",
    VIDEO_CLICK = "video_click",
    
    // Engagement
    VIDEO_PLAY = "video_play",
    VIDEO_PAUSE = "video_pause",
    VIDEO_COMPLETE = "video_complete",
    VIDEO_HEARTBEAT = "video_heartbeat",
    VIDEO_BUFFERING = "video_buffering",
    VIDEO_QUALITY_CHANGE = "video_quality_change",
    VIDEO_ERROR = "video_error",
    
    // Social
    VIDEO_LIKE = "video_like",
    VIDEO_DISLIKE = "video_dislike",
    VIDEO_SHARE = "video_share",
    COMMENT_ADD = "comment_add",
    CHAT_MESSAGE = "chat_message",
    
    // Channel
    SUBSCRIBE = "subscribe",
    UNSUBSCRIBE = "unsubscribe",
}

export type EventProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * Basic analytics tracking utility
 */
export const trackEvent = async (event: AnalyticsEvent | string, properties: EventProperties = {}) => {
    try {
        void fetchApi("/analytics/track", {
            method: "POST",
            body: JSON.stringify({
                event,
                properties: {
                    ...properties,
                    url: typeof window !== 'undefined' ? window.location.href : undefined,
                }
            })
        });
    } catch (error) {
        console.error("Tracking Error:", error);
    }
};
