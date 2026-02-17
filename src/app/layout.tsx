import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { getSession } from "@/actions/auth";
import { getSubscriptions } from "@/actions/subscription";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { SessionGuard } from "@/components/SessionGuard";
import { Toaster } from "@/components/ui/sonner";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

import { SidebarProvider } from "@/lib/sidebar-context";

export const metadata: Metadata = {
  title: "OpenStream",
  description: "Open-source video streaming architecture",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, subscriptions] = await Promise.all([getSession(), getSubscriptions()]);

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${interTight.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-mono min-h-screen relative`}>
        <SidebarProvider>
          <SessionGuard />
          <Sidebar subscriptions={subscriptions} isAuthenticated={!!session?.user} />
          <div className="flex min-h-screen flex-col relative z-0 md:pl-16">
            <Navbar user={session?.user} />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}

