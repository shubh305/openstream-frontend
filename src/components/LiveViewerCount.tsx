"use client";

import { useEffect, useState } from "react";
import { chatSocket } from "@/lib/socket";

interface LiveViewerCountProps {
  streamId: string;
  initialCount?: number;
}

export function LiveViewerCount({ streamId, initialCount = 0 }: LiveViewerCountProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    // Connect to the socket (shares connection with chat if active)
    chatSocket.connect(streamId);

    const unsubscribe = chatSocket.subscribe((event) => {
      if (event.type === "user_count") {
        setCount(event.data.count);
      }
    });

    return () => {
      unsubscribe();
      chatSocket.disconnect();
    };
  }, [streamId]);

  return (
    <span className="font-medium animate-in fade-in">
      {Intl.NumberFormat("en-US", { notation: "compact" }).format(count)} watching
    </span>
  );
}
