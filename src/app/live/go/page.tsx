import { BroadcastConsole } from "@/features/live/components/BroadcastConsole";
import { LiveChat } from "@/features/chat/components/LiveChat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GoLivePage() {
  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b border-white/10 px-4">
             <Link href="/">
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
             </Link>
             <h1 className="font-semibold">Broadcast Studio</h1>
        </header>

        {/* Studio Layout */}
        <div className="flex flex-1 overflow-hidden">
            {/* Main Stage */}
            <div className="flex-1 bg-black p-4">
                <BroadcastConsole />
            </div>

            {/* Side Panel (Chat/Settings) */}
            <div className="w-80 border-l border-white/10 bg-neutral-900 hidden md:block">
               <LiveChat />
            </div>
        </div>
    </div>
  );
}
