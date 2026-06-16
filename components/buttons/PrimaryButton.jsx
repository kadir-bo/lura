import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";

export default function PrimaryButton({
  iconSize = 19,
  className = "",
  onClick,
  href = null,
  active = false,
  filled = false,
  tooltip = null,
  tooltipPosition = "top",
  activeClassName = "",
  cta = null,
  children,
  ...props
}) {
  const base = `
    min-w-max w-full font-normal text-sm
    flex justify-start items-center gap-1.5
    px-3 py-2 md:py-2.5
    rounded-lg cursor-pointer outline-none
    transition-colors duration-100
    relative group/btn
    text-[var(--text-2)]
    hover:text-foreground
    hover:bg-[var(--interactive-hover)]
    border border-transparent
  `;

  const filledCls = filled
    ? "bg-[var(--interactive)] text-[var(--bg)] hover:bg-white/90 hover:text-[var(--bg)] border-transparent"
    : "";

  const activeCls = active
    ? "bg-[var(--interactive-hover)] text-foreground border-[var(--border-med)]"
    : "";

  const hasActiveCls = active && activeClassName ? activeClassName : "";
  const ctaCls = cta ? "text-base py-3 font-medium" : "";

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const tooltipEl = tooltip && (
    <span
      className={twMerge(
        "absolute whitespace-nowrap bg-[var(--overlay)] text-foreground text-xs px-2 py-1 rounded-md",
        "border border-[var(--border)] shadow-[var(--shadow-sm)]",
        "opacity-0 group-hover/btn:opacity-100 pointer-events-none",
        "transition-opacity duration-150 group-hover/btn:delay-500 delay-0 z-50",
        positions[tooltipPosition],
      )}
    >
      {tooltip}
    </span>
  );

  const merged = twMerge(
    base,
    filledCls,
    activeCls,
    hasActiveCls,
    ctaCls,
    className,
  );

  return href ? (
    <Link href={href} className={merged} onClick={onClick} {...props}>
      {tooltipEl}
      {children}
    </Link>
  ) : (
    <button className={merged} onClick={onClick} {...props}>
      {tooltipEl}
      {children}
    </button>
  );
}
