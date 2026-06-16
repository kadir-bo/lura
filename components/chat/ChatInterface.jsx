"use client";

import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import {
  ArrowUp,
  BookOpen,
  Code,
  Edit2,
  Paperclip,
  Plus,
  Square,
  Star,
  Zap,
} from "react-feather";

import {
  AttachmentThumbnail,
  ChatFooterMessage,
  DropdownMenu,
  Icon,
  ModelPicker,
  ProjectPicker,
} from "@/components";
import SettingsModal from "@/components/modal/SettingsModal";
import { useChat, useDatabase, useModal } from "@/context";
import {
  usePasteHandler,
  useFileSelectHandler,
  useKeyboardHandler,
  useSendMessageHandler,
  useIsMobile,
} from "@/hooks";
import { ACCEPTED_FILE_TYPES, MODELS, DEFAULT_MODEL } from "@/lib";

const SUGGESTION_CHIPS = [
  {
    id: "write",
    label: "Schreiben",
    icon: Edit2,
    prompt: "Hilf mir, einen Text zu verfassen.",
  },
  {
    id: "explain",
    label: "Erklären",
    icon: BookOpen,
    prompt: "Erkläre mir etwas Interessantes.",
  },
  {
    id: "code",
    label: "Code",
    icon: Code,
    prompt: "Hilf mir, Code zu schreiben.",
  },
  {
    id: "brainstorm",
    label: "Brainstorming",
    icon: Zap,
    prompt: "Lass uns gemeinsam Ideen entwickeln.",
  },
  {
    id: "lura",
    label: "Luras Wahl",
    icon: Star,
    prompt: "Was empfiehlst du mir heute?",
  },
];

const ADD_MENU_ITEMS = [
  { id: "file", label: "Datei hochladen", icon: Paperclip },
];

export default function ChatInterface({
  project_id,
  project = null,
  className = "",
  containerClassName = "",
  textareaClassName = "",
  buttonClassName = "",
  sendButtonClassName = "",
  attachmentButtonClassName = "",
  textAreaGrowHeight = 200,
  placeholder = "Message Lura",
  autofocus = true,
  indicator = true,
  showChips = true,
}) {
  const router = useRouter();
  const { chatId: conversationId = null } = useParams() ?? {};

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const initializedModelRef = useRef(false);

  const [localUserInput, setLocalUserInput] = useState("");
  const [hasContent, setHasContent] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [providerModels, setProviderModels] = useState(MODELS);
  const [pickedProject, setPickedProject] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);

  // The project picker only applies to a brand-new, un-started chat with no
  // project context already fixed by the page (e.g. /chat, not /project/[id]
  // or an existing conversation).
  const canPickProject = !project_id && !conversationId;

  const isMobile = useIsMobile();
  const { openModal } = useModal();

  const {
    attachments,
    addAttachment,
    removeAttachment,
    isLoading: globalLoading,
    generatingId,
    sendMessage,
    stopGeneration,
  } = useChat();

  // "isLoading" is scoped to THIS conversation so navigating between chats does
  // not carry over another chat's generating state. A generation elsewhere
  // (globalLoading) still blocks a new send since streaming state is a singleton.
  const isLoading = globalLoading && generatingId === conversationId;

  const {
    createConversation,
    updateConversation,
    addMessage,
    addConversationToProject,
    getMessages,
    getProjectConversations,
    updateUserProfile,
    updateProjectMemory,
    userProfile,
    subscribeToProjects,
  } = useDatabase();

  // Load models from provider API
  useEffect(() => {
    let cancelled = false;
    fetch("/api/providers/models")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (cancelled) return;
        const models = data.models ?? [];
        if (models.length > 0) setProviderModels(models);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Live-load the user's projects for the project picker on a brand-new chat
  useEffect(() => {
    if (!canPickProject || !subscribeToProjects) return;
    return subscribeToProjects((list) => setAvailableProjects(list));
  }, [canPickProject, subscribeToProjects]);

  // Sync default model from user profile once on load
  useEffect(() => {
    if (
      !initializedModelRef.current &&
      userProfile?.preferences?.defaultModel
    ) {
      setSelectedModel(userProfile.preferences.defaultModel);
      initializedModelRef.current = true;
    }
  }, [userProfile]);

  const availableModels = useMemo(() => {
    const enabled = userProfile?.preferences?.enabledModels;
    // Empty/undefined enabledModels means "all models enabled"
    if (enabled?.length > 0) {
      return providerModels.filter((m) => enabled.includes(m.id));
    }
    return providerModels;
  }, [providerModels, userProfile?.preferences?.enabledModels]);

  const currentModelLabel = useMemo(
    () =>
      providerModels.find((m) => m.id === selectedModel)?.label ||
      selectedModel,
    [providerModels, selectedModel],
  );

  const resetInput = useCallback(() => {
    setLocalUserInput("");
    setHasContent(false);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      if (!isMobile) el.focus();
    }
  }, [isMobile]);

  // Grow textarea with content, capped at textAreaGrowHeight
  const syncHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    if (!el.value) {
      setHasContent(false);
      return;
    }
    setHasContent(true);
    el.style.height = `${Math.min(el.scrollHeight, textAreaGrowHeight)}px`;
  }, [textAreaGrowHeight]);

  useEffect(() => {
    syncHeight();
  }, [localUserInput, syncHeight]);

  useEffect(() => {
    if (!isLoading && !isMobile) {
      textareaRef.current?.focus();
    }
  }, [isLoading, isMobile]);

  const handleChange = useCallback((e) => {
    setLocalUserInput(e.target.value);
  }, []);

  const handlePaste = usePasteHandler(
    textareaRef,
    localUserInput,
    setLocalUserInput,
    addAttachment,
  );

  const handleFileSelect = useFileSelectHandler(addAttachment);

  // When the picker is active, the user's selection takes over as the
  // effective project for the conversation about to be created.
  const effectiveProjectId = canPickProject ? pickedProject?.id : project_id;
  const effectiveProject = canPickProject ? pickedProject : project;

  const send = useSendMessageHandler(
    sendMessage,
    attachments,
    conversationId,
    createConversation,
    updateConversation,
    addMessage,
    getMessages,
    addConversationToProject,
    getProjectConversations,
    updateUserProfile,
    updateProjectMemory,
    userProfile,
    effectiveProjectId,
    effectiveProject,
    router,
    textareaRef,
    selectedModel,
  );

  const handleSend = useCallback(() => {
    if (globalLoading) return;
    if (!localUserInput.trim() && attachments.length === 0) return;
    const message = localUserInput;
    resetInput();
    send(message);
  }, [globalLoading, localUserInput, attachments.length, resetInput, send]);

  // Auto-send chip prompt directly
  const handleChipClick = useCallback(
    (prompt) => {
      if (globalLoading) return;
      resetInput();
      send(prompt);
    },
    [globalLoading, resetInput, send],
  );

  const handleKeyDown = useKeyboardHandler(handleSend, setLocalUserInput);

  const baseButtonCls = twMerge(
    "flex items-center justify-center w-9 h-9 aspect-square rounded-full shrink-0 transition-colors duration-100",
    buttonClassName,
  );

  // Block sending while ANY generation is in flight (streaming state is shared).
  const canSend =
    (localUserInput.trim().length > 0 || attachments.length > 0) &&
    !globalLoading;

  return (
    <motion.div
      className={twMerge(
        "w-full relative wrapper py-3 sm:py-6 flex flex-col",
        "pb-[calc(env(safe-area-inset-bottom)+0.75rem)] focus-within:pb-0 md:focus-within:pb-6",
        className,
      )}
    >
      {/* Attachment previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            key="attachments"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="flex flex-wrap gap-2 mb-2 max-h-28 overflow-y-auto"
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

      {/* Input container */}
      <motion.div
        layout="size"
        className={twMerge(
          "flex flex-col rounded-[1.25rem]",
          "border border-(--border-med) focus-within:border-(--border-hi)",
          "transition-colors duration-150",
          containerClassName,
        )}
        style={{ background: "var(--elevated)" }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
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

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          name="user-input"
          id="user-input"
          placeholder={placeholder}
          className={twMerge(
            "resize-none w-full px-4 pt-3.5 pb-2",
            "text-sm leading-relaxed bg-transparent outline-none",
            "overflow-y-auto no-scrollbar",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "placeholder:text-(--text-3)",
            textareaClassName,
          )}
          style={{
            color: "var(--text-1)",
            maxHeight: textAreaGrowHeight,
          }}
          value={localUserInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          rows={1}
          disabled={isLoading}
          autoFocus={autofocus && !isMobile}
          aria-label="Message input"
        />

        {/* Bottom strip */}
        <div className="flex items-center px-2 pb-2 pt-1 gap-1">
          {/* Attach — opens dropdown */}
          <DropdownMenu
            dropdownList={ADD_MENU_ITEMS}
            onClick={(_, item) => {
              if (item.id === "file") fileInputRef.current?.click();
            }}
            contentSide="top"
            contentSideOffset={8}
            triggerClassName={twMerge(
              baseButtonCls,
              "border border-(--border) hover:border-(--border-med) hover:bg-(--overlay)",
              attachmentButtonClassName,
            )}
          >
            <span style={{ color: "var(--text-2)" }}>
              <Icon name={Plus} size="sm" />
            </span>
          </DropdownMenu>

          <div className="flex-1" />

          {/* Project selector — only for a brand-new, un-started chat */}
          {canPickProject && (
            <ProjectPicker
              projects={availableProjects}
              selectedProjectId={pickedProject?.id ?? null}
              currentLabel={pickedProject?.title ?? "No Project"}
              onSelect={setPickedProject}
            />
          )}

          {/* Model selector — quick access + manage */}
          <ModelPicker
            models={availableModels}
            selectedModel={selectedModel}
            currentLabel={currentModelLabel}
            onSelect={(id) => {
              setSelectedModel(id);
              updateUserProfile({
                preferences: {
                  ...userProfile?.preferences,
                  defaultModel: id,
                },
              });
            }}
            onManage={() =>
              openModal(<SettingsModal initialTab="models" />, { wide: true })
            }
          />

          {/* Send / Stop */}
          {isLoading ? (
            <button
              className={twMerge(
                baseButtonCls,
                "bg-(--interactive) hover:bg-white/90",
                sendButtonClassName,
              )}
              style={{ color: "var(--bg)" }}
              aria-label="Stop generation"
              onClick={stopGeneration}
            >
              <Icon
                name={Square}
                size="sm"
                className="fill-current stroke-transparent"
              />
            </button>
          ) : (
            <button
              className={twMerge(
                baseButtonCls,
                canSend
                  ? "bg-(--interactive) hover:bg-white/90"
                  : "bg-(--overlay) border border-(--border) cursor-not-allowed",
                sendButtonClassName,
              )}
              style={{ color: canSend ? "var(--bg)" : "var(--text-3)" }}
              aria-label="Send message"
              onClick={handleSend}
              disabled={!canSend}
            >
              <Icon name={ArrowUp} size="sm" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Suggestion chips */}
      {showChips && !conversationId && (
        <div
          className="flex flex-wrap gap-2 mt-2.5 px-1 justify-center transition-opacity duration-200"
          style={{
            opacity: hasContent || isLoading ? 0 : 1,
            pointerEvents: hasContent || isLoading ? "none" : "auto",
          }}
          aria-hidden={hasContent || isLoading}
        >
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => handleChipClick(chip.prompt)}
              tabIndex={hasContent || isLoading ? -1 : 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors duration-100 hover:bg-(--overlay)"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-2)",
                background: "var(--surface)",
              }}
            >
              <Icon
                name={chip.icon}
                size="xs"
                style={{ color: "var(--text-3)" }}
              />
              {chip.label}
            </button>
          ))}
        </div>
      )}
      {indicator && <ChatFooterMessage />}
    </motion.div>
  );
}
