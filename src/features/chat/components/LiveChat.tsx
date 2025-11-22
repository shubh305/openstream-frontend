"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { MOCK_CHAT_MESSAGES } from "@/lib/mock-data";

/**
 * LiveChat Component
 * Displays real-time chat messages for the live stream.
 * Currently uses mock data for demonstration.
 */
export function LiveChat() {
  return (
    <div className="flex h-full flex-col rounded-xl border bg-white dark:bg-neutral-900 dark:border-neutral-800">
      <div className="flex h-14 items-center justify-between border-b px-4 dark:border-neutral-800">
        <h3 className="font-semibold">Live Chat</h3>
        <span className="text-xs text-neutral-500">2.4K online</span>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
            {MOCK_CHAT_MESSAGES.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user}`} />
                        <AvatarFallback>{msg.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-neutral-500">
                            {msg.user} <span className="text-[10px] font-normal opacity-50">{msg.timestamp}</span>
                        </span>
                        <p className="text-sm">{msg.text}</p>
                    </div>
                </div>
            ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4 dark:border-neutral-800">
        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input placeholder="Say something..." className="bg-neutral-100 dark:bg-neutral-950" />
            <Button size="icon" type="submit">
                <Send className="h-4 w-4" />
            </Button>
        </form>
      </div>
    </div>
  );
}
