"use client";

import { useDatabase, useModal } from "@/context";
import React, { useEffect, useState } from "react";
import { PrimaryButton } from "@/components";
import { useRouter } from "next/navigation";

export default function AddToProjectModal({ chatId, onSuccess }) {
  const { getProjects, addConversationToProject, loading } = useDatabase();
  const { openMessage, closeModal } = useModal();
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    getProjects()
      .then((list) => {
        if (list === null) {
          setFetchFailed(true);
        } else {
          setProjects(list);
        }
      })
      .catch(() => setFetchFailed(true))
      .finally(() => setFetching(false));
  }, [getProjects]);

  const handleConfirm = async () => {
    if (!selectedProjectId) return;
    try {
      const result = await addConversationToProject(selectedProjectId, chatId);
      if (result) {
        openMessage("Chat added to project", "success");
        onSuccess?.(selectedProjectId);
        closeModal();
      } else {
        openMessage("Failed to add chat to project — check console for details", "error");
      }
    } catch (err) {
      console.error("addConversationToProject threw:", err);
      openMessage("Failed to add chat to project", "error");
    }
  };

  const handleCreateProject = () => {
    closeModal();
    router.push("/projects/create");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: "var(--text-1)" }}>
        Add to Project
      </h2>
      <p className="text-sm mb-5" style={{ color: "var(--text-3)" }}>
        Select a project to move this chat into.
      </p>

      {fetching ? (
        <p className="text-sm py-4 text-center" style={{ color: "var(--text-3)" }}>
          Loading projects…
        </p>
      ) : fetchFailed ? (
        <p className="text-sm py-4 text-center" style={{ color: "#ef4444" }}>
          Failed to load projects. Check the browser console for details.
        </p>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            No projects yet.
          </p>
          <button
            onClick={handleCreateProject}
            className="text-sm font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--interactive)" }}
          >
            Create a project
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-1 mb-5 max-h-60 overflow-y-auto">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setSelectedProjectId(p.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors duration-100"
                style={{
                  background:
                    selectedProjectId === p.id
                      ? "var(--interactive-hover)"
                      : "transparent",
                  color: "var(--text-2)",
                  border:
                    selectedProjectId === p.id
                      ? "1px solid var(--border-med)"
                      : "1px solid transparent",
                }}
              >
                {p.title}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end items-center gap-2">
        <PrimaryButton className="w-max px-3" onClick={closeModal}>
          Cancel
        </PrimaryButton>
        {!fetchFailed && projects.length > 0 && (
          <PrimaryButton
            className="w-max px-3 min-w-24 justify-center"
            onClick={handleConfirm}
            disabled={!selectedProjectId || loading || fetching}
            filled
          >
            {loading ? "Adding…" : "Add to Project"}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
