import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";
import logoMarkSrc from "@/assets/icons/Logo Mark.svg";
import Image from "next/image";
export default function LogoButton({ className = "", href = "/" }) {
  return (
    <Link
      href={href}
      className={twMerge(
        "font-medium text-lg tracking-tight flex items-center gap-2",
        className,
      )}
    >
      <Image
        src={logoMarkSrc}
        alt="Logo Mark"
        width={28}
        height={28}
        className="size-8 md:size-10"
      />
      Lura
    </Link>
  );
}
