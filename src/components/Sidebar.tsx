"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, PlusSquare, Library, Tv, Clock, Settings, LayoutDashboard, PenTool, X } from "lucide-react";
import { Subscription } from "@/actions/subscription";
import { useSidebar } from "@/lib/sidebar-context";
import { Button } from "./ui/button";
import { WIP_LIMITS } from "@/lib/wip-limits";

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
  const { isOpen, close } = useSidebar();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] md:hidden animate-in fade-in duration-300" onClick={close} />}

      <aside
        className={`
        fixed left-0 top-0 h-screen w-16 bg-noir-terminal/80 backdrop-blur-xl border-r border-noir-border flex flex-col items-center py-6 z-[80] transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Close button for mobile */}
        <Button variant="ghost" size="icon" className="md:hidden absolute top-4 right-2 text-white/60 hover:text-white" onClick={close}>
          <X className="w-5 h-5" />
        </Button>
        {/* Logo */}
        <Link href="/" className="mb-8">
          <div className="w-8 h-8 bg-electric-lime rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">OS</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center gap-2 overflow-y-auto no-scrollbar w-full">
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
                relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group
                ${active ? "bg-electric-lime/10 text-electric-lime" : "text-muted-text hover:text-white hover:bg-noir-border/50"}
              `}
                title={item.label}
              >
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-electric-lime rounded-r" />}
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}

          {isAuthenticated && subscriptions.length > 0 && <div className="w-8 h-[1px] bg-noir-border my-2" />}

          {/* Subscriptions */}
          {isAuthenticated &&
            subscriptions.map(sub => (
              <Link
                key={sub.id}
                href={`/@${sub.channelHandle}`}
                className={`w-10 h-10 flex items-center justify-center rounded-full hover:scale-110 transition-transform cursor-pointer relative group ${sub.isLive ? "ring-2 ring-electric-lime ring-offset-2 ring-offset-noir-terminal" : ""}`}
                title={sub.channelName}
              >
                <div className="w-8 h-8 rounded-full bg-noir-bg border border-noir-border overflow-hidden relative">
                  <Image
                    src={sub.avatarUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=${sub.channelHandle}`}
                    alt={sub.channelName}
                    fill
                    className={`object-cover ${sub.isLive ? "" : "grayscale"}`}
                    sizes="32px"
                  />
                </div>
                {sub.isLive && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-signal-red rounded-full border-2 border-noir-terminal" />}
              </Link>
            ))}
        </nav>

        {/* Settings at bottom */}
        <Link
          href={isAuthenticated ? "/settings" : "/login"}
          className={`
          w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200
          ${pathname === "/settings" ? "bg-electric-lime/10 text-electric-lime" : "text-muted-text hover:text-white hover:bg-noir-border/50"}
        `}
          title={isAuthenticated ? "Settings" : "Login"}
        >
          <Settings className="w-5 h-5" />
        </Link>
      </aside>
    </>
  );
}
