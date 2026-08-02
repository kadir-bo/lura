import { motion, AnimatePresence } from "framer-motion";

export default function ProcessingIndicator({ message, tone = "neutral" }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`text-xs tracking-wide px-1 ${
            tone === "error" ? "text-danger" : "text-text-muted"
          }`}
          role={tone === "error" ? "alert" : "status"}
        >
          {message}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
