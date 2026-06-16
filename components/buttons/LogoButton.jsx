import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import logo from "@/assets/icons/Logo.svg";
export default function LogoButton({ className = "", href = "/" }) {
  return (
    <Link
      href={href}
      className={twMerge("font-medium text-lg tracking-tight", className)}
    >
      Lura
    </Link>
  );
}
