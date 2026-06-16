import { motion, AnimatePresence } from "framer-motion";

export default function ProcessingIndicator({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs tracking-wide px-1"
          style={{ color: "var(--text-3)" }}
        >
          {message}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
