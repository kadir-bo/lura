import { useCallback, useRef, useState } from "react";

export function useScrollLock({ threshold = 80 } = {}) {
  const containerRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    isAtBottomRef.current = atBottom;
    setIsAtBottom(atBottom);
  }, [threshold]);

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    isAtBottomRef.current = true;
    setIsAtBottom(true);
  }, []);

  const scrollToBottomIfLocked = useCallback(() => {
    if (isAtBottomRef.current) scrollToBottom();
  }, [scrollToBottom]);

  return {
    containerRef,
    isAtBottomRef,
    isAtBottom,
    handleScroll,
    scrollToBottom,
    scrollToBottomIfLocked,
  };
}
