"use client";

import React, { useState } from "react";
import { Plus, Server, Trash2 } from "react-feather";
import { useDatabase, useModal } from "@/context";
import { Icon } from "@/components";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import { Section, SaveBtn } from "./shared";

const NVIDIA_NIM_PROVIDER = {
  id: "nvidia-nim",
  name: "NVIDIA NIM",
  apiUrl: "https://integrate.api.nvidia.com/v1",
  isDefault: true,
};

const EMPTY_FORM = { name: "", apiUrl: "", apiKey: "" };

const FORM_FIELDS = [
  { key: "name", placeholder: "Name", type: "text" },
  { key: "apiUrl", placeholder: "API URL (OpenAI-kompatibel)", type: "text" },
  { key: "apiKey", placeholder: "API Key", type: "password" },
];

export default function ProviderSection() {
  const { userProfile, updateUserProfile } = useDatabase();
  const { openMessage, openModal } = useModal();

  const [customProviders, setCustomProviders] = useState(
    () => userProfile?.preferences?.customProviders || [],
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const hasChanges =
    JSON.stringify(customProviders) !==
    JSON.stringify(userProfile?.preferences?.customProviders || []);

  const addProvider = () => {
    if (!form.name.trim() || !form.apiUrl.trim()) return;
    setCustomProviders((p) => [...p, { ...form, id: String(Date.now()) }]);
    setForm(EMPTY_FORM);
  };

  const confirmRemove = (provider) => {
    openModal(
      <DeleteConfirmModal
        title={provider.name}
        description={`Remove the provider "${provider.name}"? This cannot be undone.`}
        onConfirm={async () => {
          setCustomProviders((prev) =>
            prev.filter((p) => p.id !== provider.id),
          );
        }}
      />,
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        preferences: { ...userProfile?.preferences, customProviders },
      });
      openMessage("Provider gespeichert", "success");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Active Providers */}
      <Section title="Aktive Provider">
        {/* NVIDIA NIM — built-in, not removable */}
        <div
          className="flex items-center justify-between py-2.5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
                {NVIDIA_NIM_PROVIDER.name}
              </p>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--interactive)",
                  color: "var(--bg)",
                  letterSpacing: "0.03em",
                }}
              >
                DEFAULT
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              {NVIDIA_NIM_PROVIDER.apiUrl}
            </p>
          </div>
          <Icon
            name={Server}
            size="sm"
            style={{ color: "var(--text-3)", flexShrink: 0 }}
          />
        </div>

        {/* Custom providers */}
        {customProviders.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between py-2.5 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "var(--text-1)" }}
              >
                {p.name}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>
                {p.apiUrl}
              </p>
            </div>
            <button
              onClick={() => confirmRemove(p)}
              className="ml-3 p-1.5 rounded-md transition-colors duration-100 hover:bg-(--overlay) shrink-0"
            >
              <Icon name={Trash2} size="xs" style={{ color: "var(--text-3)" }} />
            </button>
          </div>
        ))}

        {customProviders.length === 0 && (
          <p className="text-xs py-2" style={{ color: "var(--text-3)" }}>
            Keine weiteren Provider konfiguriert.
          </p>
        )}
      </Section>

      {/* Add Provider */}
      <Section
        title="Provider hinzufügen"
        action={
          <SaveBtn
            hasChanges={hasChanges}
            loading={saving}
            saved={false}
            onClick={handleSave}
          />
        }
      >
        <div className="flex flex-col gap-2.5">
          {FORM_FIELDS.map(({ key, placeholder, type }) => (
            <input
              key={key}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              type={type}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
              style={{
                background: "var(--elevated)",
                borderColor: "var(--border-med)",
                color: "var(--text-1)",
              }}
            />
          ))}
          <button
            onClick={addProvider}
            disabled={!form.name.trim() || !form.apiUrl.trim()}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors duration-100 disabled:opacity-40 hover:bg-(--overlay) border outline-none mt-1"
            style={{ borderColor: "var(--border)", color: "var(--text-2)" }}
          >
            <Icon name={Plus} size="xs" />
            Provider hinzufügen
          </button>
        </div>
      </Section>
    </div>
  );
}
