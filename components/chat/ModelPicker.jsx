"use client";

import React, { useMemo, useState } from "react";
import { Dropdown, useDropdown } from "@/context";
import { DropdownContent, DropdownTrigger, Icon } from "@/components";
import { Check, ChevronDown, Search, Sliders, Zap } from "react-feather";

const companyOf = (m) => m.company || m.provider || "Other";

function FastBadge() {
  return (
    <span
      className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded"
      style={{
        background: "color-mix(in oklab, var(--interactive) 18%, transparent)",
        color: "var(--interactive)",
        letterSpacing: "0.03em",
      }}
    >
      <Zap size={9} className="fill-current" />
      Fast
    </span>
  );
}

function groupByCompany(models, query) {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? models.filter(
        (m) =>
          m.label.toLowerCase().includes(q) ||
          companyOf(m).toLowerCase().includes(q),
      )
    : models;
  const map = {};
  filtered.forEach((m) => {
    const key = companyOf(m);
    if (!map[key]) map[key] = [];
    map[key].push(m);
  });
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

function Panel({ models, selectedModel, onSelect, onManage }) {
  const { setIsOpen } = useDropdown();
  const [query, setQuery] = useState("");

  const grouped = useMemo(
    () => groupByCompany(models, query),
    [models, query],
  );

  return (
    <div className="flex flex-col" style={{ width: 280, maxHeight: 360 }}>
      {/* Search + quick manage access */}
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
            placeholder="Search models"
            className="w-full pl-7 pr-2 py-1.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--surface)", color: "var(--text-1)" }}
          />
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            onManage?.();
          }}
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors duration-100 hover:bg-(--overlay)"
          style={{ color: "var(--text-2)" }}
          title="Manage models"
          aria-label="Manage models"
        >
          <Icon name={Sliders} size="sm" />
        </button>
      </div>

      {/* Provider-grouped list */}
      <div className="overflow-y-auto p-1 flex flex-col gap-0.5">
        {grouped.length === 0 ? (
          <p
            className="text-xs text-center py-6"
            style={{ color: "var(--text-3)" }}
          >
            No models found
          </p>
        ) : (
          grouped.map(([provider, list]) => (
            <div key={provider} className="flex flex-col">
              <p
                className="px-2.5 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider"
                style={{ color: "var(--text-3)" }}
              >
                {provider}
              </p>
              {list.map((m) => {
                const active = m.id === selectedModel;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelect(m.id);
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
                      {m.label}
                    </span>
                    {m.fast && <FastBadge />}
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
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ModelPicker({
  models = [],
  selectedModel,
  currentLabel,
  onSelect,
  onManage,
}) {
  return (
    <Dropdown>
      <DropdownTrigger className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 hover:bg-[var(--overlay)] transition-colors duration-100">
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
          models={models}
          selectedModel={selectedModel}
          onSelect={onSelect}
          onManage={onManage}
        />
      </DropdownContent>
    </Dropdown>
  );
}
