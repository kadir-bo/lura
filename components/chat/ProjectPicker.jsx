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
    <div className="flex flex-col" style={{ width: 240, maxHeight: 320 }}>
      <div
        className="flex items-center gap-1.5 p-1.5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="relative flex-1">
          <Icon
            name={Search}
            size="xs"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-3)" }}
          />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects"
            className="w-full pl-7 pr-2 py-1.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--surface)", color: "var(--text-1)" }}
          />
        </div>
      </div>

      <div className="overflow-y-auto p-1 flex flex-col gap-0.5">
        <button
          onClick={() => {
            onSelect(null);
            setIsOpen(false);
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors duration-100 hover:bg-(--overlay) outline-none"
          style={{
            background:
              selectedProjectId == null
                ? "var(--interactive-hover)"
                : "transparent",
          }}
        >
          <span className="text-sm truncate" style={{ color: "var(--text-1)" }}>
            No Project
          </span>
          <span className="flex-1" />
          {selectedProjectId == null && (
            <Icon
              name={Check}
              size="xs"
              className="shrink-0"
              style={{ color: "var(--text-1)" }}
            />
          )}
        </button>

        {filtered.length === 0 ? (
          <p
            className="text-xs text-center py-6"
            style={{ color: "var(--text-3)" }}
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
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors duration-100 hover:bg-(--overlay) outline-none"
                style={{
                  background: active
                    ? "var(--interactive-hover)"
                    : "transparent",
                }}
              >
                <span
                  className="text-sm truncate"
                  style={{ color: "var(--text-1)" }}
                >
                  {p.title}
                </span>
                <span className="flex-1" />
                {active && (
                  <Icon
                    name={Check}
                    size="xs"
                    className="shrink-0"
                    style={{ color: "var(--text-1)" }}
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
      <DropdownTrigger className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 hover:bg-[var(--overlay)] transition-colors duration-100">
        <Icon name={Folder} size="xs" style={{ color: "var(--text-3)" }} />
        <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>
          {currentLabel}
        </span>
        <Icon name={ChevronDown} size="xs" style={{ color: "var(--text-3)" }} />
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
