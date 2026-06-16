"use client";

import { PrimaryButton } from "@/components";
import { useModal } from "@/context";
import React, { useState } from "react";

export default function DeleteConfirmModal({ title, description, onConfirm }) {
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      closeModal();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2
        className="text-base font-semibold mb-1.5"
        style={{ color: "var(--text-1)" }}
      >
        Delete {title}
      </h2>

      <p className="text-sm" style={{ color: "var(--text-2)" }}>
        {description}
      </p>

      <div className="flex justify-end items-center gap-2 mt-6">
        <PrimaryButton
          className="w-max px-3 border-(--border-med) hover:border-(--border-hi) justify-center"
          onClick={closeModal}
          disabled={loading}
        >
          Cancel
        </PrimaryButton>

        <PrimaryButton
          className="w-max px-4 min-w-24 justify-center border-none bg-red-500/50 hover:bg-red-700/50 text-white"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Deleting…" : "Delete"}
        </PrimaryButton>
      </div>
    </div>
  );
}
