"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat, useDatabase } from "@/context";
import { useScrollLock } from "@/hooks";
import {
  EmptyStateConversation,
  MessageBubble,
  ProcessingIndicator,
} from "@/components";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "react-feather";

const DEFAULT_MODEL = "meta/llama-3.1-8b-instruct";

export default function ChatConversation({
  onConversationLoad = null,
  bottomPadding = 200,
}) {
  const { chatId: conversationId } = useParams() ?? {};
  const router = useRouter();

  const {
    subscribeToMessages,
    getConversation,
    getProject,
    deleteMessage,
    addMessage,
    getMessages,
    updateConversation,
    updateUserProfile,
    updateProjectMemory,
    userProfile,
  } = useDatabase();

  const {
    currentStreamResponse,
    processingMessage,
    regenerateResponse,
    editAndResend,
    isLoading,
    generatingId,
  } = useChat();

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(!!conversationId);

  const suppressListenerRef = useRef(false);

  // ── Scroll ────────────────────────────────────────────────────────────────

  const {
    containerRef,
    handleScroll,
    scrollToBottom,
    scrollToBottomIfLocked,
    isAtBottom,
  } = useScrollLock({ threshold: 80 });

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);
  useEffect(() => {
    if (!currentStreamResponse) return;
    scrollToBottomIfLocked();
  }, [currentStreamResponse]);
  useEffect(() => {
    if (!processingMessage) return;
    scrollToBottom();
  }, [processingMessage]);

  // ── Load conversation + project ───────────────────────────────────────────

  useEffect(() => {
    if (!conversationId) return;

    const load = async () => {
      setLoading(true);
      try {
        const conv = await getConversation(conversationId);
        if (!conv) {
          router.push("/chat");
          return;
        }

        setConversation(conv);
        const proj = conv.projectId ? await getProject(conv.projectId) : null;
        setProject(proj);
        onConversationLoad?.({ conversation: conv, project: proj });
      } catch (err) {
        console.error("Failed to load conversation:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [conversationId]);

  // ── Realtime message listener ─────────────────────────────────────────────

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMessages(conversationId, (incoming) => {
      if (suppressListenerRef.current) return;
      setMessages(incoming);
    });
    return () => unsubscribe();
  }, [conversationId]);

  // ── Shared context args ───────────────────────────────────────────────────

  const sharedArgs = {
    conversationId,
    model: conversation?.model || DEFAULT_MODEL,
    deleteMessage,
    addMessage,
    getMessages,
    updateConversation,
    updateUserProfile,
    updateProjectMemory,
    userProfile,
    projectId: conversation?.projectId || null,
    project,
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRegenerate = useCallback(
    async (messageId) => {
      if (isLoading) return;
      const index = messages.findIndex((m) => m.id === messageId);
      if (index === -1) return;

      const targetMessage = messages[index];
      const keepUpTo = targetMessage.role === "user" ? index + 1 : index;
      const keptMessages = messages.slice(0, keepUpTo);
      const messagesToDelete = messages.slice(keepUpTo);

      // Collect old versions to enable version navigation on the new message
      let oldVersions = null;
      if (targetMessage.role === "assistant") {
        oldVersions = [
          ...(targetMessage.versions || []),
          { content: targetMessage.content, model: targetMessage.model },
        ];
      } else {
        const nextAssistant = messages[index + 1];
        if (nextAssistant?.role === "assistant") {
          oldVersions = [
            ...(nextAssistant.versions || []),
            { content: nextAssistant.content, model: nextAssistant.model },
          ];
        }
      }

      suppressListenerRef.current = true;
      setMessages(keptMessages);
      try {
        await regenerateResponse({
          ...sharedArgs,
          messageId,
          messages,
          _keptMessages: keptMessages,
          _messagesToDelete: messagesToDelete,
          oldVersions,
        });
      } finally {
        suppressListenerRef.current = false;
      }
    },
    [isLoading, messages, sharedArgs, regenerateResponse],
  );

  const handleEdit = useCallback(
    async (messageId, newContent) => {
      if (isLoading) return;
      const index = messages.findIndex((m) => m.id === messageId);
      if (index === -1) return;

      const keptMessages = messages.slice(0, index);
      const messagesToDelete = messages.slice(index);

      suppressListenerRef.current = true;
      setMessages(keptMessages);
      try {
        await editAndResend({
          ...sharedArgs,
          messageId,
          newContent,
          messages,
          _keptMessages: keptMessages,
          _messagesToDelete: messagesToDelete,
        });
      } finally {
        suppressListenerRef.current = false;
      }
    },
    [isLoading, messages, sharedArgs, editAndResend],
  );

  // ── Derived state ─────────────────────────────────────────────────────────

  // Only reflect generation state when it belongs to THIS conversation —
  // otherwise navigating away from a generating chat leaks its indicators here.
  const isActiveGeneration = generatingId === conversationId;
  const isGenerating = isLoading && isActiveGeneration;

  const lastMessage = messages.at(-1);
  const isStreaming =
    isActiveGeneration &&
    !!currentStreamResponse?.trim() &&
    lastMessage?.role !== "assistant";

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return null;
  if (!conversationId) return <EmptyStateConversation />;

  return (
    <div className="h-dvh relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full overflow-y-auto h-full px-4 pt-8"
        style={{ paddingBottom: `${bottomPadding + 48}px` }}
      >
        <div className="space-y-3 wrapper">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onRegenerate={handleRegenerate}
              onEdit={handleEdit}
            />
          ))}

          {isStreaming && (
            <MessageBubble
              message={{
                id: "streaming",
                role: "assistant",
                content: currentStreamResponse,
              }}
            />
          )}

          {isActiveGeneration && !!processingMessage && (
            <div className="flex justify-start px-1">
              <ProcessingIndicator message={processingMessage} />
            </div>
          )}

          {isGenerating && !isStreaming && !processingMessage && (
            <div className="flex items-end ml-3 w-max">
              <div className="flex justify-start">
                <ProcessingIndicator message={"Thinking"} />
              </div>
              <div className="flex gap-1 pb-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-0.5 h-0.5 aspect-square rounded-full animate-bounce"
                    style={{
                      background: "var(--text-3)",
                      animationDelay: `${i * 150}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!isAtBottom && (
          <motion.button
            key="scroll-to-bottom"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            onClick={scrollToBottom}
            className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full border shadow-lg transition-colors duration-100 hover:bg-(--overlay) outline-none"
            style={{
              bottom: `${bottomPadding + 56}px`,
              background: "var(--elevated)",
              borderColor: "var(--border-med)",
              color: "var(--text-2)",
            }}
            aria-label="Scroll to bottom"
          >
            <ArrowDown size={15} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
