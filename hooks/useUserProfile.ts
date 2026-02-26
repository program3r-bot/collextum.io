/**
 * Custom hook for managing user profile preferences
 * Persists preferences in localStorage
 */
"use client";

import { useState, useCallback, useEffect } from "react";

export interface UserProfile {
  displayName: string;
  preferredModel: string;
}

const DEFAULT_PROFILE: UserProfile = {
  displayName: "",
  preferredModel: "openai-gpt-4.1",
};

const STORAGE_KEY = "user-profile";

function loadProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_PROFILE;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Load from localStorage on mount
  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      setProfile((prev) => {
        const next = { ...prev, ...updates };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore storage errors
        }
        return next;
      });
    },
    []
  );

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }, []);

  return { profile, updateProfile, resetProfile };
}
