"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getMyChannel } from "@/actions/channel";
import { cn } from "@/lib/utils";
import { WIP_LIMITS } from "@/lib/wip-limits";
import { LayoutDashboard, Video, BarChart2, Settings, Radio, PenTool, ArrowLeft } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/studio/dashboard", icon: LayoutDashboard, wipKey: "showStudioDashboard" as const },
  { label: "Content", href: "/studio/content", icon: Video },
  { label: "Analytics", href: "/studio/analytics", icon: BarChart2, wipKey: "showStudioAnalytics" as const },
  { label: "Customize", href: "/studio/customization", icon: PenTool },
  { label: "Go Live", href: "/studio/stream", icon: Radio, highlight: true },
];

const BOTTOM_ITEMS = [{ label: "Settings", href: "/studio/customization", icon: Settings }];

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
    <>
      <aside className="w-64 border-r border-noir-border bg-noir-terminal hidden md:flex flex-col h-full shrink-0">
        {/* Brand / Home link */}
        <div className="h-14 flex items-center px-6 border-b border-noir-border hover:bg-white/5 transition-colors">
          <Link href="/" className="flex items-center gap-3 text-muted-text hover:text-white group w-full">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <div className="font-bold text-xs uppercase tracking-[0.3em]">Home</div>
          </Link>
        </div>
        {/* User */}
        <div className="p-6 border-b border-noir-border">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-noir-bg border border-noir-border flex items-center justify-center overflow-hidden relative shadow-sm">
              {channel?.avatarUrl ? (
                <Image src={channel.avatarUrl} alt={channel.name} width={44} height={44} className="object-cover" />
              ) : (
                <span className="text-electric-lime font-bold text-lg">{channel ? channel.name[0].toUpperCase() : "?"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-white truncate leading-tight">{channel?.name || "Loading..."}</div>
              <div className="text-[10px] text-muted-text font-mono uppercase tracking-widest truncate mt-0.5 opacity-70">{channel ? `@${channel.handle}` : "..."}</div>
            </div>
          </div>
        </div>
        {/* Main Nav */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            if (item.wipKey && !WIP_LIMITS[item.wipKey]) return null;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg text-base transition-all duration-200",
                  isActive ? "bg-electric-lime/10 text-electric-lime font-bold border border-electric-lime/20" : "text-muted-text hover:text-white hover:bg-white/5 font-semibold",
                  item.highlight && !isActive && "text-signal-red hover:text-signal-red hover:bg-signal-red/10",
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-electric-lime")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/* Bottom Nav */}
        <div className="p-4 border-t border-noir-border space-y-1.5">
          {BOTTOM_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-4 py-3 rounded-lg text-base text-muted-text hover:text-white hover:bg-white/5 transition-all duration-200 font-semibold"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-noir-terminal/95 backdrop-blur-lg border-t border-noir-border flex md:hidden items-center justify-around h-16 px-2 pb-safe">
        {NAV_ITEMS.map(item => {
          if (item.wipKey && !WIP_LIMITS[item.wipKey]) return null;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex flex-col items-center justify-center w-full h-full gap-1 p-1", isActive ? "text-electric-lime" : "text-muted-text hover:text-white")}
            >
              <item.icon className={cn("w-5 h-5", isActive && "fill-current/20")} />
              <span className="text-[11px] font-bold uppercase leading-none text-center">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/studio/customization"
          className={cn("flex flex-col items-center justify-center w-full h-full gap-1 p-1", pathname === "/studio/customization" ? "text-electric-lime" : "text-muted-text hover:text-white")}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase leading-none text-center">Settings</span>
        </Link>
      </nav>
    </>
  );
}
