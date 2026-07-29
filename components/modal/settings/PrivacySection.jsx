"use client";

import React, { useState } from "react";
import { Info } from "react-feather";
import { useDatabase } from "@/context";
import { generateId } from "@/lib";
import { Icon, MemoryItem } from "@/components";
import { AnimatePresence, motion } from "framer-motion";
import { Section } from "./shared";

export default function PrivacySection() {
  const { userProfile, updateUserProfile } = useDatabase();
  const [memoriesOverride, setMemories] = useState(null);
  const [newMemory, setNewMemory] = useState("");
  const memories = memoriesOverride ?? userProfile?.memories ?? [];

  const handleAdd = async () => {
    if (!newMemory.trim()) return;
    const entry = {
      id: generateId(),
      text: newMemory.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...memories, entry];
    setMemories(updated);
    setNewMemory("");
    await updateUserProfile({ memories: updated });
  };

  const handleDelete = async (id) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    await updateUserProfile({ memories: updated });
  };

  const handleUpdate = async (id, newText) => {
    const updated = memories.map((m) =>
      m.id === id
        ? { ...m, text: newText, updatedAt: new Date().toISOString() }
        : m,
    );
    setMemories(updated);
    await updateUserProfile({ memories: updated });
  };

  return (
    <div className="flex flex-col gap-8">
      <Section title="Data & Privacy">
        <div className="flex items-start gap-3 py-2">
          <Icon
            name={Info}
            size="sm"
            className="mt-0.5 shrink-0 text-text-muted"
          />
          <p className="text-sm leading-relaxed text-text-muted">
            Your conversations may be used to improve Lura. We do not sell your
            personal data to third parties.
          </p>
        </div>
      </Section>

      <Section title="Memories">
        <div className="relative mb-3">
          <textarea
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="e.g. I prefer concise answers… (Enter to add)"
            rows={2}
            className="w-full text-sm px-3 py-2.5 rounded-lg border border-border-med bg-elevated text-text-primary outline-none resize-none pr-16"
          />
          <button
            onClick={handleAdd}
            disabled={!newMemory.trim()}
            className="absolute right-2 bottom-2 text-xs font-medium px-2.5 py-1 rounded-md transition-colors duration-100 disabled:opacity-40 bg-interactive text-background"
          >
            Add
          </button>
        </div>

        <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
          <AnimatePresence initial={false}>
            {memories.length > 0 ? (
              memories.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <MemoryItem
                    memory={m}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                </motion.div>
              ))
            ) : (
              <p
                className="text-xs text-center py-4 text-text-muted"
              >
                No memories yet.
              </p>
            )}
          </AnimatePresence>
        </div>
      </Section>
    </div>
  );
}
