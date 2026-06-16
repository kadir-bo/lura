"use client";

import React, { useState } from "react";
import { Info, X } from "react-feather";
import { useDatabase } from "@/context/DatabaseContext";
import { useModal } from "@/context/ModalContext";
import { useRouter } from "next/navigation";
import { Icon } from "@/components";

export default function CreateProjectModal() {
  const router = useRouter();
  const { createProject, loading } = useDatabase();
  const { openMessage, closeModal } = useModal();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      openMessage("Please enter a project name", "error");
      return;
    }
    try {
      const newProject = await createProject({
        title: name.trim(),
        description: description.trim(),
      });
      if (newProject) {
        closeModal();
        router.push(`/project/${newProject.id}`);
      } else {
        openMessage("Failed to create project", "error");
      }
    } catch {
      openMessage("An error occurred while creating the project", "error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) handleCreate();
  };

  return (
    <div className="flex flex-col gap-5 p-6 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>
          Create a project
        </h2>
        <button
          onClick={closeModal}
          className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-(--overlay) outline-none"
          style={{ color: "var(--text-3)" }}
        >
          <Icon name={X} size="sm" />
        </button>
      </div>

      {/* Info box */}
      <div
        className="rounded-xl p-4 flex flex-col gap-2"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
          How to use projects
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
          Projects help organize your work and leverage knowledge across multiple
          conversations. Upload docs, code, and files to create themed collections
          that Lura can reference again and again.
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
          Start by creating a memorable title and description to organize your
          project. You can always edit it later.
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm" style={{ color: "var(--text-2)" }}>
            What are you working on?
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Example Project"
            autoFocus
            className="px-3 py-2.5 rounded-lg text-sm outline-none border transition-colors"
            style={{
              background: "var(--elevated)",
              borderColor: "var(--border-med)",
              color: "var(--text-1)",
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm" style={{ color: "var(--text-2)" }}>
            What are you trying to achieve?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project, goals, subject, etc."
            rows={4}
            className="px-3 py-2.5 rounded-lg text-sm outline-none border resize-none transition-colors"
            style={{
              background: "var(--elevated)",
              borderColor: "var(--border-med)",
              color: "var(--text-1)",
            }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={closeModal}
          className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-(--overlay) outline-none"
          style={{ color: "var(--text-2)" }}
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!name.trim() || loading}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors outline-none disabled:opacity-40"
          style={{
            background: "var(--interactive)",
            color: "var(--bg)",
          }}
        >
          {loading ? "Creating…" : "Create project"}
        </button>
      </div>
    </div>
  );
}
