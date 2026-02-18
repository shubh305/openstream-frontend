"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, LogOut, Menu, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/actions/auth";
import { useSidebar } from "@/lib/sidebar-context";

interface User {
    username: string;
    email: string;
    avatarUrl?: string;
}

interface NavbarProps {
    user?: User; 
}

const NotificationItem = ({ title, desc, time, type }: { title: string; desc: string; time: string; type: "success" | "warn" | "info" }) => (
  <div className="p-3 hover:bg-noir-border/30 transition-colors cursor-default group rounded-lg mx-2 my-1">
    <div className="flex justify-between items-start mb-1">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${type === "success" ? "bg-electric-lime" : type === "warn" ? "bg-signal-red" : "bg-white/60"}`} />
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
      <span className="text-xs text-muted-text">{time}</span>
    </div>
    <p className="text-xs text-muted-text leading-relaxed pl-4 group-hover:text-white/70 transition-colors">{desc}</p>
  </div>
);

import { getSuggestions } from "@/actions/search";

function SearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleSearch = (term: string) => {
    if (term.trim()) {
      setShowSuggestions(false);
      setQuery(term);
      router.push(`/search?q=${encodeURIComponent(term.trim())}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (timeoutId) clearTimeout(timeoutId);

    if (val.trim().length > 1) {
      const id = setTimeout(async () => {
        const results = await getSuggestions(val);
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
      }, 300);
      setTimeoutId(id);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="hidden md:flex flex-1 max-w-md relative mx-auto">
      <div className="relative w-full group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text group-focus-within:text-electric-lime transition-colors" />
        <Input
          type="search"
          placeholder="Search..."
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          className="w-full bg-noir-bg border-noir-border focus:border-electric-lime pl-10 h-10 text-sm rounded-lg transition-all"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-12 left-0 right-0 bg-noir-terminal border border-noir-border rounded-lg shadow-xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
              onClick={() => handleSearch(suggestion)}
            >
              <Search className="w-3 h-3 text-muted-text" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

export function Navbar({ user }: NavbarProps) {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-[60] flex h-16 items-center justify-between border-b border-noir-border bg-noir-terminal/80 backdrop-blur-md px-4 md:px-8">
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden text-white hover:bg-noir-border" onClick={toggle}>
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="flex h-10 w-10 items-center justify-center bg-noir-border border border-noir-border group-hover:border-electric-lime transition-all duration-300 rounded-lg">
            <span className="text-electric-lime font-bold tracking-tighter text-xl italic cursor-default">OS</span>
          </div>
          <span className="hidden text-base font-bold uppercase tracking-[0.2em] text-white md:block group-hover:text-electric-lime transition-colors">OpenStream</span>
        </Link>
      </div>

      <div className="flex-1 max-w-lg px-4 hidden md:block">
        <SearchForm />
      </div>

      <div className="flex items-center gap-4 shrink-0 relative z-[70]">
        {user ? (
          <>
            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex text-muted-text hover:text-white hover:bg-noir-border rounded-lg">
              <Link href="/upload">
                <Upload className="h-5 w-5" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-text hover:text-white hover:bg-noir-border relative group rounded-lg">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-signal-red rounded-full group-hover:animate-pulse" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-noir-terminal border border-noir-border rounded-xl p-0 shadow-xl" align="end">
                <DropdownMenuLabel className="p-4 border-b border-noir-border flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <span className="text-xs text-muted-text bg-noir-border px-2 py-0.5 rounded-full">4 new</span>
                </DropdownMenuLabel>
                <div className="max-h-72 overflow-y-auto py-1">
                  <NotificationItem title="Stream Online" desc="Your broadcast is now live and visible to viewers." time="2m" type="success" />
                  <NotificationItem title="New Login" desc="Session verified from new device." time="15m" type="info" />
                  <NotificationItem title="Storage Warning" desc="You're approaching your storage limit (85%)." time="1h" type="warn" />
                  <NotificationItem title="Update Applied" desc="Latest platform updates have been deployed." time="3h" type="info" />
                </div>
                <div className="p-3 border-t border-noir-border text-center">
                  <button className="text-xs text-muted-text hover:text-white transition-colors">Clear all</button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 p-0 border border-noir-border hover:border-electric-lime transition-all overflow-hidden rounded-none">
                  <Avatar className="h-10 w-10 rounded-none border-none grayscale">
                    <AvatarImage src={user.avatarUrl} alt={user.username} className="object-cover" />
                    <AvatarFallback className="bg-noir-terminal text-electric-lime rounded-none">{user.username[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-noir-terminal border border-noir-border rounded-none" align="end" forceMount>
                <DropdownMenuLabel className="font-mono p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-bold leading-none uppercase tracking-widest text-electric-lime">{user.username}</p>
                    <p className="text-[10px] leading-none text-muted-text uppercase tracking-widest">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-noir-border" />
                <DropdownMenuItem asChild className="hover:bg-noir-border focus:bg-noir-border cursor-pointer">
                  <Link href={`/@${user.username}`} className="w-full text-xs font-mono uppercase tracking-widest py-2">
                    Your Channel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-noir-border focus:bg-noir-border cursor-pointer">
                  <Link href="/studio/customization" className="w-full text-xs font-mono uppercase tracking-widest py-2">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-noir-border" />
                <DropdownMenuItem className="text-signal-red hover:bg-noir-border focus:bg-noir-border cursor-pointer text-xs font-mono uppercase tracking-widest py-2" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Terminate Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-xs font-mono uppercase tracking-widest hover:text-electric-lime text-white">
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild className="bg-white text-black hover:bg-electric-lime transition-colors text-xs font-mono uppercase tracking-widest px-4">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
