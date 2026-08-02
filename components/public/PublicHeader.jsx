"use client";

import React, { useState } from "react";
import { LogoButton, PrimaryButton } from "@/components";
import { useAuth } from "@/context";

export default function PublicHeader() {
  const [isStartingDemo, setIsStartingDemo] = useState(false);
  const { user, signInAsDemo, error } = useAuth();
  const handleDemoSignIn = async () => {
    if (user) return;

    setIsStartingDemo(true);
    try {
      await signInAsDemo();
    } catch (error) {
      console.error("Demo sign-in error:", error);
    } finally {
      setIsStartingDemo(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full flex flex-col z-999 border-b border-border bg-background">
      <nav className="flex items-center justify-between max-w-500 w-full mx-auto px-4 lg:px-12 h-14">
        <LogoButton />
        <div className="w-max flex items-center justify-end gap-2">
          <PrimaryButton
            className="justify-center w-max hidden md:flex border-border hover:border-border-med text-white"
            href="/sign-in"
          >
            Sign In
          </PrimaryButton>
          <PrimaryButton
            filled
            className="justify-center w-max hidden md:flex border-border hover:border-border-med font-medium"
            onClick={handleDemoSignIn}
            disabled={isStartingDemo}
          >
            {isStartingDemo ? "Starting demo…" : "Continue with demo account"}
          </PrimaryButton>
        </div>
      </nav>
      {error && (
        <p className="absolute right-4 top-16 max-w-sm rounded-lg border border-danger/30 bg-overlay px-3 py-2 text-xs text-danger shadow-lg">
          {error}
        </p>
      )}
    </header>
  );
}
