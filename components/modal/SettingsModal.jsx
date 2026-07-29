"use client";

import React, { useState } from "react";
import { Cpu, Server, Settings, Shield, User, X } from "react-feather";
import { useModal } from "@/context";
import { Icon } from "@/components";
import { AnimatePresence, motion } from "framer-motion";
import GeneralSection from "./settings/GeneralSection";
import AccountSection from "./settings/AccountSection";
import PrivacySection from "./settings/PrivacySection";
import ModelsSection from "./settings/ModelsSection";
import ProviderSection from "./settings/ProviderSection";

const NAV_ITEMS = [
  { id: "general", label: "General", icon: Settings, Component: GeneralSection },
  { id: "account", label: "Account", icon: User, Component: AccountSection },
  { id: "privacy", label: "Privacy & Memory", icon: Shield, Component: PrivacySection },
  { id: "models", label: "Models", icon: Cpu, Component: ModelsSection },
  { id: "provider", label: "Provider", icon: Server, Component: ProviderSection },
];

export default function SettingsModal({ initialTab = "general" }) {
  const [active, setActive] = useState(initialTab);
  const { closeModal } = useModal();

  const SectionComponent =
    NAV_ITEMS.find((item) => item.id === active)?.Component ?? GeneralSection;

  return (
    <div className="flex h-[min(90vh,600px)]">
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className="w-48 shrink-0 flex flex-col border-r border-border bg-surface pt-4"
      >
        <nav className="flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-100 w-full text-left outline-none ${isActive ? "bg-interactive-hover text-text-primary font-medium" : "text-text-secondary font-normal"}`}
              >
                <Icon
                  name={item.icon}
                  size="sm"
                  className={isActive ? "text-text-primary" : "text-text-muted"}
                />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-100 hover:bg-overlay outline-none text-text-muted"
          aria-label="Close"
        >
          <Icon name={X} size="sm" />
        </button>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto px-8 py-7 pr-14 bg-background"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <SectionComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
