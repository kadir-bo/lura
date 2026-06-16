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
    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-100 hover:bg-(--interactive-hover) outline-none ${className}`}
    style={{ color: "var(--text-2)" }}
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

  const [project, setProject] = useState(null);
  const [chat, setChat] = useState(null);

  const isProjectPage = pathname.startsWith("/project/");
  const isChatPage = pathname.startsWith("/chat/") && pathname !== "/chat";
  const projectId = isProjectPage ? params?.id : null;
  const chatId = isChatPage ? params?.chatId : null;

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      return;
    }
    getProject(projectId).then((p) => setProject(p ?? null));
  }, [projectId, getProject]);

  useEffect(() => {
    if (!chatId) {
      setChat(null);
      return;
    }
    // One-time fetch for immediate render
    getConversation(chatId).then((c) => setChat(c ?? null));
    // Subscription keeps title in sync (e.g., after AI generates it)
    const unsub = subscribeToConversation(chatId, (updated) => setChat(updated));
    return () => unsub?.();
  }, [chatId]); // stable refs — no need to include in deps

  // ── Project actions ──────────────────────────────────────────────────────

  const handleArchiveProject = async () => {
    const result = await toggleArchiveProject(projectId, !project?.isArchived);
    if (result) {
      openMessage(
        project?.isArchived ? "Project unarchived" : "Project archived",
        "success",
      );
      setProject((prev) => ({ ...prev, isArchived: !prev.isArchived }));
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

  // ── Chat actions ─────────────────────────────────────────────────────────

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
      setChat((prev) => ({ ...prev, isArchived: !prev.isArchived }));
      router.push("/chat");
    }
  };

  // ── Project dropdown items ───────────────────────────────────────────────

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
                  setProject((prev) => ({ ...prev, ...updates }))
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
      {/* Left — mobile sidebar toggle */}
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

      {/* Left — chat title with dropdown (chat ID page only) */}
      {isChatPage && chat && (
        <div className="relative">
          <Dropdown>
            <DropdownTrigger className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-(--overlay) transition-colors duration-100 max-w-50 sm:max-w-xs">
              <span
                className="text-[13px] font-medium truncate min-w-40"
                style={{ color: "var(--text-1)" }}
              >
                {chat.title}
              </span>
              <Icon
                name={ChevronDown}
                size="xs"
                className="shrink-0"
                style={{ color: "var(--text-3)" }}
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
                        setChat((prev) => ({ ...prev, ...updates }))
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

              {/* Delete — separated + red */}
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

      {/* Right — context actions */}
      <div className="flex items-center ml-auto">
        {isProjectPage && project ? (
          <DropdownMenu
            dropdownList={projectMenuItems}
            triggerClassName="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--interactive-hover)] border-none"
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
