import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { getSession } from "@/lib/auth";
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
import { User } from "@/types/api";

export const metadata: Metadata = {
  title: "OpenStream",
  description: "Open-source video streaming architecture",
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
      <body className={`${interTight.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-mono min-h-screen relative`}>
        <SidebarProvider>
          <SessionGuard isAuthenticated={!!session} />
          <Sidebar subscriptions={subscriptions} isAuthenticated={!!session} />
          <div className="flex min-h-screen flex-col relative z-0 md:pl-16">
            <Navbar user={session} />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}

