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
      <aside className="w-72 border-r border-white/5 bg-noir-deep hidden md:flex flex-col h-screen shrink-0 sticky top-0 md:top-16 md:h-[calc(100vh-4rem)] z-10">
        {/* Brand / Home link */}
        <div className="h-20 flex items-center px-8">
          <Link href="/" className="flex items-center gap-3 text-muted-text hover:text-white group w-full transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[10px] uppercase tracking-[0.3em] leading-none mb-1">Return</span>
              <span className="font-bold text-xs text-white/40 group-hover:text-white transition-colors">OpenStream</span>
            </div>
          </Link>
        </div>

        {/* User */}
        <div className="px-8 py-8 mb-4">
          <div className="p-5 rounded-3xl glasswork border border-white/5 bg-gradient-to-br from-white/5 to-transparent shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-electric-lime/5 blur-3xl -mr-10 -mt-10 group-hover:bg-electric-lime/10 transition-colors" />
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-noir-terminal border border-white/10 flex items-center justify-center overflow-hidden relative shadow-2xl">
                {channel?.avatarUrl ? (
                  <Image src={channel.avatarUrl} alt={channel.name} width={80} height={80} className="object-cover grayscale hover:grayscale-0 transition-all duration-500 scale-105 hover:scale-100" />
                ) : (
                  <span className="text-electric-lime font-black text-2xl">{channel ? channel.name[0].toUpperCase() : "?"}</span>
                )}
              </div>
              <div className="min-w-0 w-full">
                <div className="text-sm font-black text-white truncate uppercase tracking-tight">{channel?.name || "Authenticating..."}</div>
                <div className="text-[10px] text-muted-text font-black uppercase tracking-widest mt-1 opacity-50 flex items-center justify-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-electric-lime animate-pulse" />
                  {channel ? `@${channel.handle}` : "..."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide">
          <section className="space-y-1.5">
            <h3 className="px-6 text-[10px] font-black text-white/20 tracking-[0.3em] uppercase mb-4">Command Center</h3>
            {NAV_ITEMS.map(item => {
              if (item.wipKey && !WIP_LIMITS[item.wipKey]) return null;
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-300 group relative",
                    isActive ? "bg-electric-lime text-black shadow-xl shadow-electric-lime/10 scale-[1.02]" : "text-muted-text hover:text-white hover:bg-white/5",
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-black" : "text-muted-text group-hover:text-white transition-colors")} />
                  {item.label}
                  {isActive && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-black/40" />}
                  {item.highlight && !isActive && (
                    <span className="absolute right-4 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-red opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-red"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 mt-auto">
          {BOTTOM_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-muted-text hover:text-white hover:bg-white/5 transition-all group"
            >
              <item.icon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              {item.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* Mobile Integrated Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 z-[100] bg-noir-terminal/80 backdrop-blur-3xl border border-white/10 flex md:hidden items-center justify-around h-16 px-2 rounded-2xl shadow-2xl">
        {NAV_ITEMS.map(item => {
          if (item.wipKey && !WIP_LIMITS[item.wipKey]) return null;
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex flex-col items-center justify-center p-2 rounded-xl transition-all", isActive ? "text-electric-lime" : "text-muted-text opacity-60")}
            >
              <Icon className="w-5 h-5" />
              <span className={cn("text-[7px] font-black uppercase tracking-[0.1em] mt-1 transition-all", isActive ? "opacity-100" : "opacity-0 h-0 invisible")}>{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/studio/customization"
          className={cn("flex flex-col items-center justify-center p-2 rounded-xl transition-all", pathname === "/studio/customization" ? "text-electric-lime" : "text-muted-text opacity-60")}
        >
          <Settings className="w-5 h-5" />
        </Link>
      </nav>
    </>
  );
}
