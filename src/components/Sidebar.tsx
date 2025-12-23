"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, PlusSquare, Library, Tv, Clock, Settings, LayoutDashboard, PenTool } from "lucide-react";
import { Subscription } from "@/actions/subscription";

const NAV_ITEMS = [
  { icon: Home, href: "/", label: "Home" },
  { icon: LayoutDashboard, href: "/studio", label: "Studio" },
  { icon: PlusSquare, href: "/upload", label: "Upload" },
  { icon: Library, href: "/library", label: "Library" },
  { icon: Tv, href: "/subscriptions", label: "Subscriptions" },
  { icon: Clock, href: "/playlist?list=WL", label: "Watch Later" },
  { icon: PenTool, href: "/studio/customization", label: "Customize" },
];

interface SidebarProps {
  subscriptions?: Subscription[];
}

export function Sidebar({ subscriptions = [] }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-noir-terminal/80 backdrop-blur-xl border-r border-noir-border flex flex-col items-center py-6 z-50">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <div className="w-8 h-8 bg-electric-lime rounded-lg flex items-center justify-center">
          <span className="text-black font-bold text-sm">OS</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-2 overflow-y-auto no-scrollbar w-full">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group
                ${active 
                  ? "bg-electric-lime/10 text-electric-lime" 
                  : "text-muted-text hover:text-white hover:bg-noir-border/50"
                }
              `}
              title={item.label}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-electric-lime rounded-r" />
              )}
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}

        <div className="w-8 h-[1px] bg-noir-border my-2" />

        {/* Subscriptions */}
        {subscriptions.map((sub) => (
           <Link 
             key={sub.id} 
             href={`/@${sub.channelHandle}`}
             className={`w-10 h-10 flex items-center justify-center rounded-full hover:scale-110 transition-transform cursor-pointer relative group ${sub.isLive ? 'ring-2 ring-electric-lime ring-offset-2 ring-offset-noir-terminal' : ''}`}
             title={sub.channelName}
           >
             <div className="w-8 h-8 rounded-full bg-noir-bg border border-noir-border overflow-hidden relative">
                <Image 
                  src={sub.avatarUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=${sub.channelHandle}`} 
                  alt={sub.channelName} 
                  fill 
                  className={`object-cover ${sub.isLive ? '' : 'grayscale'}`}
                  sizes="32px"
                />
             </div>
             {sub.isLive && (
               <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-signal-red rounded-full border-2 border-noir-terminal" />
             )}
           </Link>
        ))}
      </nav>

      {/* Settings at bottom */}
      <Link
        href="/settings"
        className={`
          w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200
          ${pathname === "/settings" 
            ? "bg-electric-lime/10 text-electric-lime" 
            : "text-muted-text hover:text-white hover:bg-noir-border/50"
          }
        `}
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </Link>
    </aside>
  );
}
