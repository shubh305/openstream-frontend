import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { getSession } from "@/lib/auth";
import { getSubscriptions } from "@/actions/subscription";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { SessionGuard } from "@/components/SessionGuard";
import { Toaster } from "@/components/ui/sonner";
import { BottomNavbar } from "@/components/BottomNavbar";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

import { SidebarProvider } from "@/lib/sidebar-context";
import { User } from "@/types/api";
import { AnalyticsProvider } from "@/providers/AnalyticsProvider";

export const metadata: Metadata = {
  title: "OpenStream",
  description: "Watch, Stream, Follow Popular Creators",
  openGraph: {
    type: "website",
    url: "https://openstream.octanebrew.dev/",
    title: "OpenStream",
    description: "Watch, Stream, Follow Popular Creators",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "OpenStream Platform",
      },
    ],
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionData = (await getSession()) as { user: User; accessToken: string } | null;
  const session = sessionData?.user;
  const subscriptions = session ? await getSubscriptions() : [];

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${interTight.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-mono min-h-screen relative overflow-x-hidden no-scrollbar`}>
        <AnalyticsProvider>
          <SidebarProvider>
            <SessionGuard isAuthenticated={!!session} />
            <div className="flex min-h-screen w-full relative">
              <Sidebar subscriptions={subscriptions} isAuthenticated={!!session} />
              <div className="flex-1 flex flex-col relative z-0 w-full min-w-0">
                <Navbar user={session} />
                <main className="flex-1 flex flex-col relative pb-20 md:pb-0">{children}</main>
              </div>
            </div>
            <BottomNavbar user={session} />
          </SidebarProvider>
        </AnalyticsProvider>
        <Toaster />
      </body>
    </html>
  );
}
