"use client";

import { motion, AnimatePresence } from "framer-motion";

const cardVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: "easeIn" } },
};

export default function AuthFormShell({
  title,
  error,
  footer,
  animKey = "default",
  children,
}) {
  return (
    <div className="w-full max-w-sm px-4 md:px-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={animKey}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="p-8 md:border border-[var(--border)] rounded-2xl bg-[var(--surface)]"
        >
          {title && (
            <h2
              className="text-xl font-semibold mb-7 tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              {title}
            </h2>
          )}

          <div className="space-y-0">{children}</div>

          <AnimatePresence>
            {error && (
              <motion.p
                key="auth-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-[var(--danger)] text-sm"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {footer && (
            <div className="mt-6 text-center text-sm text-[var(--text-2)]">
              {footer}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
