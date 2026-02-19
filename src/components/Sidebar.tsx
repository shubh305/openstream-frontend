"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, PlusSquare, Library, Tv, Clock, Settings, LayoutDashboard, PenTool, Menu, X } from "lucide-react";
import { Subscription } from "@/actions/subscription";
import { useSidebar } from "@/lib/sidebar-context";
import { Button } from "./ui/button";
import { WIP_LIMITS } from "@/lib/wip-limits";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { icon: Home, href: "/", label: "Home" },
  { icon: LayoutDashboard, href: "/studio/dashboard", label: "Studio", authRequired: true, wipKey: "showStudioDashboard" as const },
  { icon: PlusSquare, href: "/upload", label: "Upload", authRequired: true },
  { icon: Library, href: "/library", label: "Library", authRequired: true, wipKey: "showLibrary" as const },
  { icon: Tv, href: "/subscriptions", label: "Subscriptions", authRequired: true },
  { icon: Clock, href: "/playlist?list=WL", label: "Watch Later", authRequired: true },
  { icon: PenTool, href: "/studio/customization", label: "Customize", authRequired: true },
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

  if (pathname.startsWith("/studio")) return null;
  if (!isAuthenticated) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";

    if (href.includes("?")) {
      const [path, query] = href.split("?");
      if (pathname !== path) return false;
      const params = new URLSearchParams(query);
      return Array.from(params.entries()).every(([key, value]) => searchParams.get(key) === value);
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] md:hidden animate-in fade-in duration-300" onClick={close} />}

      <aside
        className={`
        fixed left-0 top-0 h-screen w-64 bg-noir-terminal border-r border-noir-border flex flex-col z-[80] transition-all duration-300 ease-in-out shrink-0
        md:static md:translate-x-0 md:bg-noir-terminal md:border-r md:h-full
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "md:w-20" : "md:w-64"}
      `}
      >
        {/* Header / Toggle */}
        <div className={`p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && <div className="text-[10px] font-bold text-muted-text tracking-[0.3em] pl-2">Navigation</div>}
          <div className="flex items-center gap-1">
            {isOpen && (
              <Button variant="ghost" size="icon" className="md:hidden text-muted-text hover:text-white" onClick={close}>
                <X className="w-5 h-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="text-muted-text hover:text-white hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto no-scrollbar w-full">
          {NAV_ITEMS.map(item => {
            if (item.authRequired && !isAuthenticated) return null;
            if (item.wipKey && !WIP_LIMITS[item.wipKey]) return null;

            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                flex items-center rounded-lg transition-all duration-200 group w-full text-base font-semibold cursor-pointer
                ${isCollapsed ? "justify-center px-0 py-3" : "gap-4 px-4 py-3"}
                ${active ? "bg-electric-lime/10 text-electric-lime" : "text-muted-text hover:text-white hover:bg-white/5"}
              `}
                title={isCollapsed ? item.label : undefined}
                onClick={() => isOpen && close()}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? "text-electric-lime" : "text-muted-text group-hover:text-white"}`} />
                {!isCollapsed && <span>{item.label}</span>}
                {active && !isCollapsed && <div className="ml-auto w-2 h-2 rounded-full bg-electric-lime shadow-[0_0_8px_rgba(163,230,53,0.5)]" />}
              </Link>
            );
          })}

          {isAuthenticated && subscriptions.length > 0 && <div className="h-[1px] bg-noir-border my-5 mx-4" />}

          {isAuthenticated && subscriptions.length > 0 && <div className="px-4 mb-3 text-xs font-bold text-muted-text tracking-widest opacity-60">Subscriptions</div>}

          {/* Subscriptions */}
          {isAuthenticated &&
            subscriptions.map(sub => (
              <Link
                key={sub.id}
                href={`/@${sub.channelHandle}`}
                className={`flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors group w-full ${sub.isLive ? "bg-signal-red/5" : ""}`}
                title={sub.channelName}
                onClick={() => isOpen && close()}
              >
                <div className="w-9 h-9 rounded-full bg-noir-bg border border-noir-border overflow-hidden relative shrink-0">
                  <Image
                    src={sub.avatarUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=${sub.channelHandle}`}
                    alt={sub.channelName}
                    fill
                    className={`object-cover ${sub.isLive ? "" : "grayscale group-hover:grayscale-0 transition-all"}`}
                    sizes="36px"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className={`text-base font-semibold truncate ${sub.isLive ? "text-white" : "text-muted-text group-hover:text-white"}`}>{sub.channelName}</span>
                  {sub.isLive && (
                    <span className="text-[10px] text-signal-red font-bold tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-signal-red rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
              </Link>
            ))}
        </nav>

        {/* Settings at bottom */}
        <div className={`p-4 border-t border-noir-border mt-auto ${isCollapsed ? "flex justify-center" : ""}`}>
          <Link
            href={isAuthenticated ? "/settings" : "/login"}
            className={`
            flex items-center rounded-lg transition-all duration-200 w-full text-base font-semibold cursor-pointer
            ${isCollapsed ? "justify-center px-0 py-3" : "gap-4 px-4 py-3"}
            ${pathname === "/settings" ? "bg-electric-lime/10 text-electric-lime" : "text-muted-text hover:text-white hover:bg-white/5"}
          `}
            title={isCollapsed ? (isAuthenticated ? "Settings" : "Login") : undefined}
            onClick={() => isOpen && close()}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>{isAuthenticated ? "Settings" : "Login"}</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
