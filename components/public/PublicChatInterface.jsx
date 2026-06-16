"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { ArrowUp, Plus, Square } from "react-feather";

import {
  PrimaryButton,
  AttachmentThumbnail,
  ChatFooterMessage,
  Icon,
} from "@/components";
import { useChat } from "@/context";
import {
  usePasteHandler,
  useFileSelectHandler,
  useKeyboardHandler,
  useIsMobile,
} from "@/hooks";
import {
  getContainerVariant,
  getTextAreaVariant,
  ACCEPTED_FILE_TYPES,
  buildContextMessages,
  buildSystemPromptWithMemories,
  trimMessagesToTokenLimit,
  generateId,
} from "@/lib";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_CONTEXT_MSGS = 10;
const MAX_TOKENS = 100_000;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PublicChatInterface({
  // Data
  messages = [],
  onMessages,
  // Lifecycle callbacks
  onBeforeSend,
  onAfterSend,
  // Model / prompt
  model = "meta/llama-3.1-8b-instruct",
  systemPrompt = "",
  // Styling overrides
  className = "",
  containerClassName = "",
  textareaClassName = "",
  textareaExpandedClassName = "",
  buttonClassName = "",
  attachmentButtonClassName = "",
  sendButtonClassName = "",
  // Layout
  buttonIconSize = 20,
  textAreaGrowHeight = 180,
  buttonContainerHeight = 50,
  // Behaviour
  placeholder = "Ask anything…",
  autofocus = true,
  indicator = true,
}) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const [localUserInput, setLocalUserInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const {
    attachments,
    addAttachment,
    removeAttachment,
    clearAttachments,
    isLoading,
    stopGeneration,
  } = useChat();

  // ── Input helpers ─────────────────────────────────────────────────────────

  const resetInput = useCallback(() => {
    setLocalUserInput("");
    setIsExpanded(false);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      if (!isMobile) el.focus();
    }
  }, [isMobile]);

  const checkExpanded = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const lineHeight = parseInt(getComputedStyle(el).lineHeight, 10);
    setIsExpanded(el.scrollHeight > lineHeight + 24); // 24 = paddingY
  }, []);

  const handleChange = useCallback((e) => {
    setLocalUserInput(e.target.value);
    if (!e.target.value) setIsExpanded(false);
  }, []);

  const handlePaste = usePasteHandler(
    textareaRef,
    localUserInput,
    setLocalUserInput,
    addAttachment,
  );
  const handleFileSelect = useFileSelectHandler(addAttachment);

  // ── Send ──────────────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = localUserInput.trim();
    if ((!text && attachments.length === 0) || isLoading) return;
    if (onBeforeSend?.() === false) return;

    // Inline attachment content
    const messageText = attachments.reduce((acc, att) => {
      if (att.type === "code")
        return `${acc}\n\n\`\`\`\n${att.content}\n\`\`\``;
      if (att.type === "text") return `${acc}\n\n${att.content}`;
      return acc;
    }, text);

    clearAttachments();
    resetInput();

    // Optimistic user message
    const userMsg = { id: generateId(), role: "user", content: messageText };
    onMessages?.((prev) => [...prev, userMsg]);

    if (onAfterSend) {
      const builtSystemPrompt =
        systemPrompt || buildSystemPromptWithMemories([], "", null);

      // Build & trim history — currently unused in the parent call
      // but kept for potential future use / logging
      trimMessagesToTokenLimit(
        buildContextMessages(
          messages,
          messageText,
          MAX_CONTEXT_MSGS,
          builtSystemPrompt,
        ),
        MAX_TOKENS,
      );

      await onAfterSend(messages, messageText);
    }

    setTimeout(() => {
      if (!isMobile) textareaRef.current?.focus();
    }, 0);
  }, [
    isMobile,
    localUserInput,
    attachments,
    isLoading,
    messages,
    systemPrompt,
    clearAttachments,
    resetInput,
    onMessages,
    onBeforeSend,
    onAfterSend,
  ]);

  const handleKeyDown = useKeyboardHandler(handleSend, setLocalUserInput);

  // ── Framer Motion variants ────────────────────────────────────────────────

  const containerVariant = useMemo(
    () => getContainerVariant(textAreaGrowHeight),
    [textAreaGrowHeight],
  );
  const textAreaVariant = useMemo(
    () => getTextAreaVariant(buttonContainerHeight),
    [buttonContainerHeight],
  );

  // ── Shared button classes ─────────────────────────────────────────────────

  const baseButtonCls = twMerge(
    "flex items-center justify-center w-9 h-9 rounded-full shrink-0",
    buttonClassName,
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className={twMerge(
        // Full-width on mobile, capped on desktop
        "w-full relative max-w-3xl mx-auto py-3 sm:py-4 flex flex-col",
        // Safe-area padding for notched phones
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      {/* ── Attachment previews ─────────────────────────────────────────── */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            key="attachments"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className={twMerge(
              "flex flex-wrap gap-2 mb-2",
              // Scrollable row on very small screens
              "max-h-28 overflow-y-auto",
            )}
          >
            {attachments.map((attachment) => (
              <AttachmentThumbnail
                key={attachment.id}
                attachment={attachment}
                onRemove={() => removeAttachment(attachment.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input container ─────────────────────────────────────────────── */}
      <motion.div
        className={twMerge(
          "flex flex-col justify-end relative mb-6 sm:mb-8",
          "rounded-2xl border border-[var(--border-med)] focus-within:border-[var(--border-hi)]",
          "transition-colors duration-150",
          containerClassName,
        )}
        style={{ background: "var(--elevated)" }}
        variants={containerVariant}
        initial="initial"
        animate={isExpanded ? "animate" : "initial"}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="flex items-end justify-between gap-1 p-1.5">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_FILE_TYPES}
            onChange={handleFileSelect}
            className="hidden"
            aria-hidden="true"
          />

          {/* Attach button */}
          <PrimaryButton
            className={twMerge(
              baseButtonCls,
              "border-[var(--border)] hover:border-[var(--border-med)] hover:bg-[var(--overlay)] transition-colors duration-100",
              attachmentButtonClassName,
            )}
            style={{ color: "var(--text-2)" }}
            disabled={isLoading}
            tooltip="Add files"
            aria-label="Add files"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name={Plus} size="md" />
          </PrimaryButton>

          {/* Textarea */}
          <motion.textarea
            ref={textareaRef}
            name="user-input"
            id="user-input"
            placeholder={placeholder}
            className={twMerge(
              "resize-none flex-1 min-w-0 px-1 py-1 bg-transparent",
              "text-sm leading-relaxed",
              "overflow-y-auto no-scrollbar outline-none",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "placeholder:text-[var(--text-3)]",
              "touch-manipulation",
              textareaClassName,
              isExpanded && textareaExpandedClassName,
            )}
            style={{ color: "var(--text-1)" }}
            value={localUserInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onInput={checkExpanded}
            variants={textAreaVariant}
            initial="initial"
            animate={isExpanded ? "animate" : "initial"}
            disabled={isLoading}
            autoFocus={autofocus && !isMobile}
            rows={1}
            aria-label="Message input"
          />

          {/* Send / Stop button */}
          {isLoading ? (
            <PrimaryButton
              className={twMerge(
                baseButtonCls,
                "bg-[var(--interactive)] hover:bg-white/90 transition-colors duration-100",
                sendButtonClassName,
              )}
              style={{ color: "var(--bg)" }}
              tooltip="Stop generation"
              aria-label="Stop generation"
              onClick={stopGeneration}
            >
              <Icon name={Square} size="sm" className="fill-current stroke-transparent" />
            </PrimaryButton>
          ) : (
            <PrimaryButton
              className={twMerge(
                baseButtonCls,
                "bg-[var(--interactive)] hover:bg-white/90 transition-colors duration-100",
                sendButtonClassName,
              )}
              style={{ color: "var(--bg)" }}
              tooltip="Send message"
              aria-label="Send message"
              onClick={handleSend}
            >
              <Icon name={ArrowUp} size="sm" />
            </PrimaryButton>
          )}
        </div>
      </motion.div>

      {/* ── Footer indicator ────────────────────────────────────────────── */}
      {indicator && <ChatFooterMessage />}
    </motion.div>
  );
}
