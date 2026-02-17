"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getMyChannel } from "@/actions/channel";
import { cn } from "@/lib/utils";
import { WIP_LIMITS } from "@/lib/wip-limits";
import { LayoutDashboard, Video, BarChart2, Settings, Radio, PenTool } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/studio/dashboard", icon: LayoutDashboard, wipKey: "showStudioDashboard" as const },
  { label: "Content", href: "/studio/content", icon: Video },
  { label: "Analytics", href: "/studio/analytics", icon: BarChart2, wipKey: "showStudioAnalytics" as const },
  { label: "Customization", href: "/studio/customization", icon: PenTool },
  { label: "Go Live", href: "/studio/stream", icon: Radio, highlight: true },
];

const BOTTOM_ITEMS = [
  { label: "Settings", href: "/studio/settings", icon: Settings },
];

export function StudioSidebar() {
  const pathname = usePathname();
  const [channel, setChannel] = useState<{ name: string; handle: string; avatarUrl?: string } | null>(null);

  useEffect(() => {
    async function fetchIdentity() {
      try {
        const data = await getMyChannel();
        if (data) setChannel(data);
      } catch (e) {
        console.error("Failed to load identity", e);
      }
    }
    fetchIdentity();
  }, []);

  return (
    <aside className="w-64 border-r border-noir-border bg-noir-terminal flex flex-col h-full shrink-0">
      {/* Brand */}
      <div className="h-14 flex items-center px-6 border-b border-noir-border">
        <div className="font-bold text-xs uppercase tracking-[0.3em] flex items-center gap-3 italic text-white">
          <span className="text-electric-lime not-italic flex h-5 w-5 items-center justify-center border border-electric-lime text-[10px]">S</span>
          Studio
        </div>
      </div>
      {/* User */}
      <div className="p-6 border-b border-noir-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-noir-bg border border-noir-border flex items-center justify-center overflow-hidden relative">
            {channel?.avatarUrl ? (
              <Image src={channel.avatarUrl} alt={channel.name} width={40} height={40} className="object-cover" />
            ) : (
              <span className="text-electric-lime font-bold">{channel ? channel.name[0].toUpperCase() : "?"}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">{channel?.name || "Loading..."}</div>
            <div className="text-[10px] text-muted-text font-mono uppercase tracking-widest truncate">{channel ? `@${channel.handle}` : "..."}</div>
          </div>
        </div>
      </div>
      {/* Main Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          if (item.wipKey && !WIP_LIMITS[item.wipKey]) return null;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive ? "bg-electric-lime/10 text-electric-lime font-medium border border-electric-lime/20" : "text-muted-text hover:text-white hover:bg-white/5",
                item.highlight && !isActive && "text-signal-red hover:text-signal-red hover:bg-signal-red/10",
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive && "text-electric-lime")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {/* Bottom Nav */}
      <div className="p-4 border-t border-noir-border space-y-1">
        {BOTTOM_ITEMS.map(item => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-text hover:text-white hover:bg-white/5 transition-colors">
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
