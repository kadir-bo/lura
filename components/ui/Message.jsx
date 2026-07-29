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
    className: "border-success/20 bg-success/10",
    iconClassName: "text-success",
  },
  error: {
    icon: AlertCircle,
    className: "border-danger/20 bg-danger/10",
    iconClassName: "text-danger",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-warning/20 bg-warning/10",
    iconClassName: "text-warning",
  },
  info: {
    icon: Info,
    className: "border-interactive/20 bg-interactive/10",
    iconClassName: "text-interactive",
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
        "min-w-52 max-w-80 border bg-elevated",
        config.className,
        className,
      )}
    >
      <IconComp
        size={16}
        className={`shrink-0 ${config.iconClassName}`}
      />

      <p
        className="text-sm font-medium flex-1 leading-snug text-text-primary"
      >
        {message}
      </p>

      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-0.5 rounded-md transition-colors duration-100 hover:bg-white/10 outline-none text-text-muted"
          aria-label="Dismiss"
        >
          <X size={13} />
        </button>
      )}
    </motion.div>
  );
}
