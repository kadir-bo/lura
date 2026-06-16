"use client";

import React, { useState } from "react";
import { formatDate } from "@/lib";
import { useDatabase, useModal } from "@/context";
import {
  DropdownMenu,
  RenameProjectModal,
  DeleteConfirmModal,
} from "@/components";
import { Archive, Edit2, Trash } from "react-feather";
import { twMerge } from "tailwind-merge";

export default function ProjectCard({
  project,
  sort,
  isSelected = false,
  className = "",
  onCardClick = () => null,
  onLongPressStart = () => null,
  onLongPressCancel = () => null,
}) {
  const { title, description, updatedAt, createdAt, id, isArchived } = project;
  const { toggleArchiveProject, deleteProject } = useDatabase();
  const { openModal, openMessage } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleArchiveProject = async () => {
    const result = await toggleArchiveProject(id, !project.isArchived);
    if (result) openMessage("Project archived", "success");
  };

  const handleDeleteProject = async (id) => {
    const result = await deleteProject(id);
    if (result) {
      openMessage("Chat deleted", "success");
    }
  };

  const ProjectDropDownMenu = [
    {
      id: "rename-project",
      label: "Rename",
      icon: Edit2,
      action: () =>
        openModal(
          <RenameProjectModal
            title={title}
            description={description}
            id={id}
          />,
        ),
    },
    {
      id: "archive-project",
      label: isArchived ? "Unarchive" : "Archive",
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
            title={title}
            description={`Are you sure you want to delete the project "${title}"? This action cannot be undone.`}
            onConfirm={() => handleDeleteProject(id)}
          />,
        ),
    },
  ];

  const handleClick = (e) => {
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey) e.preventDefault();
    onCardClick(e, id);
  };

  const defaultClasses = `group relative flex flex-col gap-3 w-full border p-4 rounded-xl cursor-pointer select-none transition-colors duration-150`;
  const selectedClasses = isSelected
    ? "border-[var(--border-hi)] bg-[var(--elevated)]"
    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-med)] hover:bg-[var(--elevated)]";
  const isActive =
    isDropdownOpen && !isSelected
      ? "border-[var(--border-med)] bg-[var(--elevated)]"
      : "";

  if (!project) return null;

  return (
    <div
      className={twMerge(defaultClasses, selectedClasses, isActive, className)}
      onClick={handleClick}
      onMouseDown={(e) => onLongPressStart(e, id)}
      onMouseUp={onLongPressCancel}
      onMouseLeave={onLongPressCancel}
      onTouchStart={(e) => onLongPressStart(e, id)}
      onTouchEnd={onLongPressCancel}
      onTouchMove={onLongPressCancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <h4 className="font-medium text-sm" style={{ color: "var(--text-1)" }}>
        {title}
      </h4>
      <p className="text-sm line-clamp-3" style={{ color: "var(--text-2)" }}>
        {description}
      </p>

      <div
        className="flex justify-between items-center text-xs"
        style={{ color: "var(--text-3)" }}
      >
        <span>
          {sort === "date"
            ? `Created: ${formatDate(createdAt)}`
            : `Updated: ${formatDate(updatedAt)}`}
        </span>
      </div>

      <DropdownMenu
        dropdownList={ProjectDropDownMenu}
        triggerClassName="p-4 absolute top-0 right-0"
        contentSide="right"
        contentSideOffset={0}
        onOpenChange={setIsDropdownOpen}
        onClick={(e, menuItem) => {
          e.stopPropagation();
          menuItem.action();
        }}
      />
    </div>
  );
}
