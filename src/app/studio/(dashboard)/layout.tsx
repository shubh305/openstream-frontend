"use client";

import { StudioSidebar } from "@/features/studio/components/StudioSidebar";

export default function StudioDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden relative z-0">
      <StudioSidebar />
      <main className="flex-1 overflow-y-auto bg-background p-8">
        {children}
      </main>
    </div>
  );
}
