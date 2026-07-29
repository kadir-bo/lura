import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";

const TOOLTIP_POSITIONS = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export default function Button({
  className = "",
  onClick,
  href = null,
  active = false,
  filled = false,
  tooltip = null,
  tooltipPosition = "top",
  activeClassName = "",
  disabled = false,
  children,
  ...props
}) {
  const classes = twMerge(
    "relative group/btn w-full px-4 py-2.5 rounded-lg font-medium text-sm outline-none cursor-pointer",
    "border transition-colors duration-100",
    "flex items-center justify-center gap-2",
    "border-border-med text-text-secondary",
    "hover:border-border-hi hover:text-foreground hover:bg-interactive-hover",
    filled &&
      "bg-interactive border-transparent text-background hover:bg-white/90 hover:text-background hover:border-transparent",
    active &&
      "bg-interactive-hover border-border-med text-foreground",
    active && activeClassName,
    disabled && "opacity-30 cursor-not-allowed pointer-events-none",
    className,
  );

  const tooltipEl = tooltip && (
    <span
      className={twMerge(
        "absolute whitespace-nowrap text-xs px-2 py-1 rounded-md z-50",
        "border shadow-sm",
        "opacity-0 pointer-events-none",
        "transition-opacity duration-150 group-hover/btn:opacity-100 group-hover/btn:delay-500",
        TOOLTIP_POSITIONS[tooltipPosition] ?? TOOLTIP_POSITIONS.top,
        "bg-overlay border-border text-text-primary",
      )}
    >
      {tooltip}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled} {...props}>
        {tooltipEl}
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {tooltipEl}
      {children}
    </button>
  );
}
