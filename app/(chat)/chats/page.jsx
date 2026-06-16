"use client";

import { useDatabase } from "@/context";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChatCard,
  ChatPageShell,
  DeleteButtons,
  EmptyStateSearch,
} from "@/components";
import { useSelectionHandlers } from "@/hooks";
import { buildChatTabItems } from "@/lib";

export default function ChatsPage() {
  const { subscribeToConversations, deleteConversation } = useDatabase();
  const router = useRouter();

  const [sortBy, setSortBy] = useState("activity");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const chatListRef = useRef([]);

  useEffect(() => {
    return subscribeToConversations((data) => {
      setConversations(data);
      setLoading(false);
    }, false);
  }, [subscribeToConversations]);

  // Only show standalone chats (not inside projects)
  const standaloneChats = useMemo(
    () => conversations.filter((c) => !c.projectId),
    [conversations],
  );

  const chatTabItems = useMemo(() => {
    const items = buildChatTabItems({
      conversations: standaloneChats,
      projectsById: {},
      conversationsByProject: {},
      searchQuery,
      sortBy,
    });
    const chatOnly = items.filter((i) => i.type === "chat");
    chatListRef.current = chatOnly.map((i) => i.item);
    return chatOnly;
  }, [standaloneChats, searchQuery, sortBy]);

  const chatHandlers = useSelectionHandlers({
    listRef: chatListRef,
    onNavigate: (id) => router.push(`/chat/${id}`),
    deleteOne: deleteConversation,
  });

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") chatHandlers.clearSelection();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCount = chatHandlers.selectedIds.size;
  const hasItems = chatTabItems.length > 0;

  return (
    <ChatPageShell
      tabs={[{ key: "chats", label: "Chats", count: standaloneChats.length }]}
      activeTab="chats"
      sortBy={sortBy}
      onSortChange={setSortBy}
      searchQuery={searchQuery}
      onSearch={setSearchQuery}
      searchPlaceholder="Search chats"
      selectedCount={selectedCount}
      hasItems={hasItems}
      itemType="chat"
      clearSelection={chatHandlers.clearSelection}
      actions={
        <DeleteButtons
          selectedCount={selectedCount}
          itemType="chat"
          hasItems={hasItems}
          onDeleteSelected={chatHandlers.handleDeleteSelected}
          onDeleteAll={() => chatHandlers.handleDeleteAll(chatListRef.current)}
        />
      }
    >
      {loading ? (
        <p className="text-center py-12 text-neutral-400">Loading chats...</p>
      ) : chatTabItems.length > 0 ? (
        <div className="flex flex-col gap-2">
          {chatTabItems.map(({ item }) => (
            <ChatCard
              key={item.id}
              conversation={item}
              isSelected={chatHandlers.selectedIds.has(item.id)}
              onCardClick={chatHandlers.handleCardClick}
              onLongPressStart={chatHandlers.handleLongPressStart}
              onLongPressCancel={chatHandlers.handleLongPressCancel}
              project={null}
            />
          ))}
        </div>
      ) : (
        <EmptyStateSearch
          searchQuery={searchQuery}
          itemType="chat"
          href="/chat"
          hrefLabel="Start your first chat"
        />
      )}
    </ChatPageShell>
  );
}
