"use client";

/**
 * WebSocket Chat Client
 * 
 * Manages WebSocket connections to `/ws/chat/:streamId`.
 * Provides a singleton-like hook for connecting, sending messages, and receiving events.
 */

export type ChatMessageEvent = {
  type: "message";
  data: {
    id: string;
    user: string;
    avatarUrl: string;
    text: string;
    timestamp: string;
    badges?: string[];
  };
};

export type UserCountEvent = {
  type: "user_count";
  data: {
    count: number;
    formatted: string;
  };
};

export type SystemEvent = {
  type: "system";
  data: {
    text: string;
  };
};

export type ChatEvent = ChatMessageEvent | UserCountEvent | SystemEvent;

type MessageHandler = (event: ChatEvent) => void;

class ChatSocket {
  private ws: WebSocket | null = null;
  private streamId: string | null = null;
  private currentToken: string | null = null;
  private consumers = 0;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  connect(streamId: string, token?: string) {
    if (this.ws && this.streamId === streamId && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      if (token && token !== this.currentToken) {
        console.log("[ChatSocket] Upgrading connection with new token");
        this.forceDisconnect();
      } else {
        this.consumers++;
        console.log(`[ChatSocket] Reusing connection. Consumers: ${this.consumers}`);
        return;
      }
    } else if (this.streamId !== streamId) {
      if (this.ws) {
        this.forceDisconnect();
      }
    }

    this.streamId = streamId;
    this.currentToken = token || null;
    this.consumers = 1;

    let baseUrl = process.env.NEXT_PUBLIC_WS_URL;

    if (!baseUrl && typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      baseUrl = `${protocol}//${window.location.host}`;
      console.log(`[ChatSocket] Inferring WS URL from window: ${baseUrl}`);
    } else if (!baseUrl) {
      baseUrl = "ws://localhost:4000";
    }

    const url = new URL(`${baseUrl}/ws/chat`);
    url.searchParams.set("streamId", streamId);

    if (token) {
      url.searchParams.set("token", token);
    }

    this.ws = new WebSocket(url.toString());

    this.ws.onopen = () => {
      console.log(`[ChatSocket] Connected to stream ${streamId}`);
      this.reconnectAttempts = 0;
      this.startPing();
    };

    this.ws.onmessage = event => {
      try {
        const data: ChatEvent = JSON.parse(event.data);
        this.handlers.forEach(handler => handler(data));
      } catch (error) {
        console.error("[ChatSocket] Failed to parse message:", error);
      }
    };

    this.ws.onerror = error => {
      console.error("[ChatSocket] WebSocket error:", error);
    };

    this.ws.onclose = () => {
      console.log("[ChatSocket] Connection closed");
      this.stopPing();
      this.attemptReconnect();
    };
  }

  disconnect() {
    this.consumers--;
    console.log(`[ChatSocket] Consumer disconnected. Remaining: ${this.consumers}`);

    if (this.consumers <= 0) {
      this.forceDisconnect();
    }
  }

  private forceDisconnect() {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.streamId = null;
    this.currentToken = null;
    this.consumers = 0;
    this.reconnectAttempts = 0;
  }

  sendMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[ChatSocket] Cannot send message: not connected");
      return false;
    }

    this.ws.send(
      JSON.stringify({
        event: "message",
        data: { text },
      }),
    );
    return true;
  }

  subscribe(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[ChatSocket] Max reconnect attempts reached");
      return;
    }

    if (!this.streamId) return;

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[ChatSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.streamId) {
        this.connect(this.streamId);
      }
    }, delay);
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const chatSocket = new ChatSocket();
