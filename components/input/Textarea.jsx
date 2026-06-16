"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Lock } from "react-feather";
import { Icon } from "@/components";

export default function Textarea({
  id = "",
  name = "",
  label = "label",
  value = "",
  placeholderArray = [],
  placeholder = "",
  disabled = false,
  autoFocus = false,
  locked = false,
  containerClassName = "",
  inputClassName = "",
  labelClassName = "",
  rows = 4,
  maxLength,
  onChange = () => null,
  onKeyDown = () => null,
  onBlur = () => null,
  onFocus = () => null,
}) {
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!placeholderArray || placeholderArray.length === 0) return;
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholderArray.length);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholderArray, isAnimating]);

  const handleAnimationComplete = () => {
    setTimeout(() => setIsAnimating(false), 500);
  };

  const lockedCls = locked ? "opacity-50 cursor-not-allowed" : "";

  return (
    <div className={twMerge("w-full min-w-40 relative", containerClassName, lockedCls)}>
      <label
        htmlFor={id}
        className={twMerge("mb-1.5 text-sm ml-px flex gap-1 items-center pl-px", labelClassName, lockedCls)}
        style={{ color: "var(--text-2)" }}
      >
        {label}
        {locked && <Icon name={Lock} size="xs" style={{ color: "var(--text-3)" }} />}
      </label>

      <textarea
        name={name || id}
        id={id}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        rows={rows}
        maxLength={maxLength}
        className={twMerge(
          "border w-full px-3 py-2.5 rounded-lg outline-none resize-none",
          "transition-colors duration-100",
          "focus:border-[var(--border-hi)]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "placeholder:text-[var(--text-3)]",
          inputClassName,
          lockedCls,
        )}
        style={{
          borderColor: "var(--border-med)",
          background: "transparent",
          color: "var(--text-1)",
        }}
      />

      <AnimatePresence mode="wait">
        {!value && placeholderArray.length > 0 && (
          <motion.span
            key={currentPlaceholderIndex}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 0.4, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.35 }}
            onAnimationComplete={handleAnimationComplete}
            className="absolute z-50 top-12 md:top-7 left-0 pt-2 pl-3 pointer-events-none select-none text-sm"
            style={{ color: "var(--text-2)" }}
          >
            {placeholderArray[currentPlaceholderIndex]}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
