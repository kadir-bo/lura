"use client";

import { ChatHeader, Message, Sidebar } from "@/components";
import { PrivateRoute } from "@/lib";
import React, { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks";

export default function ChatLayout({ children }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (isMobile) setIsOpen(false);
  }

  const handleToggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);
  const handleCloseSidebar = useCallback(() => setIsOpen(false), []);

  return (
    <PrivateRoute>
      <main className="h-dvh flex flex-row" style={{ background: "var(--bg)" }}>
        <Sidebar
          isOpen={isOpen}
          isMobile={isMobile}
          handleCloseSidebar={handleCloseSidebar}
          handleToggleSidebar={handleToggleSidebar}
        />
        <div
          className="flex flex-col w-full relative"
          style={{ background: "var(--bg)" }}
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
