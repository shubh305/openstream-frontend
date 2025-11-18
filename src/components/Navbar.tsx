"use client";

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

interface User {
    username: string;
    email: string;
    avatarUrl?: string;
}

interface NavbarProps {
    user?: User; 
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-white px-4 dark:bg-black dark:border-white/10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
        </Button>
        <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                OS
            </div>
            <span className="hidden text-lg font-bold tracking-tight md:block">OpenStream</span>
        </Link>
      </div>

      <div className="ml-auto flex w-full max-w-sm items-center gap-2 md:mx-auto">
        <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search..."
                className="w-full bg-neutral-100 pl-9 dark:bg-neutral-900 md:w-[300px] lg:w-[400px]"
            />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {user ? (
            <>
                <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
                    <Link href="/upload">
                        <Upload className="h-5 w-5" />
                    </Link>
                </Button>
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatarUrl} alt={user.username} />
                                <AvatarFallback>{user.username[0]}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.username}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                             <Link href="/upload">Upload Video</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                             <Link href="/live/go">Go Live</Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem>
                             Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={() => logout()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        ) : (
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Sign In</Link>
                </Button>
                 <Button size="sm" asChild>
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
        )}
      </div>
    </header>
  );
}
