"use client";

import { StudioSidebar } from "@/features/studio/components/StudioSidebar";

export default function StudioDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen md:min-h-[calc(100vh-4rem)] bg-noir-deep relative z-0">
      <StudioSidebar />
      <main className="flex-1 bg-noir-deep p-0 md:p-4 lg:p-8 pb-32 md:pb-8">{children}</main>
    </div>
  );
}
