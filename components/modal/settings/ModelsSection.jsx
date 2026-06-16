"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, ChevronRight, Search } from "react-feather";
import { useDatabase } from "@/context";
import { MODELS, DEFAULT_MODEL } from "@/lib";
import { Icon, Toggle } from "@/components";
import { AnimatePresence, motion } from "framer-motion";
import { Section, FieldRow, FastBadge } from "./shared";

const companyOf = (m) => m.company || m.provider || "Other";

export default function ModelsSection() {
  const { userProfile, updateUserProfile } = useDatabase();

  const [search, setSearch] = useState("");
  const [providerModels, setProviderModels] = useState(MODELS);
  const [loadingModels, setLoadingModels] = useState(true);
  const [enabledIds, setEnabledIds] = useState(
    () => new Set(userProfile?.preferences?.enabledModels ?? []),
  );
  const [defaultModel, setDefaultModel] = useState(
    userProfile?.preferences?.defaultModel || DEFAULT_MODEL,
  );
  const [expandedProviders, setExpandedProviders] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    setLoadingModels(true);
    fetch("/api/providers/models")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (cancelled) return;
        const fetched = data.models ?? [];
        setProviderModels(fetched.length > 0 ? fetched : MODELS);
        setEnabledIds((prev) => {
          if (prev.size > 0) return prev;
          return new Set(fetched.map((m) => m.id));
        });
      })
      .catch(() => {
        if (!cancelled) setProviderModels(MODELS);
      })
      .finally(() => {
        if (!cancelled) setLoadingModels(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const saved = userProfile?.preferences?.defaultModel || DEFAULT_MODEL;
    setDefaultModel(saved);
  }, [userProfile?.preferences?.defaultModel]);

  // Auto-persist any change to enabled models / default model.
  // The default model may be ANY model (it does not need to be enabled).
  const persist = useCallback(
    (nextEnabled, nextDefault) => {
      const allEnabled = nextEnabled.size === providerModels.length;
      updateUserProfile({
        preferences: {
          ...userProfile?.preferences,
          enabledModels: allEnabled ? [] : [...nextEnabled],
          defaultModel: nextDefault || DEFAULT_MODEL,
        },
      });
    },
    [providerModels.length, userProfile?.preferences, updateUserProfile],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return providerModels;
    return providerModels.filter(
      (m) =>
        m.label.toLowerCase().includes(q) ||
        companyOf(m).toLowerCase().includes(q) ||
        (m.provider || "").toLowerCase().includes(q),
    );
  }, [providerModels, search]);

  // Two-level tree: connection provider → company → models
  const tree = useMemo(() => {
    const provMap = {};
    filtered.forEach((m) => {
      const prov = m.provider || "NVIDIA NIM";
      const comp = companyOf(m);
      if (!provMap[prov]) provMap[prov] = {};
      if (!provMap[prov][comp]) provMap[prov][comp] = [];
      provMap[prov][comp].push(m);
    });
    return Object.entries(provMap)
      .map(([provider, comps]) => ({
        provider,
        companies: Object.entries(comps).sort(([a], [b]) => a.localeCompare(b)),
        models: Object.values(comps).flat(),
      }))
      .sort((a, b) => a.provider.localeCompare(b.provider));
  }, [filtered]);

  // Expand all providers once models load
  useEffect(() => {
    if (providerModels.length) {
      setExpandedProviders(
        new Set([
          ...new Set(providerModels.map((m) => m.provider || "NVIDIA NIM")),
        ]),
      );
    }
  }, [providerModels]);

  const isExpanded = (provider) =>
    search.trim() ? true : expandedProviders.has(provider);

  const toggleExpand = (provider) => {
    setExpandedProviders((prev) => {
      const next = new Set(prev);
      next.has(provider) ? next.delete(provider) : next.add(provider);
      return next;
    });
  };

  const toggle = (id) => {
    if (enabledIds.has(id) && enabledIds.size === 1) return;
    const next = new Set(enabledIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setEnabledIds(next);
    persist(next, defaultModel);
  };

  const toggleModels = (models) => {
    const allOn = models.every((m) => enabledIds.has(m.id));
    const next = new Set(enabledIds);
    if (allOn) {
      models.forEach((m) => next.delete(m.id));
      if (next.size === 0) next.add(models[0].id);
    } else {
      models.forEach((m) => next.add(m.id));
    }
    setEnabledIds(next);
    persist(next, defaultModel);
  };

  const handleDefaultChange = (id) => {
    setDefaultModel(id);
    persist(enabledIds, id);
  };

  const enabledModels = useMemo(
    () => providerModels.filter((m) => enabledIds.has(m.id)),
    [providerModels, enabledIds],
  );

  // All models grouped by company — used by the "Set Default" selector
  const allByCompany = useMemo(() => {
    const map = {};
    providerModels.forEach((m) => {
      const c = companyOf(m);
      if (!map[c]) map[c] = [];
      map[c].push(m);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [providerModels]);

  return (
    <div className="flex flex-col gap-6">
      {/* Default Model — used for new chats. Selectable from ALL models. */}
      <Section title="Default Model">
        <FieldRow label="Set Default">
          <select
            value={defaultModel}
            onChange={(e) => handleDefaultChange(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg border outline-none max-w-[220px]"
            style={{
              background: "var(--elevated)",
              borderColor: "var(--border-med)",
              color: "var(--text-1)",
            }}
          >
            {allByCompany.map(([company, list]) => (
              <optgroup key={company} label={company}>
                {list.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                    {m.fast ? " ⚡" : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </FieldRow>
      </Section>

      {/* Enabled Models — header + search fully sticky, covering the list */}
      <div className="flex flex-col">
        <div
          className="sticky -top-7 z-20 flex flex-col gap-3 -mx-8 px-8 pt-2 pb-3"
          style={{ background: "var(--bg)" }}
        >
          <div
            className="flex items-center justify-between pb-2 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
              Enabled Models
            </h3>
            <span className="text-xs" style={{ color: "var(--text-3)" }}>
              {enabledModels.length} aktiv
            </span>
          </div>
          <div className="relative">
            <Icon
              name={Search}
              size="xs"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-3)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Modelle suchen…"
              className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none border"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border-med)",
                color: "var(--text-1)",
              }}
            />
          </div>
        </div>

        {loadingModels ? (
          <div className="flex flex-col gap-0.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-11 rounded-lg animate-pulse"
                style={{ background: "var(--overlay)" }}
              />
            ))}
          </div>
        ) : tree.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: "var(--text-3)" }}>
            Keine Modelle gefunden.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {tree.map(({ provider, companies, models }) => {
              const expanded = isExpanded(provider);
              const allOn = models.every((m) => enabledIds.has(m.id));
              const someOn = models.some((m) => enabledIds.has(m.id));
              const enabledCount = models.filter((m) =>
                enabledIds.has(m.id),
              ).length;

              return (
                <div
                  key={provider}
                  className="rounded-xl border"
                  style={{ borderColor: "var(--border)" }}
                >
                  {/* Provider header — expand toggle + master switch */}
                  <div className="flex items-center gap-2 px-2.5 py-2.5">
                    <button
                      onClick={() => toggleExpand(provider)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left outline-none"
                    >
                      <Icon
                        name={expanded ? ChevronDown : ChevronRight}
                        size="xs"
                        style={{ color: "var(--text-3)" }}
                      />
                      <span
                        className="text-sm font-semibold truncate"
                        style={{ color: "var(--text-1)" }}
                      >
                        {provider}
                      </span>
                    </button>
                    <span className="text-xs" style={{ color: "var(--text-3)" }}>
                      {enabledCount}/{models.length}
                    </span>
                    <Toggle
                      checked={allOn || someOn}
                      indeterminate={!allOn && someOn}
                      onChange={() => toggleModels(models)}
                      ariaLabel={`Alle ${provider} Modelle umschalten`}
                    />
                  </div>

                  {/* Companies → models */}
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-2 pb-2 pt-0.5 border-t"
                          style={{ borderColor: "var(--border)" }}
                        >
                          {companies.map(([company, list]) => (
                            <div key={company} className="flex flex-col">
                              {/* Company label */}
                              <p
                                className="px-1.5 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider"
                                style={{ color: "var(--text-3)" }}
                              >
                                {company}
                              </p>
                              {/* Models */}
                              {list.map((model) => {
                                const on = enabledIds.has(model.id);
                                return (
                                  <div
                                    key={model.id}
                                    className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-lg hover:bg-(--overlay) transition-colors duration-100"
                                  >
                                    <p
                                      className="text-sm truncate"
                                      style={{ color: "var(--text-1)" }}
                                    >
                                      {model.label}
                                    </p>
                                    {model.fast && <FastBadge />}
                                    <span className="flex-1" />
                                    <Toggle
                                      checked={on}
                                      onChange={() => toggle(model.id)}
                                      ariaLabel={`${model.label} umschalten`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
