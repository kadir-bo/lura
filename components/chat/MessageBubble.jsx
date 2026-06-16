"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";
import {
  PrimaryButton,
  AttachmentThumbnail,
  Backdrop,
  MobileContextMenu,
  Icon,
} from "@/components";
import { getBubbleRadius, getCodeText, copyToClipboard } from "@/lib";
import { AnimatePresence } from "framer-motion";
import { Copy, RefreshCcw, RotateCcw, Check, Edit2, X, ChevronLeft, ChevronRight } from "react-feather";
import { useIsMobile, useLongPress } from "@/hooks";

export default function MessageBubble({ message, onRegenerate, onEdit }) {
  const isUser = message.role === "user";
  const isStreaming = message.id === "streaming";

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [menuOpen, setMenuOpen] = useState(false);

  // Version navigation
  const allVersions = message.versions?.length > 0
    ? [...message.versions, { content: message.content, model: message.model }]
    : [];
  const hasVersions = allVersions.length > 1;
  const [versionIdx, setVersionIdx] = useState(() => Math.max(0, allVersions.length - 1));

  useEffect(() => {
    if (allVersions.length > 0) setVersionIdx(allVersions.length - 1);
  }, [allVersions.length]);

  const displayContent = hasVersions ? (allVersions[versionIdx]?.content ?? message.content) : message.content;

  const textareaRef = useRef(null);
  const bubbleRef = useRef(null);
  const pressPointRef = useRef(null);
  const didScrollRef = useRef(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isEditing || !textareaRef.current) return;
    const el = textareaRef.current;
    el.focus();
    el.selectionStart = el.value.length;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [isEditing]);

  const handleCopy = (text) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleEditSubmit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== message.content) onEdit?.(message.id, trimmed);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditValue(message.content);
    setIsEditing(false);
  };

  const handleTextareaChange = (e) => {
    setEditValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleEditSubmit();
    }
    if (e.key === "Escape") handleEditCancel();
  };

  const CopyIcon = copied ? { icon: Check, text: "Copied" } : { icon: Copy };

  const userActions = [
    {
      id: "edit",
      Icon: Edit2,
      title: "Edit",
      onClick: () => { closeMenu(); setIsEditing(true); },
    },
    {
      id: "copy",
      Icon: CopyIcon.icon,
      title: "Copy",
      onClick: () => { closeMenu(); handleCopy(message.content); },
    },
    {
      id: "resend",
      Icon: RotateCcw,
      title: "Resend",
      onClick: () => { closeMenu(); onRegenerate?.(message.id); },
    },
  ];

  const assistantActions = [
    {
      id: "copy",
      Icon: CopyIcon.icon,
      title: "Copy",
      onClick: () => { closeMenu(); handleCopy(displayContent); },
    },
    {
      id: "regen",
      Icon: RefreshCcw,
      title: "Regenerate",
      onClick: () => { closeMenu(); onRegenerate?.(message.id); },
    },
  ];

  const actions = isUser ? userActions : assistantActions;

  const handleLongPress = useCallback(() => {
    if (isStreaming || isEditing) return;
    navigator.vibrate?.(8);
    setMenuOpen(true);
  }, [isStreaming, isEditing]);

  const lp = useLongPress(handleLongPress);

  const bubbleHandlers = {
    onMouseLeave: (e) => { if (!menuOpen) lp.onMouseLeave(e); },
    onTouchStart: (e) => {
      if (menuOpen) return;
      didScrollRef.current = false;
      pressPointRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lp.onTouchStart(e);
    },
    onTouchMove: (e) => { if (!menuOpen) { didScrollRef.current = true; lp.onTouchMove(e); } },
    onTouchEnd: (e) => { if (!menuOpen) lp.onTouchEnd(e); },
    onContextMenu: (e) => { if (!menuOpen) lp.onContextMenu(e); },
  };

  const canAnimate = !isStreaming && !isEditing && !menuOpen;

  /* ── Action button shared styles ─────────────────────────────────── */
  const actionBtnCls =
    "outline-none border-none min-w-0 cursor-pointer p-1.5 rounded-md transition-colors duration-100 hover:bg-[var(--elevated)]";

  return (
    <>
      <AnimatePresence>
        {menuOpen && isMobile && (
          <>
            <Backdrop onClose={closeMenu} />
            <MobileContextMenu
              actions={actions}
              bubbleRef={bubbleRef}
              pressPoint={pressPointRef.current}
              isUser={isUser}
              onClose={closeMenu}
            />
          </>
        )}
      </AnimatePresence>

      <div
        ref={bubbleRef}
        className={`flex select-none md:select-auto ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div className={`flex flex-col w-full ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`group flex flex-col relative w-full ${isUser ? "items-end" : "items-start"}`}
          >
            {/* Attachments */}
            {isUser && message.attachments?.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2 max-w-[80%]">
                {message.attachments.map((attachment) => (
                  <AttachmentThumbnail
                    key={attachment.id}
                    attachment={attachment}
                    className="max-w-xs"
                    readOnly
                  />
                ))}
              </div>
            )}

            {/* Bubble */}
            <motion.div
              className={clsx(
                "w-full p-2",
                menuOpen && "relative z-9999",
                isUser
                  ? clsx(
                      "w-max max-w-[88%] lg:max-w-[76%] border rounded-2xl px-4 py-2.5",
                      isEditing
                        ? "border-[var(--border-hi)] bg-transparent"
                        : "border-[var(--border-med)] bg-[var(--elevated)]",
                    )
                  : "",
              )}
              style={{
                ...(isUser && !isEditing ? { background: "var(--elevated)" } : {}),
                ...(isUser ? { borderRadius: getBubbleRadius(message.content) } : {}),
              }}
              whileTap={
                canAnimate && !didScrollRef.current && isMobile
                  ? { y: 2, transition: { type: "spring", stiffness: 600, damping: 30 } }
                  : {}
              }
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              {...bubbleHandlers}
            >
              {isUser ? (
                isEditing ? (
                  <div className="flex flex-col gap-2 min-w-60">
                    <textarea
                      ref={textareaRef}
                      value={editValue}
                      onChange={handleTextareaChange}
                      onKeyDown={handleEditKeyDown}
                      rows={1}
                      className="w-full resize-none bg-transparent text-sm outline-none overflow-hidden"
                      style={{ color: "var(--text-1)" }}
                    />
                  </div>
                ) : (
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "var(--text-1)" }}
                  >
                    {message.content}
                  </p>
                )
              ) : (
                <div className="markdown prose prose-invert max-w-none min-w-0 w-full">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    components={{
                      p: ({ children }) => <div>{children}</div>,
                      table: ({ children }) => (
                        <div className="table-wrapper">
                          <table>{children}</table>
                        </div>
                      ),
                      pre: ({ children }) => (
                        <div className="relative group/code">
                          <button
                            onClick={() => handleCopy(getCodeText(children))}
                            className="absolute right-2 top-2 flex items-center gap-1 text-[11px] opacity-0 group-hover/code:opacity-100 transition-opacity duration-150 px-2 py-1 rounded-md cursor-pointer border border-[var(--border)] hover:border-[var(--border-med)]"
                            style={{ background: "var(--overlay)", color: "var(--text-2)" }}
                          >
                            <Icon name={CopyIcon.icon} size="xs" />
                            {CopyIcon.text}
                          </button>
                          <pre className="overflow-x-auto mt-2 p-1 rounded-xl [&>code]:rounded-md">
                            {children}
                          </pre>
                        </div>
                      ),
                    }}
                  >
                    {displayContent}
                  </ReactMarkdown>
                  {isStreaming && (
                    <span className="cursor-blink" />
                  )}
                </div>
              )}
            </motion.div>

            {/* Desktop hover actions */}
            {!isStreaming && !isEditing && (
              <div
                className={`hidden md:flex items-center text-xs mt-1.5 gap-0.5 transition-all duration-100 ${
                  isUser
                    ? "justify-end opacity-0 group-hover:opacity-100 mr-1"
                    : "justify-start opacity-0 group-hover:opacity-100 ml-1"
                }`}
              >
                {actions.map(({ id, Icon: actionIcon, onClick, title }) => (
                  <button
                    key={id}
                    className={actionBtnCls}
                    style={{ color: "var(--text-3)" }}
                    onClick={onClick}
                    title={title}
                  >
                    <Icon name={actionIcon} size="xs" />
                  </button>
                ))}

                {/* Version navigation */}
                {!isUser && hasVersions && (
                  <>
                    <div className="w-px h-3 mx-0.5" style={{ background: "var(--border-med)" }} />
                    <button
                      className={actionBtnCls}
                      style={{ color: versionIdx === 0 ? "var(--text-4)" : "var(--text-3)" }}
                      onClick={() => setVersionIdx((i) => Math.max(0, i - 1))}
                      disabled={versionIdx === 0}
                      title="Previous version"
                    >
                      <Icon name={ChevronLeft} size="xs" />
                    </button>
                    <span className="text-[10px] tabular-nums px-0.5" style={{ color: "var(--text-3)" }}>
                      {versionIdx + 1}/{allVersions.length}
                    </span>
                    <button
                      className={actionBtnCls}
                      style={{ color: versionIdx === allVersions.length - 1 ? "var(--text-4)" : "var(--text-3)" }}
                      onClick={() => setVersionIdx((i) => Math.min(allVersions.length - 1, i + 1))}
                      disabled={versionIdx === allVersions.length - 1}
                      title="Next version"
                    >
                      <Icon name={ChevronRight} size="xs" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Edit action buttons */}
            {isEditing && (
              <div className="flex items-center gap-1 justify-end mt-1">
                <button
                  onClick={handleEditCancel}
                  className={actionBtnCls}
                  style={{ color: "var(--text-2)" }}
                >
                  <Icon name={X} size="xs" />
                </button>
                <button
                  onClick={handleEditSubmit}
                  className={actionBtnCls}
                  style={{ color: "var(--text-2)" }}
                >
                  <Icon name={Check} size="xs" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
