"use client";

import { useDropdown } from "@/context";
import { twMerge } from "tailwind-merge";

export default function DropdownTrigger({ children, className = "" }) {
  const { isOpen, setIsOpen, triggerRef } = useDropdown();

  const handleClick = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      ref={triggerRef}
      onClick={handleClick}
      aria-expanded={isOpen}
      aria-haspopup="true"
      className={twMerge("cursor-pointer flex items-center justify-center", className, isOpen && "opacity-100")}
    >
      {children}
    </div>
  );
}
