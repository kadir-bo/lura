"use client";

import { useDatabase, useModal } from "@/context";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Plus } from "react-feather";
import {
  ChatPageShell,
  CreateProjectModal,
  DeleteConfirmModal,
  Icon,
  ProjectCard,
} from "@/components";
import { useRouter } from "next/navigation";
import { FILTER_OPTIONS } from "@/lib";
import { useSelectionHandlers } from "@/hooks";

export default function ProjectsPage() {
  const { subscribeToProjects, deleteProject, toggleArchiveProject } =
    useDatabase();
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [sortBy, setSortBy] = useState(FILTER_OPTIONS[0].value);
  const [searchQuery, setSearchQuery] = useState("");
  const { openModal } = useModal();

  const filteredListRef = useRef([]);

  useEffect(() => {
    const unsubscribe = subscribeToProjects((data) => {
      setProjects(data);
      setIsInitialLoading(false);
    }, false);
    return () => unsubscribe?.();
  }, [subscribeToProjects]);

  const filteredAndSortedProjects = useMemo(() => {
    const filtered = searchQuery.trim()
      ? projects.filter((p) =>
          [p.title, p.description]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        )
      : projects;

    return [...filtered].sort((a, b) => {
      if (sortBy === "name")
        return (a.title || "").localeCompare(b.title || "");
      const key = sortBy === "date" ? "createdAt" : "updatedAt";
      const toDate = (v) => v?.toDate?.() ?? new Date(v);
      return toDate(b[key]) - toDate(a[key]);
    });
  }, [projects, searchQuery, sortBy]);

  useEffect(() => {
    filteredListRef.current = filteredAndSortedProjects;
  }, [filteredAndSortedProjects]);

  const {
    selectedIds,
    handleCardClick,
    handleLongPressStart,
    handleLongPressCancel,
    clearSelection,
    handleDeleteSelected,
    handleDeleteAll,
  } = useSelectionHandlers({
    listRef: filteredListRef,
    onNavigate: (id) => router.push(`/project/${id}`),
    deleteOne: deleteProject,
  });

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") clearSelection();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearSelection]);

  const handleArchiveSelected = useCallback(async () => {
    await Promise.all(
      [...selectedIds].map((id) => toggleArchiveProject(id, true)),
    );
    clearSelection();
  }, [selectedIds, toggleArchiveProject, clearSelection]);

  const handleDeleteAction = () => {
    if (selectedCount > 0) {
      openModal(
        <DeleteConfirmModal
          title={`${selectedCount} ${selectedCount > 1 ? "Projects" : "Project"}`}
          description={`Are you sure you want to delete ${selectedCount} selected ${
            selectedCount === 1 ? "project" : "projects"
          }? This action cannot be undone.`}
          onConfirm={handleDeleteSelected}
        />,
      );
    } else {
      openModal(
        <DeleteConfirmModal
          title="All Projects"
          description="Are you sure you want to delete ALL projects? This action cannot be undone."
          onConfirm={() => handleDeleteAll(filteredAndSortedProjects)}
        />,
      );
    }
  };

  const openCreateModal = () => openModal(<CreateProjectModal />);

  const selectedCount = selectedIds.size;
  const hasProjects = projects.length > 0;

  if (isInitialLoading) return null;

  return (
    <ChatPageShell
      sortBy={sortBy}
      tabs={[{ key: "projects", label: "Projects", count: filteredAndSortedProjects.length }]}
      onSortChange={setSortBy}
      searchQuery={searchQuery}
      onSearch={setSearchQuery}
      searchPlaceholder="Search projects…"
      selectedCount={selectedCount}
      hasItems={hasProjects}
      itemType={selectedCount === 1 ? "project" : "projects"}
      clearSelection={clearSelection}
      primaryAction={
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-100 outline-none"
          style={{ background: "var(--interactive)", color: "var(--bg)" }}
        >
          <Icon name={Plus} size="xs" />
          New project
        </button>
      }
      actions={
        hasProjects && selectedCount > 0 ? (
          <button
            onClick={handleDeleteAction}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-red-400/10 outline-none"
            style={{ color: "#ef4444" }}
          >
            Delete {selectedCount}
          </button>
        ) : null
      }
    >
      {filteredAndSortedProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              sort={sortBy}
              isSelected={selectedIds.has(project.id)}
              onCardClick={handleCardClick}
              onLongPressStart={handleLongPressStart}
              onLongPressCancel={handleLongPressCancel}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          {searchQuery ? (
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              No projects found for &ldquo;{searchQuery}&rdquo;
            </p>
          ) : (
            <>
              <p className="text-sm" style={{ color: "var(--text-3)" }}>
                No projects yet
              </p>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors outline-none"
                style={{ background: "var(--interactive)", color: "var(--bg)" }}
              >
                <Icon name={Plus} size="xs" />
                Create your first project
              </button>
            </>
          )}
        </div>
      )}
    </ChatPageShell>
  );
}
