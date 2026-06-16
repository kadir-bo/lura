"use client";

import { Message } from "@/components";
import { AnimatePresence } from "framer-motion";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export const ModalContext = createContext(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export default function ModalProvider({ children }) {
  const [modalStack, setModalStack] = useState([]);
  const [messageContent, setMessageContent] = useState();
  const [sidebarWidth, setSidebarWidth] = useState(0);

  useEffect(() => {
    let resizeObserver;

    const observe = () => {
      const sidebar = document.getElementById("sidebar");
      if (!sidebar) return false;

      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setSidebarWidth(entry.contentRect.width);
        }
      });

      resizeObserver.observe(sidebar);
      setSidebarWidth(sidebar.offsetWidth);
      return true;
    };

    if (!observe()) {
      // Sidebar not in DOM yet, wait for next frame
      const raf = requestAnimationFrame(() => observe());
      return () => cancelAnimationFrame(raf);
    }

    return () => resizeObserver?.disconnect();
  }, []);

  const openModal = useCallback((component, opts = {}) => {
    setModalStack((prev) => [...prev, { component, wide: opts.wide ?? false }]);
  }, []);

  const closeModal = useCallback(() => {
    setModalStack((prev) => prev.slice(0, -1));
  }, []);

  const openMessage = useCallback((message, variant = null) => {
    setMessageContent({ message, variant });
  }, []);

  const closeMessage = useCallback(() => {
    setMessageContent(null);
  }, []);

  const values = {
    openModal,
    closeModal,
    openMessage,
    closeMessage,
  };

  return (
    <ModalContext.Provider value={values}>
      {modalStack.map((modal, i) => (
        <div
          key={i}
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)", zIndex: 9999 + i }}
          onMouseDown={(e) => {
            // Only close the topmost modal when clicking its backdrop
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className={`relative rounded-2xl shadow-[var(--shadow-lg)] w-full mx-4 border overflow-hidden ${
              modal.wide
                ? "max-w-3xl max-h-[90vh]"
                : "p-6 max-w-md max-h-[90vh] overflow-auto"
            }`}
            style={{
              background: "var(--overlay)",
              borderColor: "var(--border-med)",
            }}
          >
            {modal.component}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {messageContent && (
          <div
            className="fixed bottom-6 z-10000 flex justify-center"
            style={{
              left: `${sidebarWidth}px`,
              width: `calc(100vw - ${sidebarWidth}px)`,
            }}
          >
            <Message
              message={messageContent?.message}
              variant={messageContent?.variant}
              onClose={closeMessage}
            />
          </div>
        )}
      </AnimatePresence>

      {children}
    </ModalContext.Provider>
  );
}
