"use client";

import React, { useState, useEffect } from "react";
import { useAuth, useDatabase } from "@/context";
import { AvatarUpload } from "@/components";
import { Section, SaveBtn, FieldRow, SettingsInput } from "./shared";

export default function GeneralSection() {
  const { user } = useAuth();
  const { userProfile, updateUserProfile, uploadProfileImage } = useDatabase();

  const [fullName, setFullName] = useState(userProfile?.displayName || "");
  const [modelPreferences, setModelPreferences] = useState(
    userProfile?.preferences?.modelPreferences || "",
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    userProfile?.photoURL || null,
  );
  const [savedProfile, setSavedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  useEffect(() => {
    setSavedProfile({
      fullName: userProfile?.displayName || "",
      modelPreferences: userProfile?.preferences?.modelPreferences || "",
      avatarUrl: userProfile?.photoURL || null,
    });
    setFullName(userProfile?.displayName || "");
    setModelPreferences(userProfile?.preferences?.modelPreferences || "");
    setAvatarPreview(userProfile?.photoURL || null);
  }, [userProfile]);

  const profileChanged =
    savedProfile &&
    (fullName !== savedProfile.fullName ||
      avatarPreview !== savedProfile.avatarUrl);

  const prefsChanged =
    savedProfile && modelPreferences !== savedProfile.modelPreferences;

  const flashSaved = (setter) => {
    setter(true);
    setTimeout(() => setter(false), 2500);
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      let photoURL = savedProfile?.avatarUrl ?? null;
      if (avatarFile && typeof uploadProfileImage === "function") {
        photoURL = await uploadProfileImage(avatarFile);
      } else if (avatarPreview === null) {
        photoURL = null;
      }
      await updateUserProfile({ displayName: fullName, photoURL });
      setSavedProfile((p) => ({ ...p, fullName, avatarUrl: photoURL }));
      setAvatarFile(null);
      flashSaved(setProfileSaved);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSavePrefs = async () => {
    setPrefsLoading(true);
    try {
      await updateUserProfile({
        preferences: { ...userProfile?.preferences, modelPreferences },
      });
      setSavedProfile((p) => ({ ...p, modelPreferences }));
      flashSaved(setPrefsSaved);
    } finally {
      setPrefsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Profile"
        action={
          <SaveBtn
            hasChanges={profileChanged}
            loading={profileLoading}
            saved={profileSaved}
            onClick={handleSaveProfile}
          />
        }
      >
        <div
          className="flex items-center gap-4 pb-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <AvatarUpload
            currentUrl={avatarPreview}
            displayName={fullName}
            onChange={(file, preview) => {
              setAvatarFile(file);
              setAvatarPreview(preview);
            }}
          />
        </div>
        <FieldRow label="Full name">
          <SettingsInput
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        </FieldRow>
        <FieldRow label="Email">
          <SettingsInput value={user?.email || ""} onChange={() => {}} disabled />
        </FieldRow>
      </Section>

      <Section
        title="Instructions for Lura"
        action={
          <SaveBtn
            hasChanges={prefsChanged}
            loading={prefsLoading}
            saved={prefsSaved}
            onClick={handleSavePrefs}
          />
        }
      >
        <p className="text-xs mb-2" style={{ color: "var(--text-3)" }}>
          Lura will consider these preferences across all conversations.
        </p>
        <textarea
          value={modelPreferences}
          onChange={(e) => setModelPreferences(e.target.value)}
          placeholder="e.g. Keep explanations brief and to the point…"
          rows={4}
          className="w-full text-sm px-3 py-2.5 rounded-lg border outline-none resize-none"
          style={{
            background: "var(--elevated)",
            borderColor: "var(--border-med)",
            color: "var(--text-1)",
          }}
        />
      </Section>
    </div>
  );
}
