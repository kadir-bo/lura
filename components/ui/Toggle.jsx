"use client";

import React from "react";

// On/off switch styled with the app's design tokens.
// `indeterminate` renders a partial state (used for provider groups
// where only some child models are enabled).
export default function Toggle({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  ariaLabel,
}) {
  const on = checked || indeterminate;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange?.(!checked);
      }}
      className={`relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition-colors duration-150 outline-none disabled:opacity-40 ${checked ? "bg-interactive" : indeterminate ? "bg-border-hi" : "bg-border-med"}`}
    >
      <span
        className={`inline-block h-3 w-3 rounded-full transition-transform duration-150 ${on ? "bg-background" : "bg-text-muted"} ${checked ? "translate-x-[17px]" : indeterminate ? "translate-x-2.5" : "translate-x-[3px]"}`}
      />
    </button>
  );
}
