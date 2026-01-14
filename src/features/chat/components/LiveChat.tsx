"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, WifiOff } from "lucide-react";
import { chatSocket, ChatEvent, ChatMessageEvent } from "@/lib/socket";
import { API_BASE_URL } from "@/lib/constants";

interface ChatMessage {
  id: string;
  user: string;
  avatarUrl?: string;
  text: string;
  timestamp: string;
  badges?: string[];
}

interface LiveChatProps {
  streamId: string;
  token?: string;
}

/**
 * LiveChat Component
 * Real-time chat for live streams using WebSocket connection.
 */
export function LiveChat({ streamId, token }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState("0");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Connect to WebSocket on mount
  useEffect(() => {
    chatSocket.connect(streamId, token);

    const unsubscribe = chatSocket.subscribe((event: ChatEvent) => {
      if (event.type === "message") {
        const msg = (event as ChatMessageEvent).data;
        setMessages(prev => [
          ...prev,
          {
            id: msg.id,
            user: msg.user,
            avatarUrl: msg.avatarUrl,
            text: msg.text,
            timestamp: msg.timestamp,
            badges: msg.badges,
          },
        ]);
      } else if (event.type === "user_count") {
        setUserCount(event.data.formatted);
      }
    });

    // Check connection status periodically
    const statusInterval = setInterval(() => {
      setIsConnected(chatSocket.isConnected());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(statusInterval);
      chatSocket.disconnect();
    };
  }, [streamId, token]);

  // Fetch chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chat/${streamId}/history`);
        if (response.ok) {
          const history = await response.json();
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newHistory = history.filter((m: ChatMessage) => !existingIds.has(m.id));
            return [...newHistory, ...prev];
          });
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchHistory();
  }, [streamId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    setIsSending(true);
    const sent = chatSocket.sendMessage(newMessage.trim());
    setIsSending(false);

    if (sent) {
      setNewMessage("");
    }
  };

  return (
    <div className="flex h-full flex-col bg-noir-terminal">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-noir-border px-6 shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white flex items-center gap-2">
          {isConnected ? <span className="w-2 h-2 rounded-full bg-electric-lime animate-pulse" /> : <WifiOff className="w-3 h-3 text-signal-red" />}
          Live_Feed
        </h3>
        <span className="text-[10px] font-mono text-muted-text uppercase tracking-widest">Sys::{userCount}_CONN</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 p-6" ref={scrollRef}>
        <div className="space-y-6">
          {messages.length === 0 && <div className="text-center text-muted-text text-sm py-8">{isConnected ? "No messages yet. Be the first to chat!" : "Connecting to chat..."}</div>}
          {messages.map(msg => (
            <div key={msg.id} className="flex items-start gap-4 group">
              <Avatar className="h-8 w-8 rounded-none border border-noir-border group-hover:border-electric-lime transition-colors">
                <AvatarImage
                  src={msg.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user}`}
                  className="grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all"
                />
                <AvatarFallback className="bg-noir-bg text-electric-lime font-bold rounded-none">{msg.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-electric-lime uppercase tracking-widest flex items-center gap-2">
                  {msg.user}
                  {msg.badges?.map(badge => (
                    <span key={badge} className="text-[8px] bg-electric-lime/20 text-electric-lime px-1 rounded">
                      {badge}
                    </span>
                  ))}
                  <span className="text-[9px] font-normal text-muted-text tracking-normal lowercase">at_{msg.timestamp}</span>
                </span>
                <p className="text-sm leading-relaxed text-foreground/90 font-sans tracking-tight">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-noir-border p-6 bg-noir-bg/50">
        <form className="flex gap-3" onSubmit={handleSubmit}>
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder={!token ? "Login to chat" : isConnected ? "INPUT_MESSAGE..." : "DISCONNECTED..."}
            disabled={!isConnected || isSending || !token}
            className="bg-noir-terminal border-noir-border focus:border-electric-lime h-11 text-xs font-mono uppercase tracking-widest disabled:opacity-50"
          />
          <Button
            size="icon"
            type="submit"
            disabled={!isConnected || !newMessage.trim() || isSending || !token}
            className="bg-white text-black hover:bg-electric-lime transition-colors h-11 w-11 shrink-0 disabled:opacity-50"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
