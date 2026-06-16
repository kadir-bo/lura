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
      className="relative inline-flex shrink-0 items-center rounded-full transition-colors duration-150 outline-none disabled:opacity-40"
      style={{
        width: 32,
        height: 18,
        background: checked
          ? "var(--interactive)"
          : indeterminate
            ? "var(--border-hi)"
            : "var(--border-med)",
      }}
    >
      <span
        className="inline-block rounded-full transition-transform duration-150"
        style={{
          width: 12,
          height: 12,
          background: on ? "var(--bg)" : "var(--text-3)",
          transform: checked
            ? "translateX(17px)"
            : indeterminate
              ? "translateX(10px)"
              : "translateX(3px)",
        }}
      />
    </button>
  );
}
