import React from "react";
import { LogoButton, PrimaryButton } from "@/components";

export default function PublicHeader() {
  return (
    <header
      className="fixed top-0 left-0 w-full flex flex-col z-999 border-b"
      style={{ background: "var(--bg)", borderColor: "var(--border)" }}
    >
      <nav className="flex items-center justify-between max-w-500 w-full mx-auto px-4 lg:px-12 h-14">
        <LogoButton />
        <div className="w-max flex items-center justify-end gap-2">
          <PrimaryButton
            className="justify-center w-max hidden md:flex border-[var(--border)] hover:border-[var(--border-med)]"
            href="/sign-up"
          >
            Sign up
          </PrimaryButton>
          <PrimaryButton
            className="justify-center w-max"
            href="/sign-in"
            filled
          >
            Sign in
          </PrimaryButton>
        </div>
      </nav>
    </header>
  );
}
