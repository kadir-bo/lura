"use client";

import React, { useState } from "react";
import { LogOut, Trash2 } from "react-feather";
import { useAuth, useDatabase, useModal } from "@/context";
import { Icon } from "@/components";
import DeleteAccountModal from "@/components/modal/DeleteAccountModal";
import { Section, FieldRow } from "./shared";

export default function AccountSection() {
  const { user, logout } = useAuth();
  const { userProfile } = useDatabase();
  const { openModal, openMessage } = useModal();
  const [loggingOut, setLoggingOut] = useState(false);

  const username = userProfile?.displayName || user?.displayName || user?.email;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      openMessage("Logged out", "success");
    } catch {
      openMessage("Failed to log out", "error");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Section title="Account">
        <FieldRow label="Email">
          <span className="text-sm text-text-secondary">
            {user?.email}
          </span>
        </FieldRow>
        <FieldRow label="Name">
          <span className="text-sm text-text-secondary">
            {username}
          </span>
        </FieldRow>
      </Section>

      <Section title="Session">
        <div className="flex items-center justify-between py-2.5">
          <div>
            <p className="text-sm font-medium text-text-primary">
              Log out
            </p>
            <p className="text-xs mt-0.5 text-text-muted">
              Sign out of your account on this device
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors duration-100 hover:bg-overlay disabled:opacity-50"
            style={{ borderColor: "var(--border-med)", color: "var(--text-2)" }}
          >
            <Icon name={LogOut} size="xs" />
            {loggingOut ? "Logging outÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦" : "Log out"}
          </button>
        </div>
      </Section>

      <Section title="Danger Zone">
        <div
          className="flex items-center justify-between p-3 rounded-lg"
          style={{
            background: "rgba(239,68,68,0.04)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <div>
            <p className="text-sm font-medium text-text-primary">
              Delete Account
            </p>
            <p className="text-xs mt-0.5 text-text-muted">
              Permanently delete your account and all data
            </p>
          </div>
          <button
            onClick={() => openModal(<DeleteAccountModal />)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors duration-100 hover:bg-red-500/10 shrink-0"
            style={{ borderColor: "rgba(239,68,68,0.5)", color: "#ef4444" }}
          >
            <Icon name={Trash2} size="xs" />
            Delete Account
          </button>
        </div>
      </Section>
    </div>
  );
}
