"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  ChevronUp,
  Folder,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Settings,
} from "react-feather";

import {
  UserProfileImage,
  ChatList,
  LogoButton,
  DropdownMenu,
  Backdrop,
  Icon,
} from "@/components";
import { useAuth, useDatabase, useModal } from "@/context";
import SettingsModal from "@/components/modal/SettingsModal";

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/chats", label: "Chats", icon: MessageSquare },
  { href: "/projects", label: "Projects", icon: Folder },
  { href: "/archive", label: "Archive", icon: Archive },
];

function isNavActive(href, pathname) {
  if (href === "/chats")
    return pathname === "/chats" || pathname.startsWith("/chat/");
  if (href === "/projects")
    return pathname === "/projects" || pathname.startsWith("/project/");
  return pathname.startsWith(href);
}

// ── Pending chat tracking (module-level to survive re-renders) ────────────────

const _globalPendingIds = new Set();
const _pendingTimers = new Map();
const MIN_PENDING_MS = 1200;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Sidebar({
  isOpen,
  isMobile,
  handleToggleSidebar,
  handleCloseSidebar,
}) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const [conversations, setConversations] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(!isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsCollapsed(false);
    } else {
      const t = setTimeout(() => setIsCollapsed(true), 270);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const { user, logout } = useAuth();
  const { subscribeToConversations, userProfile } = useDatabase();
  const { openModal } = useModal();

  const { displayName, email } = user;
  const username = userProfile?.displayName || displayName || email;
  const userImage = userProfile?.photoURL || null;

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToConversations((newConversations) => {
      const filtered = newConversations.filter((c) => !c.isArchived);
      filtered.forEach((c) => {
        if (c.title === "New Chat") {
          if (!_globalPendingIds.has(c.id)) _globalPendingIds.add(c.id);
          if (_pendingTimers.has(c.id)) clearTimeout(_pendingTimers.get(c.id));
          _pendingTimers.set(
            c.id,
            setTimeout(() => {
              _globalPendingIds.delete(c.id);
              _pendingTimers.delete(c.id);
              forceUpdate((n) => n + 1);
            }, MIN_PENDING_MS),
          );
        }
      });
      const ids = new Set(filtered.map((c) => c.id));
      for (const id of _globalPendingIds) {
        if (!ids.has(id)) {
          clearTimeout(_pendingTimers.get(id));
          _pendingTimers.delete(id);
          _globalPendingIds.delete(id);
        }
      }
      setConversations(filtered);
    }, true);
    return () => unsubscribe?.();
  }, [user, subscribeToConversations]);

  const recentChats = useMemo(() => {
    const pending = conversations.filter((c) => c.updatedAt == null);
    const settled = conversations.filter((c) => c.updatedAt != null);
    return [...pending, ...settled].map((conv) => ({
      id: conv.id,
      title: conv.title,
      type: "chat",
    }));
  }, [conversations]);

  const sidebarVariants = {
    open: { width: "260px", x: 0 },
    closed: { width: isMobile ? "260px" : "52px", x: isMobile ? "-260px" : 0 },
  };

  const signOut = useCallback(async () => {
    const result = await logout();
    if (result) router.push("/sign-in");
  }, [logout, router]);

  const dropDownMenuItems = useMemo(
    () => [
      {
        id: "settings",
        label: "Settings",
        action: () => openModal(<SettingsModal />, { wide: true }),
        icon: Settings,
      },
      {
        id: "sign-out",
        label: "Sign Out",
        action: signOut,
        icon: LogOut,
        separator: true,
      },
    ],
    [signOut, openModal],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <AnimatePresence>
        {isMobile && isOpen && <Backdrop onClose={handleCloseSidebar} />}
      </AnimatePresence>

      <motion.aside
        className={`
          flex flex-col shrink-0 z-999 h-dvh overflow-hidden
          border-r border-(--border) px-1
          ${isMobile ? "fixed top-0 left-0" : "relative"}
        `}
        style={{ background: "var(--surface)" }}
        variants={sidebarVariants}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        id="sidebar"
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center h-11 shrink-0">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="logo"
                className="ml-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <LogoButton />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            className={`flex items-center justify-center w-9 h-9 outline-none cursor-pointer shrink-0 rounded-lg ml-auto transition-colors hover:bg-(--interactive-hover) ${
              isCollapsed && !isMobile ? "mx-auto" : ""
            }`}
            style={{ color: "var(--text-2)" }}
            onClick={handleToggleSidebar}
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Icon name={Menu} size="md" />
          </button>
        </div>

        {/* ── Collapsed: icon-only nav (desktop) ─────────── */}
        {!isOpen && !isMobile && (
          <div className="flex flex-col gap-0.5 px-1 pt-1">
            <Link
              href="/chat"
              className="flex items-center justify-center w-9 h-9 mx-auto rounded-lg transition-colors duration-100"
              style={{ color: "var(--text-2)" }}
              aria-label="New Chat"
            >
              <Icon name={Plus} size="sm" />
            </Link>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex items-center justify-center w-9 h-9 mx-auto rounded-lg transition-colors duration-100"
                style={{
                  background: isNavActive(item.href, pathname)
                    ? "var(--interactive-hover)"
                    : "transparent",
                  color: isNavActive(item.href, pathname)
                    ? "var(--text-1)"
                    : "var(--text-2)",
                }}
              >
                <Icon name={item.icon} size="sm" />
              </Link>
            ))}
          </div>
        )}

        {/* ── Open: full nav ─────────────────────────────── */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              key="sidebar-navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: 0.05 }}
              className="flex flex-col gap-4 flex-1 overflow-y-auto overflow-x-hidden"
              aria-label="Main navigation"
            >
              {/* Nav links */}
              <div className="flex flex-col gap-0.5 px-1 pt-1">
                {/* New Chat */}
                <Link
                  href="/chat"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-100 font-medium"
                  style={{ color: "var(--text-2)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--interactive-hover)";
                    e.currentTarget.style.color = "var(--text-1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-2)";
                  }}
                >
                  <Icon name={Plus} size="sm" />
                  New Chat
                </Link>

                {NAV_ITEMS.map((item) => {
                  const active = isNavActive(item.href, pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-100"
                      style={{
                        background: active
                          ? "var(--interactive-hover)"
                          : "transparent",
                        color: active ? "var(--text-1)" : "var(--text-2)",
                        fontWeight: active ? 500 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background =
                            "var(--interactive-hover)";
                          e.currentTarget.style.color = "var(--text-1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--text-2)";
                        }
                      }}
                    >
                      <Icon name={item.icon} size="sm" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div
                className="mx-3 border-t"
                style={{ borderColor: "var(--border)" }}
              />

              {/* Recent chats */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 min-h-0">
                {recentChats.length > 0 ? (
                  <ChatList
                    label="Recents"
                    list={recentChats}
                    defaultExpanded={true}
                    pendingIds={_globalPendingIds}
                    activeChatId={params.chatId}
                  />
                ) : (
                  <p
                    className="text-xs text-center py-6"
                    style={{ color: "var(--text-3)" }}
                  >
                    No chats yet
                  </p>
                )}
              </div>

              {/* User menu */}
              <DropdownMenu
                dropdownList={dropDownMenuItems}
                contentSide="top"
                onClick={(e, menuItem) => {
                  e.stopPropagation();
                  menuItem.action?.();
                }}
                contentClassName="bg-[var(--overlay)] border-[var(--border-med)] -translate-x-1"
                triggerClassName="border-t border-[var(--border)] pb-8 pt-3 md:py-2"
              >
                <button className="flex items-center gap-2.5 px-2 py-1.5 w-full rounded-lg text-sm transition-colors hover:bg-(--interactive-hover) outline-none">
                  <UserProfileImage
                    size="sm"
                    image={userImage}
                    username={username}
                  />
                  <span
                    className="flex-1 text-left truncate"
                    style={{ color: "var(--text-2)" }}
                  >
                    {username}
                  </span>
                  <Icon
                    name={ChevronUp}
                    size="sm"
                    style={{ color: "var(--text-3)", flexShrink: 0 }}
                  />
                </button>
              </DropdownMenu>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}
