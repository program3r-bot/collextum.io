/**
 * Custom hook for managing user data with localStorage persistence
 */
import { useState, useCallback } from 'react';
import { ChatParameters } from './useChatParameters';

const STORAGE_KEY = 'collextum-user-data';

export interface UserData {
  selectedModel: string;
  parameters?: Partial<ChatParameters>;
}

const DEFAULT_USER_DATA: UserData = {
  selectedModel: 'openai-gpt-4.1',
};

function loadUserData(): UserData {
  if (typeof window === 'undefined') return DEFAULT_USER_DATA;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_USER_DATA;
    return { ...DEFAULT_USER_DATA, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_USER_DATA;
  }
}

function saveUserData(data: UserData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function useUserData() {
  const [userData, setUserData] = useState<UserData>(() => loadUserData());

  const updateUserData = useCallback((updates: Partial<UserData>) => {
    setUserData((prev) => {
      const updated = { ...prev, ...updates };
      saveUserData(updated);
      return updated;
    });
  }, []);

  return {
    userData,
    updateUserData,
  };
}
