"use client";

import React from "react";
import { Zap } from "react-feather";
import { AnimatePresence, motion } from "framer-motion";

// Animated save button — only visible when there are unsaved changes.
export function SaveBtn({ hasChanges, loading, saved, onClick }) {
  return (
    <AnimatePresence>
      {hasChanges && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          onClick={onClick}
          disabled={loading}
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-100 disabled:opacity-50"
          style={{ background: "var(--interactive)", color: "var(--bg)" }}
        >
          {loading ? "Saving…" : saved ? "Saved!" : "Save"}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// Titled section with a bottom-bordered header and optional header action.
export function Section({ title, children, action }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex items-center justify-between pb-2 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// Small accent badge marking a benchmarked high-throughput model.
export function FastBadge() {
  return (
    <span
      className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded"
      style={{
        background: "color-mix(in oklab, var(--interactive) 18%, transparent)",
        color: "var(--interactive)",
        letterSpacing: "0.03em",
      }}
    >
      <Zap size={9} className="fill-current" />
      Fast
    </span>
  );
}

// Label/value row with a bottom divider (last row omits the divider).
export function FieldRow({ label, children }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-2.5 border-b last:border-none"
      style={{ borderColor: "var(--border)" }}
    >
      <span className="text-sm shrink-0" style={{ color: "var(--text-2)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

export function SettingsInput({
  value,
  onChange,
  disabled,
  placeholder,
  type = "text",
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      type={type}
      className="text-sm px-3 py-1.5 rounded-lg border outline-none transition-colors duration-100 w-52 disabled:opacity-40"
      style={{
        background: "var(--elevated)",
        borderColor: "var(--border-med)",
        color: "var(--text-1)",
      }}
    />
  );
}
