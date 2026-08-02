"use client";

import { ChatHeader, Message, Sidebar } from "@/components";
import { PrivateRoute } from "@/lib";
import React, { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks";

export default function ChatLayout({ children }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    if (!isMobile) return undefined;
    const animationFrame = requestAnimationFrame(() => setIsOpen(false));
    return () => cancelAnimationFrame(animationFrame);
  }, [isMobile, pathname]);

  const handleToggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);
  const handleCloseSidebar = useCallback(() => setIsOpen(false), []);

  return (
    <PrivateRoute>
      <main className="h-dvh flex flex-row bg-background">
        <Sidebar
          isOpen={isOpen}
          isMobile={isMobile}
          handleCloseSidebar={handleCloseSidebar}
          handleToggleSidebar={handleToggleSidebar}
        />
        <div
          className="flex flex-col w-full relative bg-background"
        >
          <ChatHeader
            handleToggleSidebar={handleToggleSidebar}
            handleCloseSidebar={handleCloseSidebar}
          />
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </main>
    </PrivateRoute>
  );
}
