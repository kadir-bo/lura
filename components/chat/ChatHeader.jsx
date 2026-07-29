import React, { useEffect, useState } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import {
  Archive,
  ChevronDown,
  Edit2,
  FolderPlus,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Trash,
} from "react-feather";
import {
  AddToProjectModal,
  CreateProjectModal,
  DeleteConfirmModal,
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
  Icon,
  RenameProjectModal,
  RenameChatModal,
} from "@/components";
import { Dropdown } from "@/context";
import { getTitle } from "@/lib";
import { useDatabase } from "@/context/DatabaseContext";
import { useModal } from "@/context";

const IconBtn = ({
  onClick,
  "aria-label": ariaLabel,
  children,
  className = "",
}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-100 hover:bg-interactive-hover outline-none text-text-secondary ${className}`}
  >
    {children}
  </button>
);

export default function ChatHeader({ handleToggleSidebar }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const {
    getProject,
    toggleArchiveProject,
    deleteProject,
    getConversation,
    subscribeToConversation,
    deleteConversation,
    toggleArchiveConversation,
  } = useDatabase();
  const { openModal, openMessage } = useModal();

  const [projectRecord, setProjectRecord] = useState(null);
  const [chatRecord, setChatRecord] = useState(null);

  const isProjectPage = pathname.startsWith("/project/");
  const isChatPage = pathname.startsWith("/chat/") && pathname !== "/chat";
  const projectId = isProjectPage ? params?.id : null;
  const chatId = isChatPage ? params?.chatId : null;
  const project = projectRecord?.id === projectId ? projectRecord.value : null;
  const chat = chatRecord?.id === chatId ? chatRecord.value : null;

  const updateProject = (updater) => {
    setProjectRecord((previous) => ({
      id: projectId,
      value:
        typeof updater === "function"
          ? updater(previous?.value ?? null)
          : updater,
    }));
  };

  const updateChat = (updater) => {
    setChatRecord((previous) => ({
      id: chatId,
      value:
        typeof updater === "function"
          ? updater(previous?.value ?? null)
          : updater,
    }));
  };

  useEffect(() => {
    if (!projectId) return;
    getProject(projectId).then((p) =>
      setProjectRecord({ id: projectId, value: p ?? null }),
    );
  }, [projectId, getProject]);

  useEffect(() => {
    if (!chatId) return;
    // One-time fetch for immediate render
    getConversation(chatId).then((c) =>
      setChatRecord({ id: chatId, value: c ?? null }),
    );
    // Subscription keeps title in sync (e.g., after AI generates it)
    const unsub = subscribeToConversation(chatId, (updated) =>
      setChatRecord({ id: chatId, value: updated }),
    );
    return () => unsub?.();
  }, [chatId, getConversation, subscribeToConversation]); // stable refs ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no need to include in deps

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Project actions ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

  const handleArchiveProject = async () => {
    const result = await toggleArchiveProject(projectId, !project?.isArchived);
    if (result) {
      openMessage(
        project?.isArchived ? "Project unarchived" : "Project archived",
        "success",
      );
      updateProject((prev) => ({ ...prev, isArchived: !prev.isArchived }));
      router.push(project.isArchived ? "/projects" : "/archive");
    }
  };

  const handleDeleteProject = async () => {
    const result = await deleteProject(projectId);
    if (result) {
      openMessage("Project deleted", "success");
      router.push("/projects");
    }
  };

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Chat actions ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

  const handleDeleteChat = async () => {
    router.push("/chat");
    const result = await deleteConversation(chatId);
    if (result) {
      openMessage("Chat deleted", "success");
    }
  };

  const handleArchiveChat = async () => {
    const result = await toggleArchiveConversation(chatId, !chat?.isArchived);
    if (result) {
      openMessage(
        chat?.isArchived ? "Chat unarchived" : "Chat archived",
        "success",
      );
      updateChat((prev) => ({ ...prev, isArchived: !prev.isArchived }));
      router.push("/chat");
    }
  };

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Project dropdown items ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

  const projectMenuItems = project
    ? [
        {
          id: "rename-project",
          label: "Rename",
          icon: Edit2,
          action: () =>
            openModal(
              <RenameProjectModal
                title={project.title}
                description={project.description}
                id={projectId}
                onSuccess={(updates) =>
                  updateProject((prev) => ({ ...prev, ...updates }))
                }
              />,
            ),
        },
        {
          id: "archive-project",
          label: project.isArchived ? "Unarchive" : "Archive",
          icon: Archive,
          action: handleArchiveProject,
        },
        {
          id: "delete-project",
          label: "Delete",
          icon: Trash,
          action: () =>
            openModal(
              <DeleteConfirmModal
                title={project.title}
                description={`Delete "${project.title}"? This cannot be undone.`}
                onConfirm={handleDeleteProject}
              />,
            ),
        },
      ]
    : [];

  const pageTitle = getTitle(pathname, params);

  return (
    <header
      className="w-full h-12 flex items-center justify-between px-2 border-b shrink-0 relative"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Left ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â mobile sidebar toggle */}
      <div className="flex items-center md:hidden">
        <IconBtn
          onClick={handleToggleSidebar}
          aria-label="Open sidebar"
          className="md:hidden"
        >
          <Icon name={Menu} size="md" />
        </IconBtn>
        <div className="hidden md:block w-8" />
      </div>

      {/* Left ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â chat title with dropdown (chat ID page only) */}
      {isChatPage && chat && (
        <div className="relative">
          <Dropdown>
            <DropdownTrigger className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-overlay transition-colors duration-100 max-w-50 sm:max-w-xs">
              <span
                className="text-[13px] font-medium truncate min-w-40 text-text-primary"
              >
                {chat.title}
              </span>
              <Icon
                name={ChevronDown}
                size="xs"
                className="shrink-0 text-text-muted"
              />
            </DropdownTrigger>

            <DropdownContent
              side="bottom"
              align="center"
              sideOffset={6}
              className="min-w-40 w-full"
            >
              {/* Rename */}
              <DropdownItem
                onClick={() =>
                  openModal(
                    <RenameChatModal
                      title={chat.title}
                      id={chatId}
                      onSuccess={(updates) =>
                        updateChat((prev) => ({ ...prev, ...updates }))
                      }
                    />,
                  )
                }
              >
                <Icon name={Edit2} size="sm" className="shrink-0" />
                <span>Rename</span>
              </DropdownItem>

              {/* Add to Project */}
              <DropdownItem
                onClick={() => openModal(<AddToProjectModal chatId={chatId} />)}
              >
                <Icon name={FolderPlus} size="sm" className="shrink-0" />
                <span>Add to Project</span>
              </DropdownItem>

              {/* Delete ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â separated + red */}
              <DropdownSeparator />
              <DropdownItem
                onClick={() =>
                  openModal(
                    <DeleteConfirmModal
                      title={chat.title}
                      description={`Delete "${chat.title}"? This cannot be undone.`}
                      onConfirm={handleDeleteChat}
                    />,
                  )
                }
                style={{ color: "#ef4444" }}
              >
                <Icon name={Trash} size="sm" className="shrink-0" />
                <span>Delete</span>
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      )}

      {/* Right ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â context actions */}
      <div className="flex items-center ml-auto">
        {isProjectPage && project ? (
          <DropdownMenu
            dropdownList={projectMenuItems}
            triggerClassName="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-interactive-hover border-none"
            contentSideOffset={4}
            onClick={(e, menuItem) => {
              e.stopPropagation();
              menuItem.action();
            }}
          >
            <Icon name={MoreHorizontal} size="md" />
          </DropdownMenu>
        ) : pageTitle === "Projects" ? (
          <IconBtn
            aria-label="New Project"
            onClick={() => openModal(<CreateProjectModal />)}
          >
            <Icon name={FolderPlus} size="md" />
          </IconBtn>
        ) : (
          <IconBtn aria-label="New Chat" onClick={() => router.push("/chat")}>
            <Icon name={MessageSquare} size="md" />
          </IconBtn>
        )}
      </div>
    </header>
  );
}
