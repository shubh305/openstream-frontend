"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, PlusSquare, Library, Tv, Clock, Settings, LayoutDashboard, Menu, X, Sparkles } from "lucide-react";
import { Subscription } from "@/actions/subscription";
import { useSidebar } from "@/lib/sidebar-context";
import { Button } from "./ui/button";
import { WIP_LIMITS } from "@/lib/wip-limits";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Home, href: "/", label: "Home" },
  { icon: Sparkles, href: "/clips", label: "Clips" },
  {
    icon: LayoutDashboard,
    href: "/studio",
    label: "Studio",
    authRequired: true,
    wipKey: "showStudioDashboard" as const,
  },
  { icon: PlusSquare, href: "/upload", label: "Upload", authRequired: true },
  {
    icon: Library,
    href: "/library",
    label: "Playlists",
    authRequired: true,
    wipKey: "showLibrary" as const,
  },
  {
    icon: Tv,
    href: "/subscriptions",
    label: "Subscriptions",
    authRequired: true,
  },
  {
    icon: Clock,
    href: "/playlist?list=WL",
    label: "Watch Later",
    authRequired: true,
  },
];

interface SidebarProps {
  subscriptions?: Subscription[];
  isAuthenticated?: boolean;
}

export function Sidebar({ subscriptions = [], isAuthenticated = false }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isOpen, close } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (pathname.startsWith("/studio")) return null;
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/signup") || pathname?.startsWith("/forgot-password");
  if (isAuthPage) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";

    if (href.includes("?")) {
      const [path, query] = href.split("?");
      if (pathname !== path) return false;
      const params = new URLSearchParams(query);
      const searchParamsObj = new URLSearchParams(searchParams.toString());
      return Array.from(params.entries()).every(([key, value]) => searchParamsObj.get(key) === value);
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/60 z-[70] md:hidden" onClick={close} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[80] transition-all duration-300 ease-in-out shrink-0 bg-black border-r border-white/5",
          "md:sticky md:top-0 md:h-screen md:flex md:flex-col md:translate-x-0",
          isOpen ? "translate-x-0 w-full" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "md:w-20" : "md:w-64",
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-6 md:p-4 md:border-b border-white/5">
          <div className="md:hidden">
            <Link href="/" className="flex items-center gap-2" onClick={close}>
              <div className="relative h-7 w-7 overflow-hidden rounded-lg border border-white/10">
                <Image src="/logo.svg" alt="OpenStream" fill className="object-contain p-1" sizes="28px" />
              </div>
              <span className="text-sm font-bold tracking-tight text-white uppercase">OpenStream</span>
            </Link>
          </div>
          {!isCollapsed && (
            <div className="hidden md:block">
              <span className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">OpenStream</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden w-12 h-12 rounded-full bg-noir-terminal border border-white/10 text-white hover:bg-white/10" onClick={close}>
              <X className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-muted-text hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 md:gap-1 px-6 md:px-3 py-4 overflow-y-auto no-scrollbar w-full">
          {NAV_ITEMS.map(item => {
            if (item.authRequired && !isAuthenticated) return null;
            if (item.wipKey && !WIP_LIMITS[item.wipKey]) return null;

            const isDuplicateOnMobile = ["Search", "Clips", "Subscriptions", "Following"].includes(item.label);
            if (isOpen && isDuplicateOnMobile) return null;

            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-2xl md:rounded-lg transition-all duration-300 group w-full cursor-pointer active:scale-95",
                  isCollapsed && !isOpen ? "justify-center px-0 py-3" : "gap-5 md:gap-4 px-6 md:px-4 py-4 md:py-3",
                  active ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]" : "text-muted-text hover:text-white hover:bg-white/5",
                )}
                title={isCollapsed && !isOpen ? item.label : undefined}
                onClick={() => isOpen && close()}
              >
                <div className={cn("p-2 rounded-xl transition-all duration-300", active ? "bg-electric-lime/20 text-electric-lime" : "text-muted-text group-hover:text-white")}>
                  <Icon className="w-6 h-6 md:w-5 md:h-5 shrink-0" />
                </div>
                {!isCollapsed || isOpen ? <span className="text-lg md:text-sm font-bold md:font-semibold tracking-wide">{item.label}</span> : null}
                {active && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-electric-lime shadow-[0_0_12px_rgba(180,255,0,0.8)]" />}
              </Link>
            );
          })}

          {isAuthenticated && subscriptions.length > 0 && (!isCollapsed || isOpen) && !isOpen && (
            <>
              <div className="my-8 md:my-5 px-4">
                <div className="h-[1px] bg-white/5 w-full" />
              </div>
              <div className="px-6 md:px-4 mb-4 text-xs font-black text-white/30 tracking-[0.2em] uppercase">Following</div>
            </>
          )}

          {/* Subscriptions - Native List style */}
          {isAuthenticated &&
            subscriptions.map(sub => (
              <Link
                key={sub.id}
                href={`/@${sub.channelHandle}`}
                className={cn(
                  "flex items-center rounded-lg hover:bg-white/5 transition-colors group w-full cursor-pointer",
                  isCollapsed && !isOpen ? "justify-center px-0 py-2" : "gap-4 px-4 py-2.5",
                  sub.isLive && "bg-signal-red/5",
                  isOpen && "hidden",
                )}
                title={sub.channelName}
                onClick={() => isOpen && close()}
              >
                <div className="w-12 h-12 md:w-8 md:h-8 rounded-full bg-noir-deep border border-white/5 glass-border overflow-hidden relative shrink-0 transition-transform touch-none">
                  <Image
                    src={sub.avatarUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=${sub.channelHandle}`}
                    alt={sub.channelName}
                    fill
                    className={cn("object-cover transition-all duration-500", !sub.isLive && "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100")}
                    sizes="(max-width: 768px) 48px, 32px"
                  />
                  {sub.isLive && <div className="absolute inset-0 border-2 border-signal-red/50 rounded-full animate-pulse" />}
                </div>
                {(!isCollapsed || isOpen) && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="flex flex-col min-w-0">
                      <span className="text-base md:text-sm font-bold text-white transition-colors truncate">{sub.channelName}</span>
                      {sub.isLive && <span className="text-[10px] text-signal-red font-black tracking-widest uppercase">Live Now</span>}
                    </div>
                    {sub.isLive && <div className="w-2.5 h-2.5 rounded-full bg-signal-red shadow-[0_0_10px_rgba(255,51,51,0.8)] animate-pulse shrink-0 ml-2" />}
                  </div>
                )}
              </Link>
            ))}
        </nav>

        {/* Mobile Footer / Settings */}
        <div className={cn("p-8 md:p-4 border-t border-white/5 mt-auto", isCollapsed ? "flex justify-center" : "px-6 md:px-4")}>
          <Link
            href={isAuthenticated ? "/studio/customization" : "/login"}
            className={cn(
              "flex items-center rounded-2xl md:rounded-lg transition-all duration-300 w-full cursor-pointer active:scale-95 px-6 md:px-4 py-5 md:py-3",
              pathname === "/studio/customization" ? "bg-white/10 text-white" : "text-muted-text hover:text-white hover:bg-white/5",
            )}
            onClick={() => isOpen && close()}
          >
            <div className="p-2 rounded-xl bg-white/5 mr-4 md:mr-3">
              <Settings className="w-6 h-6 md:w-5 md:h-5 shrink-0" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-sm font-bold tracking-wide">{isAuthenticated ? "Settings" : "Get Started"}</span>
              <span className="text-xs text-muted-text/60 md:hidden">Manage your profile & account</span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
