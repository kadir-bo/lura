"use client";

import React, { useMemo, useState } from "react";
import { Dropdown, useDropdown } from "@/context";
import { DropdownContent, DropdownTrigger, Icon } from "@/components";
import { Check, ChevronDown, Folder, Search } from "react-feather";

function filterProjects(projects, query) {
  const q = query.trim().toLowerCase();
  if (!q) return projects;
  return projects.filter((p) => p.title?.toLowerCase().includes(q));
}

function Panel({ projects, selectedProjectId, onSelect }) {
  const { setIsOpen } = useDropdown();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => filterProjects(projects, query),
    [projects, query],
  );

  return (
    <div className="flex max-h-80 w-60 flex-col">
      <div
        className="flex items-center gap-1.5 p-1.5 border-b border-border"
      >
        <div className="relative flex-1">
          <Icon
            name={Search}
            size="xs"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted"
          />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects"
            className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-surface text-text-primary text-sm outline-none"
          />
        </div>
      </div>

      <div className="overflow-y-auto p-1 flex flex-col gap-0.5">
        <button
          onClick={() => {
            onSelect(null);
            setIsOpen(false);
          }}
          className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors duration-100 hover:bg-overlay outline-none ${selectedProjectId == null ? "bg-interactive-hover" : ""}`}
        >
          <span className="text-sm truncate text-text-primary">
            No Project
          </span>
          <span className="flex-1" />
          {selectedProjectId == null && (
            <Icon
              name={Check}
              size="xs"
              className="shrink-0 text-text-primary"
            />
          )}
        </button>

        {filtered.length === 0 ? (
          <p
            className="text-xs text-center py-6 text-text-muted"
          >
            No projects found
          </p>
        ) : (
          filtered.map((p) => {
            const active = p.id === selectedProjectId;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors duration-100 hover:bg-overlay outline-none ${active ? "bg-interactive-hover" : ""}`}
              >
                <span
                  className="text-sm truncate text-text-primary"
                >
                  {p.title}
                </span>
                <span className="flex-1" />
                {active && (
                  <Icon
                    name={Check}
                    size="xs"
                    className="shrink-0 text-text-primary"
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ProjectPicker({
  projects = [],
  selectedProjectId,
  currentLabel,
  onSelect,
}) {
  return (
    <Dropdown>
      <DropdownTrigger className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 hover:bg-overlay transition-colors duration-100">
        <Icon name={Folder} size="xs" className="text-text-muted" />
        <span className="text-xs font-medium text-text-secondary">
          {currentLabel}
        </span>
        <Icon name={ChevronDown} size="xs" className="text-text-muted" />
      </DropdownTrigger>

      <DropdownContent
        side="top"
        align="end"
        sideOffset={8}
        className="p-0 max-w-none"
      >
        <Panel
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelect={onSelect}
        />
      </DropdownContent>
    </Dropdown>
  );
}
