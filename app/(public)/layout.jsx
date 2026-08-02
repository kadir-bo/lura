"use client";

import { PublicHeader } from "@/components";
import { useAuth } from "@/context";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function PublicLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/chat");
  }, [loading, router, user]);

  return (
    <React.Fragment>
      <PublicHeader />
      <main className="h-dvh pt-14 flex flex-col">{children}</main>
    </React.Fragment>
  );
}
