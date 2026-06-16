"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import {
  AlertCircle,
  CheckCircle,
  Info,
  X,
  AlertTriangle,
} from "react-feather";

const CONFIGS = {
  success: {
    icon: CheckCircle,
    accent: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
  },
  error: {
    icon: AlertCircle,
    accent: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
  },
  warning: {
    icon: AlertTriangle,
    accent: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  info: {
    icon: Info,
    accent: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.2)",
  },
};

const detectVariant = (msg) => {
  if (!msg) return "error";
  const m = msg.toLowerCase();
  if (
    m.includes("success") ||
    m.includes("created") ||
    m.includes("saved") ||
    m.includes("deleted") ||
    m.includes("added") ||
    m.includes("renamed")
  )
    return "success";
  if (m.includes("warning") || m.includes("caution")) return "warning";
  if (m.includes("info") || m.includes("note")) return "info";
  return "error";
};

export default function Message({
  message,
  className = "",
  variant = null,
  onClose = null,
  autoHideDuration = 3500,
}) {
  const currentVariant = variant || detectVariant(message);
  const config = CONFIGS[currentVariant] || CONFIGS.error;
  const IconComp = config.icon;

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClose?.(), autoHideDuration);
    return () => clearTimeout(timer);
  }, [message, autoHideDuration, onClose]);

  return (
    <motion.div
      key={message}
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={twMerge(
        "relative flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl shadow-lg overflow-hidden",
        "min-w-52 max-w-80 border",
        className,
      )}
      style={{
        background: "var(--elevated)",
        borderColor: config.border,
      }}
    >
      <IconComp
        size={16}
        className="shrink-0"
        style={{ color: config.accent }}
      />

      <p
        className="text-sm font-medium flex-1 leading-snug"
        style={{ color: "var(--text-1)" }}
      >
        {message}
      </p>

      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-0.5 rounded-md transition-colors duration-100 hover:bg-white/10 outline-none"
          style={{ color: "var(--text-3)" }}
          aria-label="Dismiss"
        >
          <X size={13} />
        </button>
      )}
    </motion.div>
  );
}
